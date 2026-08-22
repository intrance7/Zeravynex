"""
Structured logging configuration for Zeravynex.
Uses JSON structured logging in production, colored human-readable in development.
"""
import os
import sys
import logging
import time
from typing import Optional


class StructuredFormatter(logging.Formatter):
    """JSON-structured log formatter for production log aggregation (ELK, CloudWatch, Datadog)."""

    def format(self, record: logging.LogRecord) -> str:
        import json
        log_entry = {
            "timestamp": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S.%fZ"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info and record.exc_info[1]:
            log_entry["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        return json.dumps(log_entry)


class DevFormatter(logging.Formatter):
    """Colored human-readable formatter for local development."""

    COLORS = {
        "DEBUG": "\033[36m",    # Cyan
        "INFO": "\033[32m",     # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",    # Red
        "CRITICAL": "\033[41m", # Red background
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.RESET)
        timestamp = time.strftime("%H:%M:%S", time.localtime(record.created))
        return f"{color}[{timestamp}] {record.levelname:8s}{self.RESET} {record.name}: {record.getMessage()}"


def setup_logging(level: Optional[str] = None, env: Optional[str] = None) -> logging.Logger:
    """
    Configure application-wide logging.
    Returns the root 'zeravynex' logger.
    """
    log_level = getattr(logging, (level or os.environ.get("LOG_LEVEL", "INFO")).upper(), logging.INFO)
    environment = env or os.environ.get("APP_ENV", "development")

    # Root logger for the application
    logger = logging.getLogger("zeravynex")
    logger.setLevel(log_level)
    logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    if environment.lower() == "production":
        handler.setFormatter(StructuredFormatter())
    else:
        handler.setFormatter(DevFormatter())

    logger.addHandler(handler)

    # Quiet down noisy third-party loggers
    for noisy in ["uvicorn.access", "sqlalchemy.engine", "urllib3", "botocore"]:
        logging.getLogger(noisy).setLevel(logging.WARNING)

    return logger


# Module-level logger
logger = setup_logging()
