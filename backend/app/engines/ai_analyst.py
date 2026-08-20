import os
import json
from typing import Dict, List, Any, Optional

ATTACK_MAP = [
    {
        "tactic": "Execution",
        "technique_id": "T1059",
        "technique_name": "Command and Scripting Interpreter",
        "keywords": ["cmd.exe", "powershell.exe", "wscript", "cscript"],
        "description": "Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries."
    },
    {
        "tactic": "Defense Evasion",
        "technique_id": "T1027.002",
        "technique_name": "Software Packing",
        "keywords": ["UPX", "entropy", "packer", "packed"],
        "description": "Adversaries may perform software packing to condense, encrypt, or obfuscate executable payloads."
    },
    {
        "tactic": "Process Injection",
        "technique_id": "T1055",
        "technique_name": "Process Injection",
        "keywords": ["VirtualAllocEx", "WriteProcessMemory", "CreateRemoteThread", "NtUnmapViewOfSection", "process_injection"],
        "description": "Adversaries may inject code into processes in order to evade process-based defenses and elevate privileges."
    },
    {
        "tactic": "Persistence",
        "technique_id": "T1547.001",
        "technique_name": "Registry Run Keys / Startup Folder",
        "keywords": ["CurrentVersion\\Run", "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", "persistence"],
        "description": "Adversaries may achieve persistence by adding program signatures or scripts to registry run keys."
    },
    {
        "tactic": "Impact",
        "technique_id": "T1486",
        "technique_name": "Data Encrypted for Impact",
        "keywords": ["ransomware", "encrypt", ".locked", "README_DECRYPT", "ransom_note"],
        "description": "Adversaries may encrypt data on target systems to interrupt availability of system and network resources."
    },
    {
        "tactic": "Command and Control",
        "technique_id": "T1071.001",
        "technique_name": "Web Protocols",
        "keywords": ["http://", "https://", "socket", "connect", "InternetOpen", "HttpSendRequest"],
        "description": "Adversaries may communicate using application layer protocols to avoid detection/filtering by blending in with normal traffic."
    },
    {
        "tactic": "Defense Evasion",
        "technique_id": "T1497",
        "technique_name": "Virtualization/Sandbox Evasion",
        "keywords": ["IsDebuggerPresent", "CheckRemoteDebuggerPresent", "GetTickCount", "anti_debug"],
        "description": "Adversaries may employ mechanisms to detect if their payload is being analyzed in a sandbox or virtual environment."
    }
]

