import time
from typing import Dict, Any, Union, Optional
from pathlib import Path

from .hashing import Hasher
from .pe_parser import PEParser
from .sections import SectionAnalyzer
from .imports_exports import ImportsExportsAnalyzer
from .strings import StringExtractor
from .ioc_extractor import IOCExtractor
from app.engines.heuristic_engine import HeuristicEngine
from app.engines.yara_engine import YARAEngine
from app.engines.decision_fusion import DecisionFusionEngine
from app.engines.ml.classifier import MalwareClassifier
from app.engines.ml.explainer import SHAPExplainer


class StaticAnalyzer:
    """Central Analysis Engine for Zeravynex (Static Analysis, Heuristics, YARA, ML Classification & SHAP Explainability)."""

    def __init__(self, min_string_length: int = 4, yara_rules_dir: Optional[Union[str, Path]] = None, model_path: Optional[Union[str, Path]] = None, fusion_policy: Dict[str, float] = None):
        self.min_string_length = min_string_length
        self.yara_engine = YARAEngine(rules_dir=yara_rules_dir)
        self.classifier = MalwareClassifier(model_path=model_path)
        self.explainer = SHAPExplainer(classifier_model=self.classifier.rf_model)
        self.fusion_engine = DecisionFusionEngine(policy=fusion_policy)

    def analyze(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"Target file not found: {file_path}")

        start_time = time.time()

        # 1. Hashing & Raw Entropy
        hash_info = Hasher.hash_file(path)

        # 2. PE Header & Metadata
        pe_info = PEParser.parse_header(path)

        # 3. Section Analysis (only if PE)
        sections = SectionAnalyzer.analyze_sections(path) if pe_info.get("is_pe") else []

        # 4. Imports & Exports (only if PE)
        imports_exports = ImportsExportsAnalyzer.analyze_imports_exports(path) if pe_info.get("is_pe") else {
            "imports": {}, "exports": [], "total_imported_functions": 0, "total_exported_functions": 0, "suspicious_apis": []
        }

        # 5. String Extraction & Keyword Analysis
        strings_info = StringExtractor.extract_strings(path, min_len=self.min_string_length)

        # 6. IOC Extraction from Strings
        iocs = IOCExtractor.extract_iocs(strings_info.get("sample_strings", []))

        # 7. High-Level Security Indicators
        indicators = []
        if not pe_info.get("is_pe"):
            indicators.append({"type": "WARNING", "message": pe_info.get("error", "Non-PE file submitted")})
        else:
            rwx_sections = [s["name"] for s in sections if s.get("is_rwx")]
            if rwx_sections:
                indicators.append({
                    "type": "CRITICAL",
                    "category": "Section Permissions",
                    "message": f"Found {len(rwx_sections)} Read-Write-Execute (RWX) section(s): {', '.join(rwx_sections)}"
                })

            high_entropy_sections = [s["name"] for s in sections if s.get("entropy", 0) >= 7.1]
            if high_entropy_sections:
                indicators.append({
                    "type": "HIGH",
                    "category": "Packing / Encryption",
                    "message": f"High entropy (>= 7.1) in section(s): {', '.join(high_entropy_sections)}"
                })

            susp_apis = imports_exports.get("suspicious_apis", [])
            if susp_apis:
                indicators.append({
                    "type": "HIGH" if len(susp_apis) >= 3 else "MEDIUM",
                    "category": "Suspicious WinAPI Imports",
                    "message": f"Imported {len(susp_apis)} suspicious WinAPI function(s) (e.g., {', '.join([a['api'] for a in susp_apis[:3]])})"
                })

            kw_matches = strings_info.get("suspicious_keyword_matches", [])
            if kw_matches:
                indicators.append({
                    "type": "MEDIUM",
                    "category": "Suspicious Strings",
                    "message": f"Matched {len(kw_matches)} suspicious keyword pattern(s) in binary strings"
                })

        partial_report = {
            "hashes": hash_info,
            "pe_header": pe_info,
            "sections": sections,
            "imports_exports": imports_exports,
            "strings_summary": {
                "total_strings": strings_info.get("total_strings_found", 0),
                "ascii_count": strings_info.get("ascii_count", 0),
                "unicode_count": strings_info.get("unicode_count", 0),
                "entropy": strings_info.get("strings_entropy", 0.0),
                "suspicious_keyword_matches": strings_info.get("suspicious_keyword_matches", [])
            },
            "iocs": iocs
        }

        # 8. Phase 2: Deterministic Heuristic Engine
        heuristic_matches = HeuristicEngine.evaluate(partial_report)
        partial_report["heuristic_analysis"] = {
            "total_heuristic_matches": len(heuristic_matches),
            "matches": heuristic_matches
        }

        # 9. Phase 2: YARA Scanner Engine
        yara_report = self.yara_engine.scan_file(path)

        # 10. Phase 3: Machine Learning & SHAP Explainability Engine
        ml_pred = self.classifier.predict(partial_report)
        shap_explanation = self.explainer.explain(ml_pred)

        # 11. Phase 4: Decision Fusion Engine Computation
        risk_summary = self.fusion_engine.fuse(
            ml_prob=ml_pred.get("malware_probability", 0.0),
            heuristic_matches=heuristic_matches,
            yara_matches=yara_report.get("matches", []),
            ioc_data=iocs
        )

        analysis_duration = round(time.time() - start_time, 4)

        return {
            "metadata": {
                "file_name": path.name,
                "file_path": str(path.resolve()),
                "analysis_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "analysis_duration_seconds": analysis_duration,
                "engine_version": "Zeravynex Phase 1+2+3+4 v1.4.0"
            },
            "risk_analysis": risk_summary,
            "ml_analysis": {
                "prediction": ml_pred.get("prediction"),
                "malware_probability": ml_pred.get("malware_probability"),
                "benign_probability": ml_pred.get("benign_probability"),
                "confidence": ml_pred.get("confidence"),
                "architecture": ml_pred.get("model_architecture"),
                "shap_explainability": shap_explanation
            },
            "heuristic_analysis": partial_report["heuristic_analysis"],
            "yara_analysis": yara_report,
            "hashes": hash_info,
            "pe_header": pe_info,
            "sections": sections,
            "imports_exports": imports_exports,
            "strings_summary": partial_report["strings_summary"],
            "iocs": iocs,
            "indicators": indicators
        }
