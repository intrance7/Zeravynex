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
| **Phase 1** | **Malware Analysis Engine** | PE parsing, section entropy, import/export analysis, string extraction, IOC extractor & CLI interface | ✅ Complete |
| **Phase 2** | **Heuristics & YARA Engine** | Deterministic security rules, YARA rule scanner, and evidence-weighted risk scoring | ✅ Complete |
| **Phase 3** | **Machine Learning & Explainability** | Feature extraction schema, dataset pipeline, XGBoost classifier, and SHAP explanations | ✅ Complete |
| **Phase 4** | **Decision Fusion Engine** | Multi-signal aggregation engine combining Heuristics, YARA, ML, and IOC score weights | ✅ Complete |
| **Phase 5** | **Backend API & Task Queue** | FastAPI REST endpoints, background analysis worker queue, and SQLite persistence | ✅ Complete |
| **Phase 6** | **AI Analyst Engine** | LLM-based narrative generation, MITRE ATT&CK mapping, and automated threat recommendations | 🔲 Planned |
| **Phase 7** | **Web & Desktop Applications** | React + TypeScript dashboard with Recharts visualizations and optional Tauri desktop shell | 🔲 Planned |

---

## Phase 1, 2 & 3 Completed Features

- [x] **Static PE Analyzer**: Hasher (`MD5`, `SHA1`, `SHA256`, entropy), PE Header, Section Permissions (`RWX`), Import/Export IAT categorizer, ASCII/Unicode String Extractor, IOC Extractor (`URLs`, `IPs`, `Domains`, `Registry Keys`, `Mutexes`)
- [x] **Deterministic Heuristic Engine**: Behavioral rule matches for Process Injection, High Entropy Packers, Ransomware notes, Persistence, C2 Infrastructure
- [x] **YARA Scanner Engine**: Signature scanner for UPX packers, generic high entropy signatures, injection primitives, ransomware notes
- [x] **Weighted Risk Engine**: 0–100 normalized risk score calculation & automated threat verdict (`CLEAN / LOW RISK`, `SUSPICIOUS`, `HIGH RISK`, `CRITICAL MALWARE`)
- [x] **ML Classifier & Feature Extractor**: 25D PE feature vector extractor (`PEFeatureExtractor`) and calibrated `RandomForestClassifier` predicting malware probability & confidence
- [x] **SHAP Explainability Engine**: SHAP feature attribution calculator (`SHAPExplainer`) highlighting top malware feature pushers vs benign feature pushers
- [x] **CLI Tool & Test Suite**: `python -m app.engines.static_analysis.cli <file>` and complete test suite (`backend/tests/`)

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
