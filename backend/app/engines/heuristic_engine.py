from typing import Dict, List, Any


class HeuristicEngine:
    """Evaluates static analysis metadata against deterministic behavioral heuristic rules."""

    RULES = [
        {
            "id": "HEUR_RWX_SECTION",
            "name": "Read-Write-Execute (RWX) Section Detected",
            "severity": "HIGH",
            "weight": 30,
            "category": "Evasion / Self-Modifying Code"
        },
        {
            "id": "HEUR_HIGH_ENTROPY",
            "name": "High Entropy Section (Possible Packed/Encrypted Payload)",
            "severity": "HIGH",
            "weight": 25,
            "category": "Packing / Encryption"
        },
        {
            "id": "HEUR_PROCESS_INJECTION_APIS",
            "name": "Process Injection WinAPI Combination",
            "severity": "HIGH",
            "weight": 30,
            "category": "Process Injection"
        },
        {
            "id": "HEUR_SHELL_EXEC_STRINGS",
            "name": "Shell & Command Execution String Patterns",
            "severity": "MEDIUM",
            "weight": 20,
            "category": "Command Execution"
        },
        {
            "id": "HEUR_RANSOMWARE_STRINGS",
            "name": "Ransomware Note / Shadow Copy Deletion Indicators",
            "severity": "CRITICAL",
            "weight": 50,
            "category": "Ransomware"
        },
        {
            "id": "HEUR_REGISTRY_PERSISTENCE",
            "name": "Registry Run/Service Persistence Indicators",
            "severity": "MEDIUM",
            "weight": 15,
            "category": "Persistence"
        },
        {
            "id": "HEUR_C2_URL_IOC",
            "name": "Remote Network C2 Endpoint Extracted",
            "severity": "HIGH",
            "weight": 25,
            "category": "C2 Infrastructure"
        }
    ]

    @classmethod
    def evaluate(cls, static_analysis_report: Dict[str, Any]) -> List[Dict[str, Any]]:
        matches: List[Dict[str, Any]] = []

        sections = static_analysis_report.get("sections", [])
        imports_exports = static_analysis_report.get("imports_exports", {})
        strings_summary = static_analysis_report.get("strings_summary", {})
        iocs = static_analysis_report.get("iocs", {})

        # 1. Check RWX Sections
        rwx_secs = [s for s in sections if s.get("is_rwx")]
        if rwx_secs:
            matches.append({
                "rule_id": "HEUR_RWX_SECTION",
                "rule_name": "Read-Write-Execute (RWX) Section Detected",
                "severity": "HIGH",
                "weight": 30,
                "confidence": 0.95,
                "category": "Evasion / Self-Modifying Code",
                "evidence": {
                    "count": len(rwx_secs),
                    "sections": [s["name"] for s in rwx_secs]
                }
            })

        # 2. Check High Entropy Sections (>= 7.1)
        high_ent = [s for s in sections if s.get("entropy", 0) >= 7.1]
        if high_ent:
            matches.append({
                "rule_id": "HEUR_HIGH_ENTROPY",
                "rule_name": "High Entropy Section (Possible Packed/Encrypted Payload)",
                "severity": "HIGH",
                "weight": 25,
                "confidence": 0.90,
                "category": "Packing / Encryption",
                "evidence": {
                    "count": len(high_ent),
                    "sections": [{"name": s["name"], "entropy": s["entropy"]} for s in high_ent]
                }
            })

        # 3. Check Process Injection APIs
        susp_apis = imports_exports.get("suspicious_apis", [])
        injection_apis = [a for a in susp_apis if a.get("category") == "Process Injection & Execution"]
        if len(injection_apis) >= 2:
            matches.append({
                "rule_id": "HEUR_PROCESS_INJECTION_APIS",
                "rule_name": "Process Injection WinAPI Combination",
                "severity": "HIGH",
                "weight": 30,
                "confidence": 0.92,
                "category": "Process Injection",
                "evidence": {
                    "count": len(injection_apis),
                    "apis": [a["api"] for a in injection_apis]
                }
            })

        # 4. Check Shell Execution Strings
        kw_matches = strings_summary.get("suspicious_keyword_matches", [])
        shell_matches = [m for m in kw_matches if m.get("category") == "Shell & Command Execution"]
        if shell_matches:
            matches.append({
                "rule_id": "HEUR_SHELL_EXEC_STRINGS",
                "rule_name": "Shell & Command Execution String Patterns",
                "severity": "MEDIUM",
                "weight": 20,
                "confidence": 0.85,
                "category": "Command Execution",
                "evidence": {
                    "count": len(shell_matches),
                    "samples": [m["string"] for m in shell_matches[:3]]
                }
            })

        # 5. Check Ransomware Indicators
        ransom_matches = [m for m in kw_matches if m.get("category") == "Ransomware Indicators"]
        if ransom_matches:
            matches.append({
                "rule_id": "HEUR_RANSOMWARE_STRINGS",
                "rule_name": "Ransomware Note / Shadow Copy Deletion Indicators",
                "severity": "CRITICAL",
                "weight": 50,
                "confidence": 0.98,
                "category": "Ransomware",
                "evidence": {
                    "count": len(ransom_matches),
                    "samples": [m["string"] for m in ransom_matches[:3]]
                }
            })

        # 6. Check Registry Persistence Indicators
        reg_keys = iocs.get("registry_keys", [])
        if reg_keys:
            matches.append({
                "rule_id": "HEUR_REGISTRY_PERSISTENCE",
                "rule_name": "Registry Run/Service Persistence Indicators",
                "severity": "MEDIUM",
                "weight": 15,
                "confidence": 0.80,
                "category": "Persistence",
                "evidence": {
                    "count": len(reg_keys),
                    "keys": reg_keys[:5]
                }
            })

        # 7. Check Remote C2 URLs
        urls = iocs.get("urls", [])
        if urls:
            matches.append({
                "rule_id": "HEUR_C2_URL_IOC",
                "rule_name": "Remote Network C2 Endpoint Extracted",
                "severity": "HIGH",
                "weight": 25,
                "confidence": 0.88,
                "category": "C2 Infrastructure",
                "evidence": {
                    "count": len(urls),
                    "urls": urls[:5]
                }
            })

        return matches
