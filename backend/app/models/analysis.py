from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, index=True)
    sha256 = Column(String, unique=True, index=True)
    md5 = Column(String, index=True)
    file_size_bytes = Column(Integer)
    
    # Analysis outputs
    risk_score = Column(Float)
    verdict = Column(String)
    severity_level = Column(String)
    
    # Store full JSON report for easy retrieval and dashboard display
    full_report = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    indicators = relationship("ThreatIndicator", back_populates="analysis", cascade="all, delete-orphan")


class ThreatIndicator(Base):
    __tablename__ = "threat_indicators"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analysis_results.id", ondelete="CASCADE"))
    
    source = Column(String) # "Heuristic Engine", "YARA Engine", "IOC Extractor"
    rule_name = Column(String)
    severity = Column(String)
    weight = Column(Float)
    
    details = Column(JSON, nullable=True)

    analysis = relationship("AnalysisResult", back_populates="indicators")
