import sys
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.database import Base
from app.models.analysis import AnalysisResult, ThreatIndicator

@pytest.fixture
def db_session():
    # Use in-memory SQLite for testing
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_create_analysis_result(db_session):
    analysis = AnalysisResult(
        file_name="test.exe",
        sha256="abcd1234abcd1234abcd1234abcd1234",
        md5="1234abcd",
        file_size_bytes=1024,
        risk_score=95.0,
        verdict="CRITICAL MALWARE",
        severity_level="CRITICAL",
        full_report={"dummy": "data"}
    )
    db_session.add(analysis)
    db_session.commit()
    
    retrieved = db_session.query(AnalysisResult).filter_by(sha256="abcd1234abcd1234abcd1234abcd1234").first()
    assert retrieved is not None
    assert retrieved.file_name == "test.exe"
    assert retrieved.risk_score == 95.0

def test_threat_indicators_relationship(db_session):
    analysis = AnalysisResult(
        file_name="malware.exe",
        sha256="1111",
        risk_score=80.0
    )
    db_session.add(analysis)
    db_session.flush() # get ID
    
    indicator = ThreatIndicator(
        analysis_id=analysis.id,
        source="Heuristic Engine",
        rule_name="RWX Section",
        severity="HIGH",
        weight=30.0
    )
    db_session.add(indicator)
    db_session.commit()
    
    retrieved = db_session.query(AnalysisResult).first()
    assert len(retrieved.indicators) == 1
    assert retrieved.indicators[0].rule_name == "RWX Section"
