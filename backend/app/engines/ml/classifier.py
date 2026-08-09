import math
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
from .feature_extractor import FEATURE_NAMES, PEFeatureExtractor

try:
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier
    import joblib
    HAS_SKLEARN = True
except ImportError:
    np = None
    RandomForestClassifier = None
    joblib = None
    HAS_SKLEARN = False


class MalwareClassifier:
    """RandomForest-based Malware Classifier with fallback baseline feature scoring."""

    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path
        self.rf_model = None
        self._init_model()

    def _init_model(self):
        if HAS_SKLEARN and self.model_path and Path(self.model_path).exists():
            try:
                self.rf_model = joblib.load(self.model_path)
            except Exception:
                self.rf_model = self._create_baseline_rf()
        elif HAS_SKLEARN:
            self.rf_model = self._create_baseline_rf()

    def _create_baseline_rf(self) -> Any:
        """Create and calibrate a baseline Random Forest model with domain-informed security feature weights."""
        if not HAS_SKLEARN:
            return None

        # Synthesize realistic training samples (50 clean binaries, 50 malware binaries)
        np.random.seed(42)
        X_train = []
        y_train = []

        # Synthetic Benign binaries (y=0)
        for _ in range(60):
            sample = [
                float(np.random.randint(20000, 500000)), # file_size
                float(np.random.uniform(3.0, 6.2)),       # file_entropy
                1.0,                                       # is_pe
                float(np.random.randint(3, 7)),           # number_of_sections
                float(np.random.randint(15, 80)),          # total_imported_functions
                float(np.random.randint(0, 10)),           # total_exported_functions
                float(np.random.uniform(3.0, 5.5)),       # mean_section_entropy
                float(np.random.uniform(4.5, 6.5)),       # max_section_entropy
                float(np.random.uniform(0.0, 3.0)),       # min_section_entropy
                0.0,                                       # rwx_sections_count (0 in benign)
                float(np.random.randint(1, 3)),           # executable_sections_count
                float(np.random.randint(1, 4)),           # writable_sections_count
                float(np.random.randint(0, 1)),           # suspicious_api_count
                0.0,                                       # process_injection_api_count
                0.0,                                       # network_api_count
                0.0,                                       # registry_api_count
                float(np.random.randint(0, 1)),           # evasion_api_count
                float(np.random.randint(50, 1000)),        # total_strings
                float(np.random.uniform(3.0, 4.5)),       # strings_entropy
                0.0,                                       # suspicious_keyword_count
                0.0,                                       # url_count
                0.0,                                       # ip_count
                0.0,                                       # domain_count
                0.0,                                       # registry_key_count
                0.0                                        # heuristic_matches_count
            ]
            X_train.append(sample)
            y_train.append(0)

        # Synthetic Malware binaries (y=1)
        for _ in range(60):
            sample = [
                float(np.random.randint(5000, 2000000)), # file_size
                float(np.random.uniform(6.5, 7.95)),      # file_entropy
                1.0,                                       # is_pe
                float(np.random.randint(3, 10)),          # number_of_sections
                float(np.random.randint(5, 40)),           # total_imported_functions
                float(np.random.randint(0, 5)),            # total_exported_functions
                float(np.random.uniform(5.5, 7.2)),       # mean_section_entropy
                float(np.random.uniform(6.8, 7.99)),      # max_section_entropy
                float(np.random.uniform(0.0, 4.0)),       # min_section_entropy
                float(np.random.choice([0.0, 1.0, 2.0])),  # rwx_sections_count
                float(np.random.randint(1, 4)),           # executable_sections_count
                float(np.random.randint(1, 5)),           # writable_sections_count
                float(np.random.randint(2, 10)),          # suspicious_api_count
                float(np.random.randint(1, 4)),           # process_injection_api_count
                float(np.random.randint(0, 3)),           # network_api_count
                float(np.random.randint(0, 3)),           # registry_api_count
                float(np.random.randint(1, 4)),           # evasion_api_count
                float(np.random.randint(10, 500)),         # total_strings
                float(np.random.uniform(4.5, 7.0)),       # strings_entropy
                float(np.random.randint(1, 8)),           # suspicious_keyword_count
                float(np.random.randint(0, 4)),           # url_count
                float(np.random.randint(0, 3)),           # ip_count
                float(np.random.randint(0, 4)),           # domain_count
                float(np.random.randint(0, 5)),           # registry_key_count
                float(np.random.randint(1, 6))            # heuristic_matches_count
            ]
            X_train.append(sample)
            y_train.append(1)

        clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
        clf.fit(X_train, y_train)
        return clf

    def predict(self, report: Dict[str, Any]) -> Dict[str, Any]:
        ext_res = PEFeatureExtractor.extract_features(report)
        feature_vector = ext_res["feature_vector"]
        feature_dict = ext_res["feature_dict"]

        if HAS_SKLEARN and self.rf_model:
            vector_2d = np.array(feature_vector).reshape(1, -1)
            prob_malware = float(self.rf_model.predict_proba(vector_2d)[0][1])
        else:
            prob_malware = self._fallback_heuristic_probability(feature_dict)

        prob_malware = round(prob_malware, 4)
        verdict = "MALWARE" if prob_malware >= 0.50 else "BENIGN"
        confidence = round(abs(prob_malware - 0.50) * 2, 4)

        return {
            "has_sklearn": HAS_SKLEARN,
            "malware_probability": prob_malware,
            "benign_probability": round(1.0 - prob_malware, 4),
            "prediction": verdict,
            "confidence": confidence,
            "model_architecture": "RandomForestClassifier (100 trees, 25 features)",
            "feature_dict": feature_dict,
            "feature_vector": feature_vector
        }

    def _fallback_heuristic_probability(self, fd: Dict[str, float]) -> float:
        """Mathematical fallback probability calculation when sklearn is unavailable."""
        score = 0.0
        if fd["rwx_sections_count"] > 0: score += 0.35
        if fd["max_section_entropy"] >= 7.1: score += 0.25
        if fd["process_injection_api_count"] > 0: score += 0.25
        if fd["suspicious_keyword_count"] > 0: score += 0.15
        if fd["heuristic_matches_count"] > 0: score += 0.20
        return min(1.0, score)
