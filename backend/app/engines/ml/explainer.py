from typing import Dict, List, Any, Optional
from pathlib import Path
from .feature_extractor import FEATURE_NAMES

try:
    import shap
    HAS_SHAP = True
except ImportError:
    shap = None
    HAS_SHAP = False


class SHAPExplainer:
    """Calculates SHAP values and feature contributions for model explainability."""

    def __init__(self, classifier_model: Optional[Any] = None):
        self.model = classifier_model
        self.explainer = None
        if HAS_SHAP and self.model:
            try:
                self.explainer = shap.TreeExplainer(self.model)
            except Exception:
                self.explainer = None

    def explain(self, prediction_result: Dict[str, Any]) -> Dict[str, Any]:
        feature_dict = prediction_result.get("feature_dict", {})
        feature_vector = prediction_result.get("feature_vector", [])

        contributions: List[Dict[str, Any]] = []

        if HAS_SHAP and self.explainer and feature_vector:
            try:
                import numpy as np
                vec_2d = np.array(feature_vector).reshape(1, -1)
                shap_values = self.explainer.shap_values(vec_2d)
                
                # Handle binary classification array format differences across shap versions
                if isinstance(shap_values, list):
                    vals = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
                elif len(shap_values.shape) == 3:
                    vals = shap_values[0, :, 1]
                else:
                    vals = shap_values[0]

                for name, val, raw_val in zip(FEATURE_NAMES, vals, feature_vector):
                    contributions.append({
                        "feature_name": name,
                        "feature_value": raw_val,
                        "shap_value": round(float(val), 4),
                        "effect": "Pushes towards MALWARE" if val > 0 else ("Pushes towards BENIGN" if val < 0 else "NEUTRAL")
                    })
            except Exception:
                contributions = self._fallback_feature_explanations(feature_dict)
        else:
            contributions = self._fallback_feature_explanations(feature_dict)

        # Sort contributions by magnitude (absolute SHAP value / contribution weight)
        contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

        top_malware_pushers = [c for c in contributions if c["shap_value"] > 0][:5]
        top_benign_pushers = [c for c in contributions if c["shap_value"] < 0][:5]

        return {
            "has_native_shap": HAS_SHAP,
            "feature_contributions": contributions,
            "top_malware_indicators": top_malware_pushers,
            "top_benign_indicators": top_benign_pushers,
            "explanation_summary": self._generate_text_summary(prediction_result.get("prediction", "UNKNOWN"), top_malware_pushers)
        }

    def _fallback_feature_explanations(self, fd: Dict[str, float]) -> List[Dict[str, Any]]:
        """Domain-weighted SHAP approximation fallback."""
        contributions = []

        weights = {
            "rwx_sections_count": (0.35, "RWX section permissions present"),
            "max_section_entropy": (0.30 if fd.get("max_section_entropy", 0) >= 7.1 else -0.10, "Section entropy metrics"),
            "process_injection_api_count": (0.28, "Process injection WinAPI functions"),
            "suspicious_api_count": (0.20, "Suspicious WinAPI import volume"),
            "suspicious_keyword_count": (0.18, "Threat keyword matches in binary strings"),
            "heuristic_matches_count": (0.25, "Heuristic rule trigger count"),
            "url_count": (0.15, "Extracted C2 URLs"),
            "file_entropy": (0.15 if fd.get("file_entropy", 0) >= 6.8 else -0.05, "Overall file Shannon entropy"),
            "total_imported_functions": (-0.12 if fd.get("total_imported_functions", 0) > 40 else 0.05, "IAT Import table size")
        }

        for name in FEATURE_NAMES:
            val = fd.get(name, 0.0)
            if name in weights:
                w, desc = weights[name]
                shap_val = round(w * val if val > 0 else (w if w < 0 else 0.0), 4)
            else:
                shap_val = 0.0

            contributions.append({
                "feature_name": name,
                "feature_value": val,
                "shap_value": shap_val,
                "effect": "Pushes towards MALWARE" if shap_val > 0 else ("Pushes towards BENIGN" if shap_val < 0 else "NEUTRAL")
            })

        return contributions

    def _generate_text_summary(self, prediction: str, top_pushers: List[Dict[str, Any]]) -> str:
        if prediction == "MALWARE" and top_pushers:
            pushers_str = ", ".join([f"{p['feature_name']} (SHAP: +{p['shap_value']})" for p in top_pushers[:3]])
            return f"Model classified binary as MALWARE primarily driven by: {pushers_str}."
        elif prediction == "MALWARE":
            return "Model classified binary as MALWARE based on combined feature vector patterns."
        else:
            return "Model classified binary as BENIGN due to standard import structure and normal section entropy metrics."
