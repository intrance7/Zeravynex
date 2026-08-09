import sys
import json
import argparse
from pathlib import Path
from .analyzer import StaticAnalyzer


def main():
    parser = argparse.ArgumentParser(
        prog="Zeravynex Static Analyzer",
        description="Phase 1 Static Malware Analysis Engine for PE Binaries"
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

    # Print summary indicators
    print(f"\n================ ZERAVYNEX ANALYSIS SUMMARY ================")
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
        print(f"Exports     : {result['imports_exports']['total_exported_functions']} exported symbol(s)")
    
    print(f"\n[!] Security Indicators ({len(result['indicators'])}):")
    for ind in result['indicators']:
        print(f"    - [{ind['type']}] {ind.get('category', '')}: {ind['message']}")

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
