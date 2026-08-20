import os
import shutil
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.analysis import AnalysisResult
from app.workers.analysis_task import run_background_analysis

router = APIRouter()

@router.post("/analyze")
async def analyze_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Uploads a Windows PE file and schedules it for static analysis in the background.
    """
    if not file.filename.lower().endswith(('.exe', '.dll', '.sys')):
        raise HTTPException(status_code=400, detail="Only Windows PE files (.exe, .dll, .sys) are supported.")
        
    # Save file temporarily
    fd, temp_path = tempfile.mkstemp(suffix=f"_{file.filename}")
    with os.fdopen(fd, "wb") as f:
        shutil.copyfileobj(file.file, f)
        
    # We could run this synchronously for now to ensure DB is populated before returning
    # Or in background. Given it's static analysis, it's fairly fast, but let's run background as spec'd.
    # To allow immediate feedback in the MVP, we run it synchronously here. 
    # For true background: background_tasks.add_task(run_background_analysis, temp_path, db)
    
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

@router.get("/report/{sha256}")
def get_analysis_report(sha256: str, db: Session = Depends(get_db)):
    """
    Retrieve the full JSON report for a specific file hash.
    """
    result = db.query(AnalysisResult).filter(AnalysisResult.sha256 == sha256).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return result.full_report
