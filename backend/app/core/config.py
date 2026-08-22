"""
Centralized configuration using Pydantic Settings.
All environment variables are validated at startup with sensible defaults
for local development and overridable for production deployment.
"""
import os
from typing import Optional, List
from pathlib import Path
from functools import lru_cache


class Settings:
    """Application settings loaded from environment variables with defaults."""

    # === Application ===
    APP_NAME: str = os.environ.get("APP_NAME", "Zeravynex")
    APP_ENV: str = os.environ.get("APP_ENV", "development")
    DEBUG: bool = os.environ.get("DEBUG", "true").lower() in ("true", "1")
    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "INFO")
    VERSION: str = "2.0.0"

    # === Server ===
    HOST: str = os.environ.get("HOST", "0.0.0.0")
    PORT: int = int(os.environ.get("PORT", "8000"))
    WORKERS: int = int(os.environ.get("WORKERS", "1"))

    # === Database ===
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "sqlite:///./zeravynex.db")
    DB_POOL_SIZE: int = int(os.environ.get("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW: int = int(os.environ.get("DB_MAX_OVERFLOW", "20"))
    DB_POOL_RECYCLE: int = int(os.environ.get("DB_POOL_RECYCLE", "1800"))

    # === Redis & Cache ===
    REDIS_URL: Optional[str] = os.environ.get("REDIS_URL")
    CACHE_TTL_SECONDS: int = int(os.environ.get("CACHE_TTL_SECONDS", "86400"))

    # === Celery Task Queue ===
    USE_CELERY: bool = os.environ.get("USE_CELERY", "false").lower() in ("true", "1")
    CELERY_BROKER_URL: str = os.environ.get("CELERY_BROKER_URL", os.environ.get("REDIS_URL", "redis://localhost:6379/0"))
    CELERY_RESULT_BACKEND: str = os.environ.get("CELERY_RESULT_BACKEND", os.environ.get("REDIS_URL", "redis://localhost:6379/0"))

    # === Storage ===
    STORAGE_BACKEND: str = os.environ.get("STORAGE_BACKEND", "local")
    SAMPLES_DIR: str = os.environ.get("SAMPLES_DIR", "./samples")
    S3_BUCKET_NAME: str = os.environ.get("S3_BUCKET_NAME", "zeravynex-samples")
    S3_ENDPOINT_URL: Optional[str] = os.environ.get("S3_ENDPOINT_URL")
    AWS_ACCESS_KEY_ID: str = os.environ.get("AWS_ACCESS_KEY_ID", "minioadmin")
    AWS_SECRET_ACCESS_KEY: str = os.environ.get("AWS_SECRET_ACCESS_KEY", "minioadmin")
    AWS_REGION: str = os.environ.get("AWS_REGION", "us-east-1")

    # === File Upload ===
    MAX_UPLOAD_SIZE_MB: int = int(os.environ.get("MAX_UPLOAD_SIZE_MB", "100"))
    ALLOWED_EXTENSIONS: List[str] = os.environ.get("ALLOWED_EXTENSIONS", ".exe,.dll,.sys").split(",")

    # === CORS ===
    CORS_ORIGINS: List[str] = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:80,http://localhost:3000").split(",")

    # === Rate Limiting ===
    RATE_LIMIT_UPLOADS_PER_MIN: int = int(os.environ.get("RATE_LIMIT_UPLOADS_PER_MIN", "10"))

    # === Analysis Engines ===
    YARA_RULES_DIR: str = os.environ.get("YARA_RULES_DIR", str(Path(__file__).resolve().parent.parent.parent / "yara_rules"))
    ML_MODEL_PATH: str = os.environ.get("ML_MODEL_PATH", str(Path(__file__).resolve().parent.parent.parent / "ml" / "models" / "rf_malware_model.joblib"))

    # === AI Analyst ===
    LLM_PROVIDER: Optional[str] = os.environ.get("LLM_PROVIDER")
    OPENAI_API_KEY: Optional[str] = os.environ.get("OPENAI_API_KEY")
    GEMINI_API_KEY: Optional[str] = os.environ.get("GEMINI_API_KEY")
    OLLAMA_BASE_URL: Optional[str] = os.environ.get("OLLAMA_BASE_URL")

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @property
    def is_sqlite(self) -> bool:
        return "sqlite" in self.DATABASE_URL


@lru_cache()
def get_settings() -> Settings:
    """Returns singleton Settings instance, cached for the process lifetime."""
    return Settings()
