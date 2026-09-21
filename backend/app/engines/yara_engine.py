import os
import re
from typing import Dict, List, Any, Union, Optional
from pathlib import Path

# Try importing native yara module
try:
    import yara
    HAS_YARA_NATIVE = True
except ImportError:
    yara = None
    HAS_YARA_NATIVE = False


class YARAEngine:
    """Scans binary files against curated YARA rulesets."""

    def __init__(self, rules_dir: Optional[Union[str, Path]] = None):
        if rules_dir is None:
            # Default to backend/yara_rules
            base_dir = Path(__file__).resolve().parent.parent.parent
            rules_dir = base_dir / "yara_rules"
        
        self.rules_dir = Path(rules_dir)
        self.compiled_rules = None
        self._compile_rules()

    def _compile_rules(self):
        """Discovers and compiles all .yar files under self.rules_dir."""
        if not HAS_YARA_NATIVE:
            return

        if not self.rules_dir.exists():
            return

        rule_files: Dict[str, str] = {}
        for root, _, files in os.walk(self.rules_dir):
            for file in files:
                if file.endswith(".yar") or file.endswith(".yara"):
                    full_path = str(Path(root) / file)
                    rel_name = os.path.relpath(full_path, self.rules_dir).replace("\\", "_").replace("/", "_")
                    rule_files[rel_name] = full_path

        if rule_files:
            try:
                self.compiled_rules = yara.compile(filepaths=rule_files)
            except Exception as e:
                # Log compilation error gracefully
                self.compiled_rules = None

    def scan_file(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"Target file not found: {file_path}")

        matches_output: List[Dict[str, Any]] = []

        if HAS_YARA_NATIVE and self.compiled_rules:
            try:
                matches = self.compiled_rules.match(str(path))
                for match in matches:
                    meta = match.meta if hasattr(match, "meta") else {}
                    string_instances = []
                    if hasattr(match, "strings"):
                        for string_data in match.strings:
                            # Extract matched bytes string
                            offset = string_data[0]
                            identifier = string_data[1]
                            matched_bytes = string_data[2]
                            str_repr = matched_bytes.decode("utf-8", errors="ignore") if isinstance(matched_bytes, bytes) else str(matched_bytes)
                            string_instances.append({
                                "identifier": identifier,
                                "offset": f"0x{offset:08X}",
                                "matched_text": str_repr[:100]
                            })

                    matches_output.append({
                        "rule": match.rule,
                        "namespace": match.namespace,
                        "tags": list(match.tags),
                        "severity": meta.get("severity", "MEDIUM"),
                        "category": meta.get("category", "General"),
                        "description": meta.get("description", ""),
                        "author": meta.get("author", "Zeravynex Security Team"),
                        "reference": meta.get("reference", ""),
                        "mitre_attack_id": meta.get("mitre_attack_id", ""),
                        "matched_strings": string_instances
                    })
            except Exception as e:
                pass
        else:
            # Fallback text/signature scanner when native YARA is not present
            matches_output = self._fallback_pattern_scan(path)

        return {
            "has_native_yara": HAS_YARA_NATIVE,
            "rules_directory": str(self.rules_dir.resolve()),
            "total_matches": len(matches_output),
            "matches": matches_output
        }

    def _fallback_pattern_scan(self, file_path: Path) -> List[Dict[str, Any]]:
        """Fallback pattern scanner matching UPX signatures, process injection strings, cryptominers, infostealers, and ransomware."""
        matches = []
        try:
            with open(file_path, "rb") as f:
                content = f.read()

            content_text = content.decode("latin1", errors="ignore")

            # Check UPX signature
            if b"UPX0" in content and b"UPX1" in content:
                matches.append({
                    "rule": "UPX_Packed_Binary",
                    "namespace": "packers",
                    "tags": ["packer", "upx"],
                    "severity": "MEDIUM",
                    "category": "Packer",
                    "description": "Detects UPX packed executable binaries",
                    "author": "Zeravynex Security Team",
                    "reference": "https://attack.mitre.org/techniques/T1027/002/",
                    "mitre_attack_id": "T1027.002",
                    "matched_strings": [{"identifier": "$upx", "offset": "0x0", "matched_text": "UPX0/UPX1"}]
                })

            # Check Process Injection primitives
            if "VirtualAllocEx" in content_text and "WriteProcessMemory" in content_text and "CreateRemoteThread" in content_text:
                matches.append({
                    "rule": "Process_Injection_Primitives",
                    "namespace": "suspicious_apis",
                    "tags": ["injection"],
                    "severity": "HIGH",
                    "category": "Process Injection",
                    "description": "Detects WinAPI imports commonly used together for process injection",
                    "author": "Zeravynex Security Team",
                    "reference": "https://attack.mitre.org/techniques/T1055/",
                    "mitre_attack_id": "T1055",
                    "matched_strings": [{"identifier": "$injection", "offset": "0x0", "matched_text": "VirtualAllocEx+WriteProcessMemory+CreateRemoteThread"}]
                })

            # Check Cryptominer (XMRig / Stratum)
            if ("stratum+tcp://" in content_text.lower() or "stratum+ssl://" in content_text.lower()) and ("--donate-level=" in content_text or "randomx" in content_text.lower() or "cryptonight" in content_text.lower()):
                matches.append({
                    "rule": "Cryptominer_XMRig_CoinMiner",
                    "namespace": "malware_families",
                    "tags": ["cryptominer", "xmrig", "stratum", "monero"],
                    "severity": "HIGH",
                    "category": "Cryptominer",
                    "description": "Detects XMRig cryptocurrency miner variants, RandomX/CryptoNight algorithms, and Stratum mining telemetry",
                    "author": "Zeravynex Security Team",
                    "reference": "https://github.com/xmrig/xmrig",
                    "mitre_attack_id": "T1496",
                    "matched_strings": [{"identifier": "$xmrig", "offset": "0x0", "matched_text": "Stratum+XMRig Indicator"}]
                })

            # Check RedLine Stealer
            if "IRemoteEndpoint" in content_text and ("\\Google\\Chrome\\User Data" in content_text or "logins.json" in content_text or "nkbihfbeogaeaoehlefnkodbefgpgknn" in content_text):
                matches.append({
                    "rule": "Infostealer_RedLine",
                    "namespace": "malware_families",
                    "tags": ["infostealer", "redline", "credentials", "wallets"],
                    "severity": "CRITICAL",
                    "category": "Infostealer",
                    "description": "Detects RedLine Stealer .NET infostealer targeting browser credentials, crypto wallets, and WCF C2 endpoints",
                    "author": "Zeravynex Security Team",
                    "reference": "https://malpedia.caad.fkie.fraunhofer.de/details/win.redline_stealer",
                    "mitre_attack_id": "T1555",
                    "matched_strings": [{"identifier": "$redline", "offset": "0x0", "matched_text": "RedLine WCF+Target Indicator"}]
                })

            # Check LummaC2 Stealer
            if ("profile_id=" in content_text.lower() or "action=get_data" in content_text.lower()) and ("\\AppData\\Local\\Google\\Chrome" in content_text or "egjidjbpglichdcondbcbdnbeeppgdph" in content_text):
                matches.append({
                    "rule": "Infostealer_LummaC2",
                    "namespace": "malware_families",
                    "tags": ["infostealer", "lummac2", "lumma", "credentials"],
                    "severity": "CRITICAL",
                    "category": "Infostealer",
                    "description": "Detects LummaC2 (Lumma Stealer) native infostealer binary artifacts and exfiltration telemetry",
                    "author": "Zeravynex Security Team",
                    "reference": "https://malpedia.caad.fkie.fraunhofer.de/details/win.lumma",
                    "mitre_attack_id": "T1005",
                    "matched_strings": [{"identifier": "$lumma", "offset": "0x0", "matched_text": "Lumma Telemetry+Target Indicator"}]
                })

            # Check Ransomware Extortion Note
            if re.search(r"YOUR FILES HAVE BEEN ENCRYPTED|your files are encrypted", content_text, re.IGNORECASE) and (".onion" in content_text.lower() or "tor browser" in content_text.lower() or "decryptor" in content_text.lower()):
                matches.append({
                    "rule": "Ransomware_Extortion_Note",
                    "namespace": "malware_families",
                    "tags": ["ransomware", "ransom_note", "extortion"],
                    "severity": "CRITICAL",
                    "category": "Ransomware",
                    "description": "Detects typical ransomware ransom notes, onion payment portals, and extortion contact markers",
                    "author": "Zeravynex Security Team",
                    "reference": "https://attack.mitre.org/techniques/T1486/",
                    "mitre_attack_id": "T1486",
                    "matched_strings": [{"identifier": "$ransom_note", "offset": "0x0", "matched_text": "Extortion note + onion/tor portal"}]
                })

            # Check Inhibit Recovery / Sabotage
            recovery_sabotage_hits = sum(1 for cmd in ["vssadmin delete shadows", "bcdedit", "wbadmin delete catalog", "wmic shadowcopy delete"] if cmd in content_text.lower())
            if recovery_sabotage_hits >= 2:
                matches.append({
                    "rule": "Ransomware_Inhibit_System_Recovery",
                    "namespace": "malware_families",
                    "tags": ["ransomware", "vssadmin", "bcdedit", "recovery_sabotage"],
                    "severity": "CRITICAL",
                    "category": "Ransomware",
                    "description": "Detects bundled system recovery sabotage commands used by ransomware to inhibit shadow copies and recovery",
                    "author": "Zeravynex Security Team",
                    "reference": "https://attack.mitre.org/techniques/T1490/",
                    "mitre_attack_id": "T1490",
                    "matched_strings": [{"identifier": "$recovery_sabotage", "offset": "0x0", "matched_text": "Shadow copy / boot recovery suppression"}]
                })
        except Exception:
            pass

        return matches
