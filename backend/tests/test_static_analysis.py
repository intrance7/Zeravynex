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


def test_entropy_calculation():
    # Constant data -> entropy should be 0.0
    assert calculate_entropy(b"AAAAAAA") == 0.0
    # Uniform 256 byte data -> max entropy ~ 8.0
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
    assert "bad-actor-c2.net" in iocs["domains"]
    assert "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" in iocs["registry_keys"]
    assert "Global\\ZeravynexTestMutex" in iocs["mutexes"]


def test_end_to_end_static_analyzer(tmp_path):
    dummy_pe = tmp_path / "dummy.exe"
    dummy_pe.write_bytes(b"MZ" + b"\x00" * 500 + b"https://evil.com/drop.exe HKLM\\Software\\Run")

    analyzer = StaticAnalyzer()
    report = analyzer.analyze(dummy_pe)

    assert "metadata" in report
    assert "hashes" in report
    assert "pe_header" in report
    assert "iocs" in report
    assert "indicators" in report
    assert report["metadata"]["engine_version"].startswith("Zeravynex Phase 1")
