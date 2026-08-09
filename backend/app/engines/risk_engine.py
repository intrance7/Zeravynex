from typing import Dict, List, Any


SEVERITY_WEIGHTS = {
    "INFO": 1,
    "LOW": 5,
    "MEDIUM": 15,
    "HIGH": 30,
    "CRITICAL": 50
}


class RiskEngine:
    """Aggregates evidence signals from Heuristics, YARA, and Static analysis to compute a risk score & verdict."""

    @classmethod
    def calculate_risk(cls, heuristic_matches: List[Dict[str, Any]], yara_matches: List[Dict[str, Any]], static_indicators: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_score = 0
        evidence_summary: List[Dict[str, Any]] = []

        # 1. Process Heuristic Matches
        for match in heuristic_matches:
            sev = match.get("severity", "MEDIUM")
            weight = match.get("weight", SEVERITY_WEIGHTS.get(sev, 15))
            total_score += weight
            evidence_summary.append({
                "source": "Heuristic Engine",
                "rule": match.get("rule_name", match.get("rule_id", "Heuristic Match")),
                "severity": sev,
                "weight": weight,
                "details": match.get("evidence", {})
            })

        # 2. Process YARA Matches
        for ymatch in yara_matches:
            sev = ymatch.get("severity", "MEDIUM")
            weight = SEVERITY_WEIGHTS.get(sev, 15)
            total_score += weight
            evidence_summary.append({
                "source": "YARA Engine",
                "rule": ymatch.get("rule", "YARA Match"),
                "severity": sev,
                "weight": weight,
                "details": f"Category: {ymatch.get('category', 'General')} | Description: {ymatch.get('description', '')}"
            })

        # Normalize score cap at 100
        normalized_score = min(100, total_score)

        # Determine Verdict & Severity Classification
        if normalized_score <= 20:
            verdict = "CLEAN / LOW RISK"
            severity_level = "LOW"
        elif normalized_score <= 45:
            verdict = "SUSPICIOUS"
            severity_level = "MEDIUM"
        elif normalized_score <= 75:
            verdict = "HIGH RISK"
            severity_level = "HIGH"
        else:
            verdict = "CRITICAL MALWARE"
            severity_level = "CRITICAL"

        return {
            "risk_score": normalized_score,
            "max_possible_score": 100,
            "verdict": verdict,
            "severity_level": severity_level,
            "total_threat_signals": len(evidence_summary),
            "evidence_breakdown": evidence_summary
        }
