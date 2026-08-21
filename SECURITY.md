# 🔒 Security Policy

Zeravynex is a malware analysis platform designed to inspect potentially malicious software safely. We take security vulnerabilities within Zeravynex and responsible disclosure very seriously.

---

## 🛡️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| `0.1.x` | :white_check_mark: |
| `< 0.1` | :x:                |

---

## ⚠️ Malware Safety & Operational Security

> **Important Operational Note:**
> Zeravynex is designed to perform **Static Analysis ONLY**. Uploaded binaries are never dynamically executed on the host system. However, when handling live malware samples:
> - Always run Zeravynex in isolated environments (containers, air-gapped VMs, or dedicated sandbox hosts).
> - Never store live malware samples in publicly accessible or unencrypted storage.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability in Zeravynex (such as arbitrary code execution in parsing engines, path traversal during sample submission, or API authorization bypasses):

1. **Do NOT** disclose the issue publicly or open a public GitHub issue.
2. Use **[GitHub Private Vulnerability Reporting](https://github.com/intrance7/Zeravynex/security/advisories/new)** to submit your report confidentially.
3. Include detailed steps to reproduce the vulnerability, proof of concept (PoC), and potential impact.

### What to Expect:
- **Acknowledgment:** We will acknowledge receipt of your vulnerability report within 48 hours.
- **Assessment:** We will validate and triage the issue and determine severity.
- **Fix & Disclosure:** We will develop and test a security patch and coordinate a public release/disclosure timeline.
