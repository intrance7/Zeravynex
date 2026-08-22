"""
Production middleware stack for Zeravynex.
Includes request ID tracking, security headers, rate limiting, and file size enforcement.
"""
import os
import time
import uuid
import logging
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

logger = logging.getLogger("zeravynex.middleware")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Injects a unique X-Request-ID header into every request/response for traceability."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        start_time = time.time()
        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms) [rid={request_id[:8]}]"
        )
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds production security headers to every response (OWASP recommended)."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory sliding window rate limiter for upload endpoints.
    For production with multiple API replicas, use Redis-backed rate limiting.
    """

    def __init__(self, app, max_requests: int = 10, window_seconds: int = 60, paths: list = None):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.paths = paths or ["/api/v1/analyze"]
        self.requests: dict = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        if request.url.path not in self.paths:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Clean old entries
        self.requests[client_ip] = [
            t for t in self.requests[client_ip]
            if now - t < self.window_seconds
        ]

        if len(self.requests[client_ip]) >= self.max_requests:
            retry_after = int(self.window_seconds - (now - self.requests[client_ip][0]))
            logger.warning(f"Rate limit exceeded for {client_ip} on {request.url.path}")
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Please wait before submitting another file.",
                    "retry_after_seconds": max(retry_after, 1)
                },
                headers={"Retry-After": str(max(retry_after, 1))}
            )

        self.requests[client_ip].append(now)
        return await call_next(request)


class FileSizeLimitMiddleware(BaseHTTPMiddleware):
    """Rejects uploads that exceed the configured maximum file size."""

    def __init__(self, app, max_size_mb: int = 100):
        super().__init__(app)
        self.max_size_bytes = max_size_mb * 1024 * 1024

    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and "/analyze" in request.url.path:
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.max_size_bytes:
                return JSONResponse(
                    status_code=413,
                    content={
                        "detail": f"File too large. Maximum allowed size is {self.max_size_bytes // (1024*1024)}MB."
                    }
                )
        return await call_next(request)
