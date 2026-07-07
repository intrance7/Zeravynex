# 🛡️ Zeravynex

**Explainable AI Malware Analysis Platform**

Zeravynex is a static malware analysis platform that accepts Windows PE files (`.exe`, `.dll`), extracts deep structural and behavioral indicators, scores them with machine learning, and explains its reasoning with AI-powered narrative analysis.

---

## Features

- **PE Static Analysis** — Headers, sections, imports, exports, strings, entropy
- **YARA Engine** — Rule-based detection across ransomware, trojans, packers, and suspicious behaviors
- **IOC Extraction** — URLs, domains, IPs, emails, registry keys, file paths, mutexes
- **Machine Learning** — Malware probability with SHAP-based explainability
- **Risk Scoring** — Evidence-weighted risk scores with severity classification
- **AI Analyst** — LLM-powered executive summaries, ATT&CK mapping, investigation guidance
- **React Dashboard** — Modern web interface with entropy charts, risk gauges, and SHAP visualizations

## Architecture

```
FILE SUBMISSION → SECURE UPLOAD → ANALYSIS WORKER
                                       │
                          ┌────────────┼────────────┐
                          ▼            ▼            ▼
                     YARA ENGINE  ML ENGINE    IOC ENGINE
                          │            │            │
                          └────────────┼────────────┘
                                       ▼
                                  RISK ENGINE
                                       │
                                       ▼
                               INCIDENT DATABASE
                                       │
                                       ▼
                              AI ANALYST ENGINE
                                       │
                                       ▼
                               REACT DASHBOARD
```

## Safety

> ⚠️ **Uploaded files are never executed.** Zeravynex performs static analysis only.

## Status

| Stage | Description | Status |
|-------|-------------|--------|
| Stage 0 | Project Specification | ✅ Complete |
| Stage 1 | Malware Analysis Engine | 🔲 Not Started |
| Stage 2 | ML Engine | 🔲 Not Started |
| Stage 3 | Web Application | 🔲 Not Started |
| Stage 4 | AI Analyst Engine | 🔲 Not Started |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, Celery, PostgreSQL |
| PE Analysis | pefile, yara-python, custom extractors |
| ML | scikit-learn, SHAP |
| Frontend | React 18+, TypeScript, Vite, Vanilla CSS |
| Infrastructure | Docker, Nginx, GitHub Actions |

## License

MIT
