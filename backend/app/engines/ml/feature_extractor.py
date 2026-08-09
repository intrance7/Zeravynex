from typing import Dict, List, Any


FEATURE_NAMES = [
    "file_size",
    "file_entropy",
    "is_pe",
    "number_of_sections",
    "total_imported_functions",
    "total_exported_functions",
    "mean_section_entropy",
    "max_section_entropy",
    "min_section_entropy",
    "rwx_sections_count",
    "executable_sections_count",
    "writable_sections_count",
    "suspicious_api_count",
    "process_injection_api_count",
    "network_api_count",
    "registry_api_count",
    "evasion_api_count",
    "total_strings",
    "strings_entropy",
    "suspicious_keyword_count",
    "url_count",
    "ip_count",
    "domain_count",
    "registry_key_count",
    "heuristic_matches_count"
]


class PEFeatureExtractor:
    """Transforms static PE analysis report dict into a normalized 25-dimensional numeric feature vector."""

    @classmethod
    def extract_features(cls, report: Dict[str, Any]) -> Dict[str, Any]:
        hashes = report.get("hashes", {})
        pe_header = report.get("pe_header", {})
        sections = report.get("sections", [])
        imports_exports = report.get("imports_exports", {})
        strings_summary = report.get("strings_summary", {})
        iocs = report.get("iocs", {})
        heuristic_analysis = report.get("heuristic_analysis", {})

        # General file & PE stats
        file_size = float(hashes.get("size_bytes", 0))
        file_entropy = float(hashes.get("entropy", 0.0))
        is_pe = 1.0 if pe_header.get("is_pe") else 0.0
        num_sections = float(pe_header.get("number_of_sections", len(sections)))
        total_imported = float(imports_exports.get("total_imported_functions", 0))
        total_exported = float(imports_exports.get("total_exported_functions", 0))

        # Section entropy & permission stats
        if sections:
            entropies = [float(s.get("entropy", 0.0)) for s in sections]
            mean_entropy = round(sum(entropies) / len(entropies), 4)
            max_entropy = max(entropies)
            min_entropy = min(entropies)
        else:
            mean_entropy = 0.0
            max_entropy = 0.0
            min_entropy = 0.0

        rwx_count = float(sum(1 for s in sections if s.get("is_rwx")))
        exec_count = float(sum(1 for s in sections if s.get("is_executable")))
        write_count = float(sum(1 for s in sections if s.get("is_writable")))

        # Suspicious API counts
        susp_apis = imports_exports.get("suspicious_apis", [])
        susp_api_count = float(len(susp_apis))
        process_inj_count = float(sum(1 for a in susp_apis if a.get("category") == "Process Injection & Execution"))
        network_api_count = float(sum(1 for a in susp_apis if a.get("category") == "Network & C2 Activity"))
        reg_api_count = float(sum(1 for a in susp_apis if a.get("category") == "Registry & Persistence"))
        evasion_api_count = float(sum(1 for a in susp_apis if a.get("category") == "Anti-Analysis & Evasion"))

        # Strings & IOC counts
        total_strings = float(strings_summary.get("total_strings", 0))
        strings_entropy = float(strings_summary.get("entropy", 0.0))
        kw_matches_count = float(len(strings_summary.get("suspicious_keyword_matches", [])))

        url_count = float(len(iocs.get("urls", [])))
        ip_count = float(len(iocs.get("ip_addresses", [])))
        domain_count = float(len(iocs.get("domains", [])))
        reg_key_count = float(len(iocs.get("registry_keys", [])))

        heur_matches_count = float(heuristic_analysis.get("total_heuristic_matches", 0))

        feature_dict = {
            "file_size": file_size,
            "file_entropy": file_entropy,
            "is_pe": is_pe,
            "number_of_sections": num_sections,
            "total_imported_functions": total_imported,
            "total_exported_functions": total_exported,
            "mean_section_entropy": mean_entropy,
            "max_section_entropy": max_entropy,
            "min_section_entropy": min_entropy,
            "rwx_sections_count": rwx_count,
            "executable_sections_count": exec_count,
            "writable_sections_count": write_count,
            "suspicious_api_count": susp_api_count,
            "process_injection_api_count": process_inj_count,
            "network_api_count": network_api_count,
            "registry_api_count": reg_api_count,
            "evasion_api_count": evasion_api_count,
            "total_strings": total_strings,
            "strings_entropy": strings_entropy,
            "suspicious_keyword_count": kw_matches_count,
            "url_count": url_count,
            "ip_count": ip_count,
            "domain_count": domain_count,
            "registry_key_count": reg_key_count,
            "heuristic_matches_count": heur_matches_count
        }

        feature_vector = [feature_dict[name] for name in FEATURE_NAMES]

        return {
            "feature_names": FEATURE_NAMES,
            "feature_dict": feature_dict,
            "feature_vector": feature_vector
        }
