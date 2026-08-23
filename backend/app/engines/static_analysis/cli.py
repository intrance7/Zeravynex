import sys
import json
import html
import argparse
from pathlib import Path
from .analyzer import StaticAnalyzer


def _escape_html(value) -> str:
    return html.escape(str(value)) if value is not None else ""


def generate_html_report(result: dict) -> str:
    """Generate a clean, standalone HTML summary report from analysis results.
    
    All dynamic strings are safely escaped via html.escape() to prevent HTML/XSS injection.
    """
    metadata = result.get("metadata", {})
    hashes = result.get("hashes", {})
    pe = result.get("pe_header", {})
    risk = result.get("risk_analysis", {})
    ml = result.get("ml_analysis", {})
    shap = ml.get("shap_explainability", {})
    heuristic = result.get("heuristic_analysis", {})
    yara = result.get("yara_analysis", {})
    iocs = result.get("iocs", {})
    sections = result.get("sections", [])
    imports_exports = result.get("imports_exports", {})

    verdict = _escape_html(risk.get("verdict", "UNKNOWN"))
    risk_score = risk.get("risk_score", 0)
    severity_level = _escape_html(risk.get("severity_level", "INFO"))
    
    if risk_score >= 70 or verdict in ("MALICIOUS", "CRITICAL"):
        badge_color = "#dc3545"
    elif risk_score >= 40 or verdict in ("SUSPICIOUS", "HIGH", "MEDIUM"):
        badge_color = "#ffc107"
    else:
        badge_color = "#28a745"

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zeravynex Threat Analysis - {_escape_html(metadata.get('file_name', 'Report'))}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; margin: 0; padding: 20px; }}
        .container {{ max-width: 1000px; margin: 0 auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 24px; }}
        h1, h2, h3 {{ color: #58a6ff; border-bottom: 1px solid #21262d; padding-bottom: 8px; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #30363d; padding-bottom: 16px; margin-bottom: 20px; }}
        .badge {{ background-color: {badge_color}; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 1.1em; text-transform: uppercase; }}
        .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }}
        .card {{ background-color: #21262d; border: 1px solid #30363d; border-radius: 6px; padding: 16px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
        th, td {{ text-align: left; padding: 8px; border-bottom: 1px solid #30363d; font-size: 0.9em; }}
        th {{ background-color: #161b22; color: #8b949e; }}
        ul {{ padding-left: 20px; margin: 8px 0; }}
        li {{ margin-bottom: 4px; }}
        .score-meter {{ font-size: 1.5em; font-weight: bold; color: {badge_color}; }}
        .footer {{ text-align: center; margin-top: 24px; font-size: 0.8em; color: #8b949e; border-top: 1px solid #21262d; padding-top: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1 style="margin:0; border:none; padding:0; color:#f0f6fc;">ZERAVYNEX THREAT REPORT</h1>
                <span style="color:#8b949e;">Target Binary: {_escape_html(metadata.get('file_name', 'N/A'))}</span>
            </div>
            <div class="badge">{verdict}</div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>Risk & Classification Summary</h3>
                <p><strong>Verdict:</strong> {verdict}</p>
                <p><strong>Risk Score:</strong> <span class="score-meter">{risk_score} / 100</span> [{severity_level}]</p>
                <p><strong>ML Prediction:</strong> {_escape_html(ml.get('prediction', 'N/A'))} (Probability: {ml.get('malware_probability', 0.0)*100:.1f}%)</p>
                <p><strong>Engine Version:</strong> {_escape_html(metadata.get('engine_version', 'N/A'))}</p>
            </div>
            <div class="card">
                <h3>File Hashes & Metadata</h3>
                <p><strong>SHA256:</strong> <code style="font-size:0.85em;">{_escape_html(hashes.get('sha256', 'N/A'))}</code></p>
                <p><strong>MD5:</strong> <code>{_escape_html(hashes.get('md5', 'N/A'))}</code></p>
                <p><strong>SHA1:</strong> <code>{_escape_html(hashes.get('sha1', 'N/A'))}</code></p>
                <p><strong>File Size:</strong> {hashes.get('size_bytes', 0)} bytes</p>
                <p><strong>Entropy:</strong> {hashes.get('entropy', 0.0)} / 8.0</p>
            </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
            <h3>PE Header Information</h3>
            <p><strong>PE Binary:</strong> {_escape_html(pe.get('is_pe', False))}</p>
"""

    if pe.get("is_pe"):
        html_content += f"""            <p><strong>Architecture:</strong> {_escape_html(pe.get('architecture', 'N/A'))} | <strong>Type:</strong> {_escape_html(pe.get('file_type', 'N/A'))}</p>
            <p><strong>Entry Point:</strong> {_escape_html(pe.get('entry_point', 'N/A'))} | <strong>Compile Timestamp:</strong> {_escape_html(pe.get('compile_timestamp', 'N/A'))}</p>
            <p><strong>Sections Count:</strong> {len(sections)} | <strong>Imports:</strong> {imports_exports.get('total_imported_functions', 0)} functions from {len(imports_exports.get('imports', {}))} DLLs</p>
"""
    html_content += """        </div>

        <div class="card" style="margin-bottom: 20px;">
            <h3>ML & SHAP Explainability</h3>
            <p><strong>Architecture:</strong> """ + _escape_html(ml.get("architecture", "N/A")) + """</p>
            <p><strong>Summary:</strong> """ + _escape_html(shap.get("explanation_summary", "N/A")) + """</p>
            <h4>Top Malware Indicators (Pushers):</h4>
            <ul>
"""
    for pusher in shap.get("top_malware_indicators", [])[:5]:
        html_content += f"                <li><strong>{_escape_html(pusher.get('feature_name'))}:</strong> {_escape_html(pusher.get('feature_value'))} (SHAP: +{pusher.get('shap_value', 0.0):.4f})</li>\n"

    html_content += """            </ul>
        </div>

        <div class="grid">
            <div class="card">
                <h3>Heuristic Rule Matches (""" + str(heuristic.get("total_heuristic_matches", 0)) + """)</h3>
                <ul>
"""
    for hmatch in heuristic.get("matches", []):
        html_content += f"                    <li>[{_escape_html(hmatch.get('severity'))}] <strong>{_escape_html(hmatch.get('rule_name'))}:</strong> {_escape_html(hmatch.get('description'))} (+{hmatch.get('weight', 0)})</li>\n"

    html_content += """                </ul>
            </div>
            <div class="card">
                <h3>YARA Rule Matches (""" + str(yara.get("total_matches", 0)) + """)</h3>
                <ul>
"""
    for ymatch in yara.get("matches", []):
        html_content += f"                    <li>[{_escape_html(ymatch.get('severity'))}] <strong>{_escape_html(ymatch.get('rule'))}</strong> ({_escape_html(ymatch.get('category', 'General'))})</li>\n"

    html_content += """                </ul>
            </div>
        </div>

        <div class="card">
            <h3>Extracted Indicators of Compromise (IOCs)</h3>
            <p><strong>URLs (""" + str(len(iocs.get("urls", []))) + """):</strong></p>
            <ul>
"""
    for url_item in iocs.get("urls", []):
        html_content += f"                <li><code>{_escape_html(url_item)}</code></li>\n"

    html_content += """            </ul>
            <p><strong>IP Addresses (""" + str(len(iocs.get("ip_addresses", []))) + """):</strong></p>
            <ul>
"""
    for ip_item in iocs.get("ip_addresses", []):
        html_content += f"                <li><code>{_escape_html(ip_item)}</code></li>\n"

    html_content += """            </ul>
            <p><strong>Domains (""" + str(len(iocs.get("domains", []))) + """):</strong></p>
            <ul>
"""
    for dom_item in iocs.get("domains", []):
        html_content += f"                <li><code>{_escape_html(dom_item)}</code></li>\n"

    html_content += """            </ul>
            <p><strong>Registry Keys (""" + str(len(iocs.get("registry_keys", []))) + """):</strong></p>
            <ul>
"""
    for reg_item in iocs.get("registry_keys", []):
        html_content += f"                <li><code>{_escape_html(reg_item)}</code></li>\n"

    html_content += f"""            </ul>
        </div>

        <div class="footer">
            Generated by Zeravynex Static Malware Analysis Engine
        </div>
    </div>
</body>
</html>
"""
    return html_content


def main(argv=None):
    parser = argparse.ArgumentParser(
        prog="Zeravynex Static Analyzer",
        description="Zeravynex Static Malware Analysis, Threat Detection & ML Explainability Engine",
        epilog="""Examples:
  python -m app.engines.static_analysis.cli sample.exe
  python -m app.engines.static_analysis.cli sample.exe --json report.json
  python -m app.engines.static_analysis.cli sample.exe --html report.html
  python -m app.engines.static_analysis.cli sample.exe --output-json report.json --output-html report.html
  python -m app.engines.static_analysis.cli sample.exe -o report.json --pretty
""",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("file_path", type=str, help="Path to the binary file (.exe, .dll, etc.) to analyze")
    parser.add_argument(
        "-o", "--output", "--json", "--output-json",
        type=str, default=None, dest="output_json",
        help="Path to save JSON analysis output report"
    )
    parser.add_argument(
        "--html", "--output-html",
        type=str, default=None, dest="output_html",
        help="Path to save standalone HTML summary report"
    )
    parser.add_argument("--pretty", action="store_true", help="Print formatted JSON output to console")

    args = parser.parse_args(argv)

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

    if args.output_json:
        out_path = Path(args.output_json)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
        print(f"\n[✓] Detailed JSON report saved to: {out_path.resolve()}")

    if args.output_html:
        html_path = Path(args.output_html)
        html_data = generate_html_report(result)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_data)
        print(f"[✓] Standalone HTML report saved to: {html_path.resolve()}")

    if args.pretty and not args.output_json:
        print("\n" + json.dumps(result, indent=2))

    print(f"============================================================")


if __name__ == "__main__":
    main()

