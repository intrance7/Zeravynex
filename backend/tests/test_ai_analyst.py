import pytest
from app.engines.ai_analyst import AIAnalystEngine

def test_ai_analyst_mitre_mapping():
    engine = AIAnalystEngine()
    sample_report = {
        "file_info": {"file_name": "test_sample.exe"},
        "hashes": {"sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},
        "risk_analysis": {
            "risk_score": 85.0,
            "verdict": "CRITICAL MALWARE",
            "severity_level": "CRITICAL"
        },
        "heuristics": {
            "matches": [
                {
                    "rule_id": "HEUR_PROC_INJ_001",
                    "rule_name": "Process Injection Primitive",
                    "evidence": {"api": "VirtualAllocEx"}
                }
            ]
        },
        "yara_matches": [
            {
                "rule": "UPX_Packer",
                "description": "Packed executable signature"
            }
        ],
        "iocs": {
            "urls": ["http://malicious-c2.com/gate.php"],
            "ip_addresses": ["192.168.1.1"],
            "domains": ["malicious-c2.com"]
        },
        "imports": {"suspicious_imports": [{"function": "VirtualAllocEx"}]},
        "ml_analysis": {
            "malware_probability": 0.95,
            "confidence": "HIGH",
            "shap_explanation": {
                "top_pushing_malware": [
                    {"feature": "entropy", "shap_value": 0.45}
                ]
            }
        }
    }

    result = engine.analyze(sample_report)

    assert "executive_summary" in result
    assert "technical_explanation" in result
    assert "recommended_investigation_steps" in result
    assert "mitre_attack_mappings" in result
    assert len(result["recommended_investigation_steps"]) > 0

    # Verify MITRE ATT&CK matches
    mitre_ids = [m["technique_id"] for m in result["mitre_attack_mappings"]]
    assert "T1055" in mitre_ids # Process Injection
    assert "T1027.002" in mitre_ids # Software Packing
    assert "T1071.001" in mitre_ids # Web Protocols
