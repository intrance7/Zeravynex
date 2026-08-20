import sys
from pathlib import Path
import pytest

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.engines.decision_fusion import DecisionFusionEngine


def test_decision_fusion_default_policy():
    engine = DecisionFusionEngine()
    
    # Simulate a highly malicious file
    res = engine.fuse(
        ml_prob=0.95,
        heuristic_matches=[
            {"rule_name": "RWX Section", "severity": "HIGH", "weight": 30},
            {"rule_name": "Ransom Note", "severity": "CRITICAL", "weight": 50}
        ],
        yara_matches=[
            {"rule": "UPX", "severity": "MEDIUM"}
        ],
        ioc_data={
            "urls": ["http://evil.com/c2"]
        }
    )
    
    assert res["components"]["ml_score"] == 95.0
    assert res["components"]["heuristics_score"] == 80.0
    assert res["components"]["yara_score"] == 15.0
    assert res["components"]["ioc_score"] == 20.0
    
    # 95 * 0.35 + 80 * 0.30 + 15 * 0.25 + 20 * 0.10
    # 33.25 + 24.0 + 3.75 + 2.0 = 63.0
    assert res["risk_score"] == 63.0
    assert res["verdict"] == "HIGH RISK"


def test_decision_fusion_capping():
    engine = DecisionFusionEngine()
    
    # Max out heuristics and YARA
    res = engine.fuse(
        ml_prob=1.0,
        heuristic_matches=[{"severity": "CRITICAL", "weight": 50} for _ in range(5)],
        yara_matches=[{"severity": "CRITICAL"} for _ in range(5)],
        ioc_data={"urls": ["u1", "u2", "u3", "u4", "u5", "u6"]}
    )
    
    # Capped at 100
    assert res["components"]["heuristics_score"] == 100.0
    assert res["components"]["yara_score"] == 100.0
    assert res["components"]["ioc_score"] == 100.0
    assert res["components"]["ml_score"] == 100.0
    
    assert res["risk_score"] == 100.0
    assert res["verdict"] == "CRITICAL MALWARE"


def test_decision_fusion_clean():
    engine = DecisionFusionEngine()
    
    res = engine.fuse(
        ml_prob=0.01,
        heuristic_matches=[],
        yara_matches=[],
        ioc_data={}
    )
    
    assert res["risk_score"] < 5.0
    assert res["verdict"] == "CLEAN / LOW RISK"
