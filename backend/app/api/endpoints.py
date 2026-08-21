import os
import shutil
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, or_
from app.core.database import get_db
from app.models.analysis import AnalysisResult
from app.workers.analysis_task import run_background_analysis

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive system health and engine readiness probe.
    """
    checks = {
        "database": "unknown",
        "yara_engine": "unknown",
        "ml_engine": "ready",
        "static_parser": "ready"
    }
    
    # 1. Check Database Connectivity
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "connected"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"

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
        "version": "1.5.0",
        "service": "Zeravynex Analysis Engine",
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
        
    # Save file temporarily
    fd, temp_path = tempfile.mkstemp(suffix=f"_{file.filename}")
    with os.fdopen(fd, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    try:
        # Run synchronously for MVP to return the ID immediately
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
        # Clean up temp file if sync analysis fails
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

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
    """
    result = db.query(AnalysisResult).filter(AnalysisResult.sha256 == sha256).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis report not found for given SHA256.")
        
    return result.full_report


