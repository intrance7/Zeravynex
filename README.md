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

## Project Roadmap & Phases

Zeravynex development is structured into clear, incremental phases to ensure a robust, production-grade security architecture:

| Phase | Phase Name | Description | Status |
|-------|------------|-------------|--------|
| **Phase 0** | **Project Specification** | System architecture, risk model, and technology stack definition | ✅ Complete |
| **Phase 1** | **Malware Analysis Engine** | PE parsing, section entropy, import/export analysis, string extraction, IOC extractor & CLI interface | 🔄 **In Progress** |
| **Phase 2** | **Heuristics & YARA Engine** | Deterministic security rules, YARA rule scanner, and evidence-weighted risk scoring | 🔲 Planned |
| **Phase 3** | **Machine Learning & Explainability** | Feature extraction schema, dataset pipeline, XGBoost classifier, and SHAP explanations | 🔲 Planned |
| **Phase 4** | **Decision Fusion Engine** | Multi-signal aggregation engine combining Heuristics, YARA, ML, and IOC score weights | 🔲 Planned |
| **Phase 5** | **Backend API & Task Queue** | FastAPI REST endpoints, background analysis worker queue, and SQLite/Postgres persistence | 🔲 Planned |
| **Phase 6** | **AI Analyst Engine** | LLM-based narrative generation, MITRE ATT&CK mapping, and automated threat recommendations | 🔲 Planned |
| **Phase 7** | **Web & Desktop Applications** | React + TypeScript dashboard with Recharts visualizations and optional Tauri desktop shell | 🔲 Planned |

---

## Phase 1 Breakdown: Malware Analysis Engine

- [x] **01_hashing.py / Hasher**: MD5, SHA1, SHA256, file size calculation
- [x] **02_pe_parser.py**: DOS/COFF/Optional headers, Machine architecture, Subsystem, Compile timestamp, EntryPoint, ImageBase
- [x] **03_sections.py**: Section names, Raw size vs Virtual size, Memory characteristics (Readable/Writable/Executable), Section entropy calculation
- [x] **04_imports_exports.py**: Import table parsing, Export symbols, Suspicious API indicator tagging (Process Injection, Memory Manipulation, Network, Registry, Service management APIs)
- [x] **05_strings.py**: ASCII and Wide (UTF-16LE) string extraction, minimum length filtering, entropy metrics
- [x] **06_ioc_extractor.py**: Extraction of IPv4 addresses, Domains, URLs, Registry keys, File paths, and Mutex patterns
- [x] **07_analyzer.py & CLI**: Central engine orchestrator producing normalized JSON reports and CLI runner (`zeravynex analyze <file>`)

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
