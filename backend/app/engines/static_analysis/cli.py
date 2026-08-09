import sys
import json
import argparse
from pathlib import Path
from .analyzer import StaticAnalyzer


def main():
    parser = argparse.ArgumentParser(
        prog="Zeravynex Static Analyzer",
        description="Zeravynex Static Malware Analysis, Threat Detection & ML Explainability Engine"
    )
    parser.add_argument("file_path", type=str, help="Path to the binary file (.exe, .dll, etc.) to analyze")
    parser.add_argument("-o", "--output", type=str, default=None, help="Path to save JSON analysis output file")
    parser.add_argument("--pretty", action="store_true", help="Print formatted JSON output to console")

    args = parser.parse_args()

    file_path = Path(args.file_path)
    if not file_path.exists():
        print(f"Error: File '{args.file_path}' does not exist.", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Analyzing target binary: {file_path.name} ...")
    analyzer = StaticAnalyzer()
    result = analyzer.analyze(file_path)

    risk = result.get("risk_analysis", {})
    ml = result.get("ml_analysis", {})
    shap = ml.get("shap_explainability", {})

    print(f"\n================ ZERAVYNEX THREAT ANALYSIS ==================")
    print(f"VERDICT     : {risk.get('verdict', 'UNKNOWN')}")
    print(f"RISK SCORE  : {risk.get('risk_score', 0)} / 100 [{risk.get('severity_level', 'INFO')}]")
    print(f"ML PREDICT  : {ml.get('prediction', 'UNKNOWN')} (Probability: {ml.get('malware_probability', 0.0)*100:.1f}%)")
    print(f"File Name   : {result['metadata']['file_name']}")
    print(f"SHA256      : {result['hashes']['sha256']}")
    print(f"File Size   : {result['hashes']['size_bytes']} bytes")
    print(f"File Entropy: {result['hashes']['entropy']} / 8.0")
    print(f"PE Binary   : {result['pe_header'].get('is_pe', False)}")
    
    if result['pe_header'].get('is_pe'):
        print(f"Arch / Type : {result['pe_header']['architecture']} | {result['pe_header']['file_type']}")
        print(f"Entry Point : {result['pe_header']['entry_point']}")
        print(f"Compile Time: {result['pe_header']['compile_timestamp']}")
        print(f"Sections    : {len(result['sections'])}")
        print(f"Imports     : {result['imports_exports']['total_imported_functions']} functions from {len(result['imports_exports']['imports'])} DLLs")

    print(f"\n[ML] Model & SHAP Explainability:")
    print(f"    - Architecture : {ml.get('architecture')}")
    print(f"    - ML Summary   : {shap.get('explanation_summary')}")
    print(f"    - Top Pushers  :")
    for pusher in shap.get("top_malware_indicators", [])[:3]:
        print(f"      + {pusher['feature_name']} = {pusher['feature_value']} (SHAP: +{pusher['shap_value']:.4f})")

    print(f"\n[!] Heuristic Rule Matches ({result['heuristic_analysis']['total_heuristic_matches']}):")
    for match in result['heuristic_analysis']['matches']:
        print(f"    - [{match['severity']}] {match['rule_name']} (Weight: +{match['weight']})")

    print(f"\n[!] YARA Rule Matches ({result['yara_analysis']['total_matches']}):")
    for ymatch in result['yara_analysis']['matches']:
        print(f"    - [{ymatch['severity']}] {ymatch['rule']} ({ymatch.get('category', 'General')})")

    print(f"\n[+] Extracted IOCs:")
    print(f"    - URLs    : {len(result['iocs']['urls'])}")
    print(f"    - IPs     : {len(result['iocs']['ip_addresses'])}")
    print(f"    - Domains : {len(result['iocs']['domains'])}")
    print(f"    - Registry: {len(result['iocs']['registry_keys'])}")

    if args.output:
        out_path = Path(args.output)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
        print(f"\n[✓] Detailed report saved to: {out_path.resolve()}")

    if args.pretty and not args.output:
        print("\n" + json.dumps(result, indent=2))

    print(f"============================================================")


if __name__ == "__main__":
    main()
