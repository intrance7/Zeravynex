"""
Zeravynex Application Entry Point.
Production-grade FastAPI application with middleware stack, structured logging,
CORS configuration, and graceful startup/shutdown lifecycle hooks.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.core.database import engine, Base
from app.core.middleware import (
    RequestIDMiddleware,
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
    FileSizeLimitMiddleware,
)
from app.api.endpoints import router as api_router

settings = get_settings()
logger = setup_logging(level=settings.LOG_LEVEL, env=settings.APP_ENV)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown hooks."""
    # --- Startup ---
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION} [{settings.APP_ENV}]")
    Base.metadata.create_all(bind=engine)
    logger.info(f"Database connected: {'SQLite' if settings.is_sqlite else 'PostgreSQL'}")

    if settings.REDIS_URL:
        logger.info(f"Redis cache configured: {settings.REDIS_URL.split('@')[-1] if '@' in settings.REDIS_URL else settings.REDIS_URL}")

    if settings.USE_CELERY:
        logger.info("Celery distributed task queue: ENABLED")

    logger.info(f"Storage backend: {settings.STORAGE_BACKEND.upper()}")
    logger.info("All analysis engines initialized. Server ready to accept requests.")

    yield

    # --- Shutdown ---
    logger.info("Shutting down Zeravynex. Cleaning up resources...")
    engine.dispose()
    logger.info("Database connections released. Shutdown complete.")


# ── FastAPI Application ──────────────────────────────────────────────────────

app = FastAPI(
    title="Zeravynex Analysis API",
    description=(
        "Production API for the Zeravynex Explainable AI Static Malware Analysis Platform. "
        "Provides PE binary upload, multi-engine threat triage (Static, YARA, ML/SHAP, Heuristics), "
        "decision fusion risk scoring, MITRE ATT&CK mapping, and comprehensive report retrieval."
    ),
    version=settings.VERSION,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)


# ── Middleware Stack (applied in reverse order) ──────────────────────────────

# 1. Request ID + Response Timing (outermost)
app.add_middleware(RequestIDMiddleware)

# 2. Security Headers (OWASP)
app.add_middleware(SecurityHeadersMiddleware)

# 3. Rate Limiting on upload endpoint
app.add_middleware(
    RateLimitMiddleware,
    max_requests=settings.RATE_LIMIT_UPLOADS_PER_MIN,
    window_seconds=60,
    paths=["/api/v1/analyze"],
)

# 4. File Size Enforcement
app.add_middleware(FileSizeLimitMiddleware, max_size_mb=settings.MAX_UPLOAD_SIZE_MB)

# 5. CORS
if settings.is_production:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# ── Routes ───────────────────────────────────────────────────────────────────

app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["System"])
def read_root():
    """Root endpoint returning service identity and status."""
    return {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "online",
        "environment": settings.APP_ENV,
    }
