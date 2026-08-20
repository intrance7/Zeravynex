import sys
from pathlib import Path
import pytest

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.engines.ml.feature_extractor import PEFeatureExtractor, FEATURE_NAMES
from app.engines.ml.classifier import MalwareClassifier
from app.engines.ml.explainer import SHAPExplainer
from app.engines.static_analysis.analyzer import StaticAnalyzer


def test_feature_extractor():
    sample_report = {
        "hashes": {"size_bytes": 123456, "entropy": 6.8},
        "pe_header": {"is_pe": True, "number_of_sections": 5},
        "sections": [
            {"name": ".text", "entropy": 6.5, "is_rwx": False, "is_executable": True, "is_writable": False},
            {"name": ".data", "entropy": 7.2, "is_rwx": True, "is_executable": True, "is_writable": True}
        ],
        "imports_exports": {
            "total_imported_functions": 25,
            "total_exported_functions": 2,
            "suspicious_apis": [{"api": "VirtualAllocEx", "category": "Process Injection & Execution"}]
        },
        "strings_summary": {
            "total_strings": 150,
            "entropy": 4.5,
            "suspicious_keyword_matches": [{"string": "powershell", "category": "Shell & Command Execution"}]
        },
        "iocs": {"urls": ["http://evil-c2.com/drop.exe"], "ip_addresses": ["1.2.3.4"], "domains": [], "registry_keys": []},
        "heuristic_analysis": {"total_heuristic_matches": 2}
    }

    ext = PEFeatureExtractor.extract_features(sample_report)
    assert len(ext["feature_names"]) == 25
    assert len(ext["feature_vector"]) == 25
    assert ext["feature_dict"]["file_entropy"] == 6.8
    assert ext["feature_dict"]["rwx_sections_count"] == 1.0


def test_malware_classifier():
    classifier = MalwareClassifier()
    sample_report = {
        "hashes": {"size_bytes": 100000, "entropy": 7.8},
        "pe_header": {"is_pe": True, "number_of_sections": 4},
        "sections": [{"name": ".rwx", "entropy": 7.9, "is_rwx": True, "is_executable": True, "is_writable": True}],
        "imports_exports": {
            "total_imported_functions": 10,
            "total_exported_functions": 0,
            "suspicious_apis": [
                {"api": "VirtualAllocEx", "category": "Process Injection & Execution"},
                {"api": "WriteProcessMemory", "category": "Process Injection & Execution"}
            ]
        },
        "strings_summary": {
            "total_strings": 50,
            "entropy": 5.0,
            "suspicious_keyword_matches": [{"string": "vssadmin delete shadows", "category": "Ransomware Indicators"}]
        },
        "iocs": {"urls": ["http://bad-c2.net"], "ip_addresses": [], "domains": [], "registry_keys": []},
        "heuristic_analysis": {"total_heuristic_matches": 3}
    }

    res = classifier.predict(sample_report)
    assert "malware_probability" in res
    assert "prediction" in res
    assert res["malware_probability"] >= 0.50
    assert res["prediction"] == "MALWARE"


def test_shap_explainer():
    classifier = MalwareClassifier()
    explainer = SHAPExplainer(classifier_model=classifier.rf_model)
    
    sample_report = {
        "hashes": {"size_bytes": 100000, "entropy": 7.8},
        "pe_header": {"is_pe": True, "number_of_sections": 4},
        "sections": [{"name": ".rwx", "entropy": 7.9, "is_rwx": True, "is_executable": True, "is_writable": True}],
        "imports_exports": {
            "total_imported_functions": 10,
            "total_exported_functions": 0,
            "suspicious_apis": [{"api": "VirtualAllocEx", "category": "Process Injection & Execution"}]
        },
        "strings_summary": {"total_strings": 50, "entropy": 5.0, "suspicious_keyword_matches": []},
        "iocs": {"urls": [], "ip_addresses": [], "domains": [], "registry_keys": []},
        "heuristic_analysis": {"total_heuristic_matches": 2}
    }

    pred = classifier.predict(sample_report)
    exp = explainer.explain(pred)

    assert "feature_contributions" in exp
    assert "top_malware_indicators" in exp
    assert len(exp["feature_contributions"]) == 25


def test_end_to_end_ml_analyzer(tmp_path):
    binary = tmp_path / "sample_ml.exe"
    binary.write_bytes(b"MZ" + b"\x00" * 200 + b"VirtualAllocEx WriteProcessMemory http://evil.org")

    analyzer = StaticAnalyzer()
    report = analyzer.analyze(binary)

    assert "ml_analysis" in report
    assert "malware_probability" in report["ml_analysis"]
    assert "shap_explainability" in report["ml_analysis"]
    assert report["metadata"]["engine_version"].startswith("Zeravynex Phase")
