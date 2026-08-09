import re
from typing import Dict, List, Any, Union
from pathlib import Path
from .hashing import calculate_entropy


# Regular expressions for string extraction
ASCII_RE = re.compile(rb"[\x20-\x7E]{4,}")
UNICODE_RE = re.compile(rb"(?:[\x20-\x7E]\x00){4,}")

SUSPICIOUS_KEYWORD_PATTERNS = {
    "Shell & Command Execution": re.compile(r"(powershell|cmd\.exe|wscript|cscript|bash|sh|cmd /c|invoke-expression|iex|downloadstring)", re.IGNORECASE),
    "Persistence & System": re.compile(r"(reg add|schtasks|currentversion\\run|system32|drivers\\etc\\hosts|svchost\.exe)", re.IGNORECASE),
    "Ransomware Indicators": re.compile(r"(your files have been encrypted|decrypt|bitcoin|monero|ransom|\.locked|\.crypto|readme_to_decrypt)", re.IGNORECASE),
    "Evasion & Disabling Security": re.compile(r"(disabletaskmgr|disableregistrytools|set-mppreference|amsi\.dll|etw|bypassed)", re.IGNORECASE),
    "Network / Web Request": re.compile(r"(http://|https://|ftp://|user-agent|POST|GET|soap|application/x-www-form-urlencoded)", re.IGNORECASE),
}


class StringExtractor:
    """Extracts ASCII & UTF-16LE strings and identifies security-relevant string patterns."""

    @classmethod
    def extract_strings(cls, file_path: Union[str, Path], min_len: int = 4, max_strings_return: int = 1000) -> Dict[str, Any]:
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(path, "rb") as f:
            data = f.read()

        ascii_strings = [s.decode("ascii", errors="ignore") for s in ASCII_RE.findall(data) if len(s) >= min_len]
        
        # Unicode (UTF-16LE) strings extraction
        unicode_raw = UNICODE_RE.findall(data)
        unicode_strings = [s.decode("utf-16le", errors="ignore") for s in unicode_raw if len(s) // 2 >= min_len]

        all_strings = ascii_strings + unicode_strings
        total_count = len(all_strings)

        # Keyword matching
        suspicious_matches: List[Dict[str, str]] = []
        for s in all_strings:
            for category, pattern in SUSPICIOUS_KEYWORD_PATTERNS.items():
                if pattern.search(s):
                    suspicious_matches.append({
                        "string": s[:200],  # Truncate extremely long strings
                        "category": category
                    })

        # Calculate average entropy of strings sample
        sample_concat = "".join(all_strings[:500]).encode("utf-8")
        strings_entropy = calculate_entropy(sample_concat) if sample_concat else 0.0

        return {
            "total_strings_found": total_count,
            "ascii_count": len(ascii_strings),
            "unicode_count": len(unicode_strings),
            "strings_entropy": strings_entropy,
            "suspicious_keyword_matches": suspicious_matches[:200],
            "sample_strings": all_strings[:max_strings_return]
        }
