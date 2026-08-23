import html
import json
import sys
import tempfile
from pathlib import Path
import pytest

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.engines.static_analysis.hashing import Hasher, calculate_entropy
from app.engines.static_analysis.pe_parser import PEParser
from app.engines.static_analysis.sections import SectionAnalyzer
from app.engines.static_analysis.imports_exports import ImportsExportsAnalyzer, SUSPICIOUS_API_CATEGORIES
from app.engines.static_analysis.strings import StringExtractor
from app.engines.static_analysis.ioc_extractor import IOCExtractor
from app.engines.static_analysis.analyzer import StaticAnalyzer
from app.engines.heuristic_engine import HeuristicEngine
from app.engines.yara_engine import YARAEngine
from app.engines.decision_fusion import DecisionFusionEngine


def test_entropy_calculation():
    assert calculate_entropy(b"AAAAAAA") == 0.0
    full_byte_array = bytes(range(256))
    assert calculate_entropy(full_byte_array) == 8.0


def test_hasher(tmp_path):
    test_file = tmp_path / "test.bin"
    test_file.write_bytes(b"Zeravynex Malware Analysis Test File")

    res = Hasher.hash_file(test_file)
    assert "md5" in res
    assert "sha1" in res
    assert "sha256" in res
    assert res["size_bytes"] == len(b"Zeravynex Malware Analysis Test File")
    assert res["entropy"] > 0.0


def test_non_pe_parser(tmp_path):
    text_file = tmp_path / "plain.txt"
    text_file.write_text("Hello World!")

    res = PEParser.parse_header(text_file)
    assert res["is_pe"] is False
    assert "Not a valid Portable Executable" in res["error"]


def test_string_extractor(tmp_path):
    sample_file = tmp_path / "strings.bin"
    content = (
        b"Normal string\x00\x00"
        b"powershell -ExecutionPolicy Bypass -Command iex\x00\x00"
        b"http://malicious-domain.com/payload.exe\x00\x00"
    )
    sample_file.write_bytes(content)

    strings_res = StringExtractor.extract_strings(sample_file, min_len=4)
    assert strings_res["total_strings_found"] >= 3
    matches = strings_res["suspicious_keyword_matches"]
    categories = [m["category"] for m in matches]
    assert "Shell & Command Execution" in categories


def test_ioc_extractor():
    sample_strings = [
        "Connecting to http://185.220.101.5/beacon.php...",
        "Updating registry key HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
        "Created mutex Global\\ZeravynexTestMutex",
        "Contacting C2 domain bad-actor-c2.net"
    ]
    iocs = IOCExtractor.extract_iocs(sample_strings)
    assert "http://185.220.101.5/beacon.php" in iocs["urls"]
    assert "185.220.101.5" in iocs["ip_addresses"]
    assert "bad-actor-c2.net" in set(iocs["domains"])
    assert "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" in iocs["registry_keys"]
    assert "Global\\ZeravynexTestMutex" in iocs["mutexes"]


def test_heuristic_engine():
    dummy_report = {
        "sections": [{"name": ".text", "is_rwx": True, "entropy": 7.5}],
        "imports_exports": {
            "suspicious_apis": [
                {"api": "VirtualAllocEx", "category": "Process Injection & Execution"},
                {"api": "WriteProcessMemory", "category": "Process Injection & Execution"}
            ]
        },
        "strings_summary": {
            "suspicious_keyword_matches": [{"string": "YOUR FILES HAVE BEEN ENCRYPTED", "category": "Ransomware Indicators"}]
        },
        "iocs": {"urls": ["http://evil.com/c2"]}
    }
    matches = HeuristicEngine.evaluate(dummy_report)
    assert len(matches) >= 3
    rule_ids = [m["rule_id"] for m in matches]
    assert "HEUR_RWX_SECTION" in rule_ids
    assert "HEUR_RANSOMWARE_STRINGS" in rule_ids


def test_yara_engine(tmp_path):
    upx_binary = tmp_path / "upx_sample.exe"
    upx_binary.write_bytes(b"MZ" + b"\x00" * 100 + b"UPX0" + b"\x00" * 50 + b"UPX1")

    engine = YARAEngine()
    scan_res = engine.scan_file(upx_binary)
    assert "matches" in scan_res
    matched_rules = [m["rule"] for m in scan_res["matches"]]
    assert "UPX_Packed_Binary" in matched_rules





def test_phase2_end_to_end(tmp_path):
    sample = tmp_path / "malicious.exe"
    sample.write_bytes(
        b"MZ" + b"\x00" * 100 +
        b"UPX0\x00UPX1\x00" +
        b"vssadmin delete shadows\x00" +
        b"VirtualAllocEx\x00WriteProcessMemory\x00CreateRemoteThread\x00" +
        b"http://attacker-c2.org/drop.exe"
    )

    analyzer = StaticAnalyzer()
    report = analyzer.analyze(sample)

    assert "risk_analysis" in report
    assert "heuristic_analysis" in report
    assert "yara_analysis" in report
    assert report["risk_analysis"]["risk_score"] >= 0
    assert report["metadata"]["engine_version"].startswith("Zeravynex Phase")


