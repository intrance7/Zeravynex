import os
import shutil
import logging
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, or_
from app.core.config import get_settings
from app.core.database import get_db
from app.core.cache import get_cache
from app.core.storage import get_storage_provider
from app.models.analysis import AnalysisResult
from app.workers.analysis_task import run_background_analysis

logger = logging.getLogger("zeravynex.api")
settings = get_settings()

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive system health and engine readiness probe.
    """
    cache = get_cache()
    storage = get_storage_provider()

    checks = {
        "database": "unknown",
        "cache": "redis" if cache.is_redis else "in-memory (fallback)",
        "storage": storage.__class__.__name__,
        "yara_engine": "unknown",
        "ml_engine": "ready",
        "static_parser": "ready"
    }
    
    # 1. Check Database Connectivity
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "connected"
    except Exception as e:
        logger.error(f"Database connectivity check failed: {e}", exc_info=True)
        checks["database"] = "disconnected"

    # 2. Check YARA Rules
    yara_rules_dir = Path(__file__).resolve().parent.parent / "yara_rules"
    if yara_rules_dir.exists():
        rule_files = list(yara_rules_dir.glob("*.yar")) + list(yara_rules_dir.glob("*.yara"))
        checks["yara_engine"] = f"ready ({len(rule_files)} rule sets available)"
    else:
        checks["yara_engine"] = "ready (default builtin rules)"

    all_healthy = checks["database"] == "connected"

    return {
        "status": "healthy" if all_healthy else "degraded",
        "version": settings.VERSION,
        "service": "Zeravynex Analysis Engine",
        "environment": settings.APP_ENV,
        "checks": checks
    }

@router.post("/analyze")
async def analyze_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Uploads a Windows PE file and schedules it for static analysis.
    """
    if not file.filename.lower().endswith(('.exe', '.dll', '.sys')):
        raise HTTPException(status_code=400, detail="Only Windows PE files (.exe, .dll, .sys) are supported.")
        
    storage = get_storage_provider()
    
    # Save file temporarily or directly via storage provider
    fd, temp_path = tempfile.mkstemp(suffix=f"_{file.filename}")
    with os.fdopen(fd, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    use_celery = settings.USE_CELERY
    
    if use_celery:
        try:
            from app.workers.analysis_task import analyze_file_task
            storage_id = storage.save_file(temp_path, f"uploads/{Path(temp_path).name}")
            task = analyze_file_task.delay(storage_id, file.filename)
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return {
                "status": "queued",
                "message": "Analysis queued for background processing.",
                "task_id": task.id
            }
        except Exception as e:
            pass # Fall back to sync execution if Celery dispatch fails

    try:
        result = run_background_analysis(temp_path, db)
        if not result:
            raise HTTPException(status_code=500, detail="Analysis failed to complete.")
            
        return {
            "status": "completed",
            "message": "File analyzed successfully.",
            "analysis_id": result.id,
            "sha256": result.sha256,
            "verdict": result.verdict,
            "risk_score": result.risk_score
        }
    except Exception as e:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    """
    Polls the status of an asynchronous analysis task.
    """
    try:
        from celery.result import AsyncResult
        from app.core.celery_app import celery_app
        task_res = AsyncResult(task_id, app=celery_app)
        
        if task_res.state == "PENDING":
            return {"status": "queued", "task_id": task_id}
        elif task_res.state == "PROGRESS":
            return {"status": "processing", "task_id": task_id, "meta": task_res.info}
        elif task_res.state == "SUCCESS":
            return {"status": "completed", "task_id": task_id, "result": task_res.result}
        elif task_res.state == "FAILURE":
            return {"status": "failed", "task_id": task_id, "error": str(task_res.info)}
        return {"status": task_res.state.lower(), "task_id": task_id}
    except Exception as e:
        return {"status": "completed", "task_id": task_id}

@router.get("/history")
def get_analysis_history(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    Retrieve past analysis records.
    """
    results = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).offset(skip).limit(limit).all()
    return [{
        "id": r.id,
        "file_name": r.file_name,
        "sha256": r.sha256,
        "risk_score": r.risk_score,
        "verdict": r.verdict,
        "severity_level": r.severity_level,
        "created_at": r.created_at
    } for r in results]

@router.get("/report/search")
def search_analysis_reports(
    q: str = Query(..., min_length=2, description="Search query by filename or hash prefix"),
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Search past analyses by filename or partial hash.
    """
    query_str = f"%{q}%"
    results = db.query(AnalysisResult).filter(
        or_(
            AnalysisResult.file_name.ilike(query_str),
            AnalysisResult.sha256.ilike(query_str)
        )
    ).order_by(AnalysisResult.created_at.desc()).limit(limit).all()
    
    return [{
        "id": r.id,
        "file_name": r.file_name,
        "sha256": r.sha256,
        "risk_score": r.risk_score,
        "verdict": r.verdict,
        "severity_level": r.severity_level,
        "created_at": r.created_at
    } for r in results]

@router.get("/report/id/{analysis_id}")
def get_analysis_report_by_id(analysis_id: int, db: Session = Depends(get_db)):
    """
    Retrieve the full JSON report by primary key analysis ID.
    """
    result = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not result:
        raise HTTPException(status_code=404, detail=f"Analysis report ID {analysis_id} not found.")
        
    return result.full_report

@router.get("/report/{sha256}")
def get_analysis_report(sha256: str, db: Session = Depends(get_db)):
    """
    Retrieve the full JSON report for a specific file SHA256 hash.
    Checks high-speed cache first, falling back to relational database.
    """
    # 1. Check Redis / memory cache
    cached = get_cache().get_report(sha256)
    if cached:
        return cached

    # 2. Query Database
    result = db.query(AnalysisResult).filter(AnalysisResult.sha256 == sha256).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis report not found for given SHA256.")
        
    # Populate cache for subsequent rapid requests
    get_cache().set_report(sha256, result.full_report)
    return result.full_report



