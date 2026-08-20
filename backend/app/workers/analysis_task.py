import os
import shutil
from pathlib import Path
from sqlalchemy.orm import Session
from app.engines.static_analysis.analyzer import StaticAnalyzer
from app.models.analysis import AnalysisResult, ThreatIndicator

# Initialize analyzer (load ML model if path exists, otherwise uses defaults)
# Adjust model_path and yara_rules_dir as needed.
yara_dir = Path(__file__).resolve().parent.parent.parent / "yara_rules"
ml_model_path = Path(__file__).resolve().parent.parent.parent / "ml" / "models" / "rf_malware_model.joblib"

analyzer = StaticAnalyzer(
    yara_rules_dir=str(yara_dir) if yara_dir.exists() else None,
    model_path=str(ml_model_path) if ml_model_path.exists() else None
)

def run_background_analysis(file_path: str, db: Session):
    """
    Executes the static analysis pipeline on a file and saves the result to the database.
    """
    path = Path(file_path)
    
    if not path.exists():
        return None

    try:
        # Run analysis
        report = analyzer.analyze(path)
        
        # Check if hash already exists in DB
        sha256 = report["hashes"]["sha256"]
        existing = db.query(AnalysisResult).filter(AnalysisResult.sha256 == sha256).first()
        
        if existing:
            # Optionally update it, but for now we skip duplicate processing.
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
        return db_result
        
    except Exception as e:
        db.rollback()
        raise e
    finally:
        # Clean up temporary uploaded file
        if path.exists():
            try:
                os.remove(path)
            except:
                pass