@pytest.fixture
def mock_report_data():
    """Return a deterministic static analysis report dictionary for CLI testing."""
    return {
        "metadata": {"file_name": "<script>alert('xss')</script>.exe", "engine_version": "Zeravynex Phase 2"},
        "hashes": {"sha256": "abc123sha256", "md5": "abc123md5", "sha1": "abc123sha1", "size_bytes": 1024, "entropy": 6.5},
        "pe_header": {"is_pe": True, "architecture": "x86_64", "file_type": "Executable", "entry_point": "0x1000", "compile_timestamp": "2026-01-01"},
        "sections": [{"name": ".text"}],
        "imports_exports": {"total_imported_functions": 10, "imports": {"kernel32.dll": ["VirtualAlloc"]}},
        "risk_analysis": {"verdict": "MALICIOUS", "risk_score": 85, "severity_level": "CRITICAL"},
        "ml_analysis": {
            "prediction": "Malware",
            "malware_probability": 0.95,
            "architecture": "RandomForest",
            "shap_explainability": {
                "explanation_summary": "High risk detected",
                "top_malware_indicators": [{"feature_name": "entropy", "feature_value": "6.5", "shap_value": 0.45}]
            }
        },
        "heuristic_analysis": {
            "total_heuristic_matches": 1,
            "matches": [{"severity": "HIGH", "rule_name": "HEUR_RWX", "description": "RWX section found", "weight": 40}]
        },
        "yara_analysis": {
            "total_matches": 1,
            "matches": [{"severity": "CRITICAL", "rule": "Suspicious_Imports", "category": "Execution"}]
        },
        "iocs": {
            "urls": ["http://evil-c2.com/payload?cmd=<script>"],
            "ip_addresses": ["1.2.3.4"],
            "domains": ["evil-c2.com"],
            "registry_keys": ["HKLM\\Run\\Malware"],
            "mutexes": ["Global\\TestMutex"]
        }
    }


def test_cli_json_export_options(tmp_path, monkeypatch, mock_report_data):
    """Test CLI JSON export flags and aliases (--json, --output-json, -o, --output)."""
    from app.engines.static_analysis import cli

    monkeypatch.setattr(cli.StaticAnalyzer, "analyze", lambda self, path: mock_report_data)

    sample_bin = tmp_path / "sample.exe"
    sample_bin.write_bytes(b"MZtest")

    # Test --json flag
    json_out1 = tmp_path / "report1.json"
    cli.main([str(sample_bin), "--json", str(json_out1)])
    assert json_out1.exists()
    data1 = json.loads(json_out1.read_text(encoding="utf-8"))
    assert data1["hashes"]["sha256"] == "abc123sha256"

    # Test --output-json alias
    json_out2 = tmp_path / "report2.json"
    cli.main([str(sample_bin), "--output-json", str(json_out2)])
    assert json_out2.exists()

    # Test legacy -o and --output aliases
    json_out3 = tmp_path / "report3.json"
    cli.main([str(sample_bin), "-o", str(json_out3)])
    assert json_out3.exists()

    json_out4 = tmp_path / "report4.json"
    cli.main([str(sample_bin), "--output", str(json_out4)])
    assert json_out4.exists()


def test_cli_html_export_options(tmp_path, monkeypatch, mock_report_data):
    """Test CLI HTML export flags (--html, --output-html)."""
    from app.engines.static_analysis import cli

    monkeypatch.setattr(cli.StaticAnalyzer, "analyze", lambda self, path: mock_report_data)

    sample_bin = tmp_path / "sample.exe"
    sample_bin.write_bytes(b"MZtest")

    # Test --html flag
    html_out1 = tmp_path / "report1.html"
    cli.main([str(sample_bin), "--html", str(html_out1)])
    assert html_out1.exists()
    content1 = html_out1.read_text(encoding="utf-8")
    assert "ZERAVYNEX THREAT REPORT" in content1
    assert "MALICIOUS" in content1
    assert "85 / 100" in content1

    # Test --output-html alias
    html_out2 = tmp_path / "report2.html"
    cli.main([str(sample_bin), "--output-html", str(html_out2)])
    assert html_out2.exists()


def test_cli_html_security_escaping(tmp_path, monkeypatch, mock_report_data):
    """Verify that dynamic strings in HTML reports are properly escaped against XSS injection."""
    from app.engines.static_analysis import cli

    monkeypatch.setattr(cli.StaticAnalyzer, "analyze", lambda self, path: mock_report_data)

    sample_bin = tmp_path / "sample.exe"
    sample_bin.write_bytes(b"MZtest")

    html_out = tmp_path / "report_sec.html"
    cli.main([str(sample_bin), "--html", str(html_out)])
    html_content = html_out.read_text(encoding="utf-8")

    # Raw script tag must not exist
    assert "<script>alert('xss')</script>" not in html_content
    # HTML escaped representation must exist
    assert html.escape("<script>alert('xss')</script>") in html_content


def test_cli_help_text(capsys):
    """Verify CLI parser help text contains new export options and usage examples."""
    from app.engines.static_analysis import cli
    with pytest.raises(SystemExit) as exc_info:
        cli.main(["--help"])
    assert exc_info.value.code == 0
    captured = capsys.readouterr()
    assert "--json" in captured.out
    assert "--html" in captured.out
    assert "--output-json" in captured.out
    assert "--output-html" in captured.out
    assert "Examples:" in captured.out


