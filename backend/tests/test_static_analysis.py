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
