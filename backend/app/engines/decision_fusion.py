from typing import Dict, List, Any

DEFAULT_POLICY = {
    "ML": 0.35,
    "HEURISTICS": 0.30,
    "YARA": 0.25,
    "IOC": 0.10
}

SEVERITY_WEIGHTS = {
    "INFO": 1,
    "LOW": 5,
    "MEDIUM": 15,
    "HIGH": 30,
    "CRITICAL": 50
}

class DecisionFusionEngine:
    """Aggregates ML, Heuristics, YARA, and IOCs to form a final verdict and unified risk score."""

    def __init__(self, policy: Dict[str, float] = None):
        self.policy = policy or DEFAULT_POLICY
        
        # Ensure policy weights sum up to 1.0
        total_weight = sum(self.policy.values())
        if not (0.99 <= total_weight <= 1.01):
            raise ValueError(f"DecisionFusionEngine policy weights must sum to 1.0. Current sum: {total_weight}")

    def fuse(self, ml_prob: float, heuristic_matches: List[Dict[str, Any]], yara_matches: List[Dict[str, Any]], ioc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates subscores and fuses them based on the defined policy."""
        evidence_summary: List[Dict[str, Any]] = []

        # 1. ML Score (0-100)
        ml_score = ml_prob * 100.0

        # 2. Heuristics Score (0-100)
        heur_total = 0.0
        for match in heuristic_matches:
            sev = match.get("severity", "MEDIUM")
            weight = match.get("weight", SEVERITY_WEIGHTS.get(sev, 15))
            heur_total += weight
            evidence_summary.append({
                "source": "Heuristic Engine",
                "rule": match.get("rule_name", match.get("rule_id", "Heuristic Match")),
                "severity": sev,
                "weight": weight,
                "details": match.get("evidence", {})
            })
        heur_score = min(100.0, float(heur_total))

        # 3. YARA Score (0-100)
        yara_total = 0.0
        for ymatch in yara_matches:
            sev = ymatch.get("severity", "MEDIUM")
            weight = SEVERITY_WEIGHTS.get(sev, 15)
            yara_total += weight
            evidence_summary.append({
                "source": "YARA Engine",
                "rule": ymatch.get("rule", "YARA Match"),
                "severity": sev,
                "weight": weight,
                "details": f"Category: {ymatch.get('category', 'General')} | Description: {ymatch.get('description', '')}"
            })
        yara_score = min(100.0, float(yara_total))

        # 4. IOC Score (0-100)
        ioc_total = 0.0
        url_count = len(ioc_data.get("urls", []))
        ip_count = len(ioc_data.get("ip_addresses", []))
        domain_count = len(ioc_data.get("domains", []))
        reg_count = len(ioc_data.get("registry_keys", []))
        mutex_count = len(ioc_data.get("mutexes", []))
        path_count = len(ioc_data.get("file_paths", []))

        ioc_total += url_count * 20
        ioc_total += ip_count * 20
        ioc_total += domain_count * 20
        ioc_total += reg_count * 10
        ioc_total += mutex_count * 10
        ioc_total += path_count * 5
        
        ioc_score = min(100.0, float(ioc_total))
        
        if ioc_total > 0:
            evidence_summary.append({
                "source": "IOC Extractor",
                "rule": "High-risk IOCs Identified",
                "severity": "HIGH" if ioc_total >= 30 else "MEDIUM",
                "weight": min(ioc_total, 100),
                "details": {
                    "urls": url_count,
                    "ips": ip_count,
                    "domains": domain_count,
                    "registry": reg_count,
                    "mutexes": mutex_count
                }
            })

        # 5. Fused Score
        final_score = (
            ml_score * self.policy.get("ML", 0) +
            heur_score * self.policy.get("HEURISTICS", 0) +
            yara_score * self.policy.get("YARA", 0) +
            ioc_score * self.policy.get("IOC", 0)
        )

        # 6. Verdict Calculation
        if final_score <= 20:
            verdict = "CLEAN / LOW RISK"
            severity_level = "LOW"
        elif final_score <= 45:
            verdict = "SUSPICIOUS"
            severity_level = "MEDIUM"
        elif final_score <= 75:
            verdict = "HIGH RISK"
            severity_level = "HIGH"
        else:
            verdict = "CRITICAL MALWARE"
            severity_level = "CRITICAL"

        return {
            "risk_score": round(final_score, 2),
            "verdict": verdict,
            "severity_level": severity_level,
            "components": {
                "ml_score": round(ml_score, 2),
                "heuristics_score": round(heur_score, 2),
                "yara_score": round(yara_score, 2),
                "ioc_score": round(ioc_score, 2)
            },
            "weights_used": self.policy,
            "total_threat_signals": len(evidence_summary),
            "evidence_breakdown": evidence_summary
        }