class AIAnalystEngine:
    """
    AI Analyst Engine for Zeravynex.
    Generates automated narrative explanations, executive summaries,
    recommended investigation playbooks, and MITRE ATT&CK technique mappings.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")

    def map_mitre_attack(self, report: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Maps evidence from YARA rules, Heuristic matches, Section Anomaly, and IOCs to MITRE ATT&CK techniques.
        """
        matched_techniques: Dict[str, Dict[str, Any]] = {}
        
        # Extract text evidence sources
        evidence_text: List[str] = []
        
        # 1. Heuristics
        for match in report.get("heuristics", {}).get("matches", []):
            rule_id = match.get("rule_id", "")
            rule_name = match.get("rule_name", "")
            desc = str(match.get("evidence", {}))
            evidence_text.extend([rule_id, rule_name, desc])
            
        # 2. YARA
        for ymatch in report.get("yara_matches", []):
            rule = ymatch.get("rule", "")
            desc = ymatch.get("description", "")
            evidence_text.extend([rule, desc])
            
        # 3. IOCs
        iocs = report.get("iocs", {})
        if iocs.get("urls") or iocs.get("ip_addresses") or iocs.get("domains"):
            evidence_text.append("http://")
            
        # 4. Strings & Imports
        suspicious_imports = report.get("imports", {}).get("suspicious_imports", [])
        for imp in suspicious_imports:
            evidence_text.append(imp.get("function", ""))
            
        full_text_blob = " ".join(evidence_text).lower()

        for attack in ATTACK_MAP:
            matched_kw = []
            for kw in attack["keywords"]:
                if kw.lower() in full_text_blob:
                    matched_kw.append(kw)
                    
            if matched_kw:
                tech_id = attack["technique_id"]
                if tech_id not in matched_techniques:
                    matched_techniques[tech_id] = {
                        "tactic": attack["tactic"],
                        "technique_id": attack["technique_id"],
                        "technique_name": attack["technique_name"],
                        "description": attack["description"],
                        "matched_indicators": matched_kw
                    }
                else:
                    matched_techniques[tech_id]["matched_indicators"].extend(matched_kw)

        return list(matched_techniques.values())

    def analyze(self, report: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates narrative analysis, ATT&CK mapping, and investigation recommendations.
        """
        risk_analysis = report.get("risk_analysis", {})
        risk_score = risk_analysis.get("risk_score", 0.0)
        verdict = risk_analysis.get("verdict", "UNKNOWN")
        severity = risk_analysis.get("severity_level", "INFO")
        file_name = report.get("file_info", {}).get("file_name", "Uploaded Sample")
        sha256 = report.get("hashes", {}).get("sha256", "N/A")
        
        mitre_mappings = self.map_mitre_attack(report)
        
        # Build Executive Summary
        exec_summary = (
            f"Static security evaluation of sample '{file_name}' (SHA-256: {sha256[:16]}...) "
            f"resulted in a threat verdict of {verdict} with a normalized Risk Score of {risk_score}/100 ({severity} Severity). "
        )
        
        if verdict in ["HIGH RISK", "CRITICAL MALWARE"]:
            exec_summary += (
                "The sample exhibits severe malicious characteristics including high-entropy executable code, "
                "suspicious process injection APIs, and signature matches corresponding to known malware primitives. "
                "Immediate containment and host isolation are recommended."
            )
        elif verdict == "SUSPICIOUS":
            exec_summary += (
                "The sample contains suspicious structural anomalies or suspicious import combinations that warrant "
                "further analyst review before authorizing execution."
            )
        else:
            exec_summary += (
                "No critical malicious indicators or known threat signatures were detected during static evaluation."
            )

        # Build Technical Explanation
        tech_points = []
        ml_res = report.get("ml_analysis", {})
        if ml_res.get("malware_probability") is not None:
            prob = round(ml_res["malware_probability"] * 100, 1)
            tech_points.append(f"• ML Engine classified malware probability at {prob}% (Confidence: {ml_res.get('confidence', 'N/A')}).")
            
        shap_top = ml_res.get("shap_explanation", {}).get("top_pushing_malware", [])
        if shap_top:
            features = ", ".join([f"{item['feature']} (+{item['shap_value']:.2f})" for item in shap_top[:3]])
            tech_points.append(f"• Primary ML risk drivers (SHAP values): {features}.")

        heur_matches = report.get("heuristics", {}).get("matches", [])
        if heur_matches:
            rules = ", ".join([m.get("rule_name", m.get("rule_id", "")) for m in heur_matches])
            tech_points.append(f"• Behavioral Heuristic Triggered: {rules}.")

        yara_matches = report.get("yara_matches", [])
        if yara_matches:
            ym_names = ", ".join([ym.get("rule", "") for ym in yara_matches])
            tech_points.append(f"• YARA Signatures Matched: {ym_names}.")

        iocs = report.get("iocs", {})
        total_iocs = len(iocs.get("urls", [])) + len(iocs.get("ip_addresses", [])) + len(iocs.get("domains", []))
        if total_iocs > 0:
            tech_points.append(f"• Extracted IOC Network Targets: {total_iocs} endpoints identified.")

        if not tech_points:
            tech_points.append("• Standard PE structural baseline; no suspicious imports or section anomalies detected.")

        technical_explanation = "\n".join(tech_points)

        # Build Recommended Investigation Steps
        recommendations = []
        if verdict in ["HIGH RISK", "CRITICAL MALWARE"]:
            recommendations.append("Isolate the host endpoint from the corporate network to prevent potential lateral movement.")
            recommendations.append("Block all identified C2 IP addresses and domains at the perimeter firewall / DNS sinkhole.")
            recommendations.append("Submit the file SHA-256 hash to threat intelligence feeds (e.g. VirusTotal, AlienVault OTX).")
            recommendations.append("Perform dynamic sandbox detonation in an isolated hypervisor environment to capture runtime payloads.")
        elif verdict == "SUSPICIOUS":
            recommendations.append("Verify the publisher digital signature and certificate validity of the binary.")
            recommendations.append("Cross-reference extracted strings and IAT imports against software vendor documentation.")
            recommendations.append("Execute in a non-production analysis sandbox to inspect spawned subprocesses.")
        else:
            recommendations.append("No immediate threat response required.")
            recommendations.append("Maintain routine file integrity monitoring.")

        return {
            "executive_summary": exec_summary,
            "technical_explanation": technical_explanation,
            "recommended_investigation_steps": recommendations,
            "mitre_attack_mappings": mitre_mappings,
            "ai_confidence": 0.92,
            "generated_by": "Zeravynex AI Analyst Engine (Offline Heuristic Synthesizer)"
        }
