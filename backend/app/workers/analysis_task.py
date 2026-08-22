import os
import shutil
from pathlib import Path
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.cache import get_cache
from app.core.storage import get_storage_provider
from app.engines.static_analysis.analyzer import StaticAnalyzer
from app.models.analysis import AnalysisResult, ThreatIndicator

# Initialize analyzer (load ML model if path exists, otherwise uses defaults)
yara_dir = Path(__file__).resolve().parent.parent.parent / "yara_rules"
ml_model_path = Path(__file__).resolve().parent.parent.parent / "ml" / "models" / "rf_malware_model.joblib"

analyzer = StaticAnalyzer(
    yara_rules_dir=str(yara_dir) if yara_dir.exists() else None,
    model_path=str(ml_model_path) if ml_model_path.exists() else None
)


def _process_analysis(file_path: str, db: Session) -> Optional[AnalysisResult]:
    """Internal core analysis runner used by both synchronous and Celery workers."""
    path = Path(file_path)
    if not path.exists():
        return None

    try:
        # Run analysis pipeline
        report = analyzer.analyze(path)
        
        sha256 = report["hashes"]["sha256"]
        
        # Check if hash already exists in DB
        existing = db.query(AnalysisResult).filter(AnalysisResult.sha256 == sha256).first()
        if existing:
            # Update cache and return
            get_cache().set_report(sha256, existing.full_report)
            return existing

        # Extract fused risk details
        risk_summary = report.get("risk_analysis", {})
        
        # Create DB record
        db_result = AnalysisResult(
            file_name=path.name,
            sha256=sha256,
            md5=report["hashes"]["md5"],
            file_size_bytes=report["hashes"]["size_bytes"],
            risk_score=risk_summary.get("risk_score", 0.0),
            verdict=risk_summary.get("verdict", "UNKNOWN"),
            severity_level=risk_summary.get("severity_level", "INFO"),
            full_report=report
        )
        
        db.add(db_result)
        db.flush() # flush to get the ID for relationships
        
        # Add threat indicators from the breakdown
        evidence_breakdown = risk_summary.get("evidence_breakdown", [])
        for evidence in evidence_breakdown:
            indicator = ThreatIndicator(
                analysis_id=db_result.id,
                source=evidence.get("source"),
                rule_name=evidence.get("rule"),
                severity=evidence.get("severity"),
                weight=evidence.get("weight"),
                details=evidence.get("details")
            )
            db.add(indicator)
            
        db.commit()
        db.refresh(db_result)

        # Store in Redis/memory cache
        get_cache().set_report(sha256, report)

        return db_result

    except Exception as e:
        db.rollback()
        raise e


def run_background_analysis(file_path: str, db: Session) -> Optional[AnalysisResult]:
    """Synchronous execution wrapper for standalone / non-Celery operation."""
    path = Path(file_path)
    try:
        return _process_analysis(file_path, db)
    finally:
        # Clean up temporary uploaded file if in temp directory
        if path.exists() and "tmp" in str(path).lower():
            try:
                os.remove(path)
            except Exception:
                pass


# Celery Task Definition (imported when Celery worker starts)
try:
    from app.core.celery_app import celery_app

    @celery_app.task(bind=True, name="zeravynex.analyze_file")
    def analyze_file_task(self, storage_identifier: str, original_filename: str) -> Dict[str, Any]:
        """
        Distributed Celery task for background static analysis.
        Retrieves file from StorageProvider, executes pipeline, saves to DB & Cache.
        """
        self.update_state(state="PROGRESS", meta={"status": "Retrieving sample from storage"})
        storage = get_storage_provider()
        local_path = storage.get_file_path(storage_identifier)

        if not local_path or not Path(local_path).exists():
            raise FileNotFoundError(f"Failed to access sample: {storage_identifier}")

        self.update_state(state="PROGRESS", meta={"status": "Running static, YARA, ML & SHAP analysis"})
        
        db = SessionLocal()
        try:
            result = _process_analysis(local_path, db)
            if not result:
                raise RuntimeError("Analysis returned empty result")

            return {
                "status": "completed",
                "analysis_id": result.id,
                "sha256": result.sha256,
                "verdict": result.verdict,
                "risk_score": result.risk_score
            }
        finally:
            db.close()
except ImportError:
    pass

