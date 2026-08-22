# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║            ZERAVYNEX  ─  PROJECT ARCHITECTURE MANIFEST v2.0                 ║
# ║          Explainable AI Static Malware Analysis Platform                    ║
# ║                                                                             ║
# ║  This file is the single source of truth for every component, model, API,   ║
# ║  engine, dependency, and configuration in the Zeravynex platform.           ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

---

## 1. TECH STACK OVERVIEW

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.109+ (async-capable ASGI)
- **ORM**: SQLAlchemy 2.0+ (sync sessions)
- **Databases**: SQLite (dev) / PostgreSQL 16 (production)
- **Cache**: Redis 7 with in-memory LRU fallback
- **Task Queue**: Celery 5.3+ with Redis broker
- **Object Storage**: Local filesystem / S3-compatible (MinIO, AWS S3, Cloudflare R2)
- **Server**: Uvicorn (ASGI) with multi-worker support

### Frontend
- **Language**: TypeScript 6.0+
- **Framework**: React 19 (SPA, client-side routing)
- **Build Tool**: Vite 8.2+
- **Styling**: TailwindCSS 3.4
- **Animation**: Framer Motion 13
- **Charts**: Recharts 3.10
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)
- **Routing**: React Router v7

### Desktop (Roadmap)
- **Shell**: Tauri 2.x (Rust + WebView2)
- **Target**: Windows 10/11 (.msi / .exe installer)

### DevOps & Infrastructure
- **Containers**: Docker (multi-stage builds)
- **Orchestration**: Docker Compose (6-service stack)
- **Web Server**: Nginx 1.27 (SPA routing + API reverse proxy)
- **CI/CD**: GitHub Actions (CI Pipeline + CodeQL Security)

---

## 2. BACKEND MODULES

### 2.1 Core Infrastructure (`backend/app/core/`)

| File | Purpose |
|---|---|
| `config.py` | Centralized Pydantic-style settings loaded from environment variables |
| `database.py` | SQLAlchemy engine, session factory, connection pooling (SQLite/PostgreSQL) |
| `cache.py` | Redis cache manager with in-memory LRU fallback, report caching by SHA256 |
| `storage.py` | Abstract StorageProvider with Local and S3 implementations |
| `celery_app.py` | Celery distributed task queue configuration |
| `middleware.py` | Production middleware: RequestID, SecurityHeaders, RateLimiting, FileSizeLimit |
| `logging.py` | Structured JSON logging (production) / colored dev logging |

### 2.2 API Layer (`backend/app/api/`)

| File | Purpose |
|---|---|
| `endpoints.py` | All REST API route handlers |

### 2.3 Database Models (`backend/app/models/`)

| Model | Table | Fields |
|---|---|---|
| `AnalysisResult` | `analysis_results` | id, file_name, sha256, md5, file_size_bytes, risk_score, verdict, severity_level, full_report (JSON), created_at |
| `ThreatIndicator` | `threat_indicators` | id, analysis_id (FK), source, rule_name, severity, weight, details (JSON) |

### 2.4 Analysis Engines (`backend/app/engines/`)

#### Static Analysis Suite (`engines/static_analysis/`)

| File | Engine | Description |
|---|---|---|
| `analyzer.py` | **StaticAnalyzer** | Central orchestrator that sequences all analysis phases and composes the final report |
| `pe_parser.py` | **PEParser** | Parses DOS/NT/Optional headers, entry points, compile timestamps, machine architectures |
| `sections.py` | **SectionAnalyzer** | Shannon entropy per section, RWX permission detection, virtual/raw size ratio |
| `imports_exports.py` | **ImportsExportsAnalyzer** | Import Address Table (IAT) parsing, suspicious WinAPI categorization |
| `strings.py` | **StringExtractor** | ASCII/Unicode string extraction, keyword matching, entropy analysis |
| `hashing.py` | **Hasher** | MD5, SHA-1, SHA-256 file hashing plus full-file Shannon entropy |
| `ioc_extractor.py` | **IOCExtractor** | Regex extraction of IPv4, domains, URLs, registry keys, file paths, mutexes |
| `cli.py` | **CLI** | Command-line interface for standalone terminal analysis |

#### Signature & Heuristic Engines

| File | Engine | Description |
|---|---|---|
| `heuristic_engine.py` | **HeuristicEngine** | Rule-based detection: entry point anomalies, high entropy packing, RWX sections, missing imports |
| `yara_engine.py` | **YARAEngine** | Compiles and matches YARA rules from `yara_rules/` directory against PE binaries |

#### Machine Learning & Explainability (`engines/ml/`)

| File | Engine | Description |
|---|---|---|
| `feature_extractor.py` | **FeatureExtractor** | Extracts 25-dimensional numerical feature vector from PE structural metadata |
| `classifier.py` | **MalwareClassifier** | Random Forest classifier producing calibrated malware probability scores |
| `explainer.py` | **SHAPExplainer** | TreeExplainer computing Shapley values, returns top features pushing malware/benign |

#### Decision & Intelligence Engines

| File | Engine | Description |
|---|---|---|
| `decision_fusion.py` | **DecisionFusionEngine** | Multi-signal risk aggregator: weights ML + YARA + heuristics + IOCs → 0-100 score & verdict |
| `ai_analyst.py` | **AIAnalystEngine** | Executive summaries, MITRE ATT&CK mapping, investigation playbooks |

### 2.5 Workers (`backend/app/workers/`)

| File | Purpose |
|---|---|
| `analysis_task.py` | Synchronous `run_background_analysis()` + Celery `analyze_file_task` for distributed execution |

### 2.6 YARA Rules (`backend/yara_rules/`)

Custom and community YARA rule sets for:
- Known malware family signatures
- UPX/packer detection
- Process injection primitives
- Ransomware artifacts
- Anti-debug/sandbox evasion patterns

### 2.7 ML Models (`backend/ml/models/`)

| Model File | Algorithm | Features | Output |
|---|---|---|---|
| `rf_malware_model.joblib` | Random Forest (scikit-learn) | 25D PE structural features | Calibrated malware/benign probability |

---

## 3. REST API ENDPOINTS

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | Service identity and status |
| `GET` | `/api/v1/health` | — | System health: DB, cache, storage, YARA, ML readiness |
| `POST` | `/api/v1/analyze` | — | Upload PE binary → sync analysis or async Celery task |
| `GET` | `/api/v1/tasks/{task_id}` | — | Poll async analysis task status (Celery) |
| `GET` | `/api/v1/history` | — | Paginated list of past analyses |
| `GET` | `/api/v1/report/search?q=` | — | Full-text search by filename or SHA256 prefix |
| `GET` | `/api/v1/report/{sha256}` | — | Full JSON report (cache-first, then DB) |
| `GET` | `/api/v1/report/id/{id}` | — | Full JSON report by primary key |

---

## 4. FRONTEND COMPONENTS

### Pages & Views (`frontend/src/`)

| File | Component | Description |
|---|---|---|
| `App.tsx` | **App** | Root router with auth gating and route definitions |
| `main.tsx` | — | React DOM entry point |
| `LandingPage.tsx` | **LandingPage** | Public marketing/landing page |
| `AuthPage.tsx` | **AuthPage** | Login/register form (client-side auth state) |
| `DashboardLayout.tsx` | **DashboardLayout** | Sidebar navigation shell wrapping all dashboard routes |
| `DashboardMain.tsx` | **DashboardMain** | Overview hub with metrics and recent analysis cards |
| `AnalysisContent.tsx` | **AnalysisContent** | Drag-and-drop file upload + engine config + async task polling |
| `ReportView.tsx` | **ReportView** | Full analysis report: risk gauge, section entropy chart, SHAP waterfall, MITRE ATT&CK matrix, IOC tables |
| `HistoryContent.tsx` | **HistoryContent** | Paginated history table with severity badges |
| `CommandPalette.tsx` | **CommandPalette** | ⌘K search palette for quick report lookup |
| `CopyButton.tsx` | **CopyButton** | Click-to-copy utility for hashes/values |
| `ComingSoon.tsx` | **ComingSoon** | Placeholder for roadmap features |

### Utility (`frontend/src/lib/`)

| File | Purpose |
|---|---|
| `utils.ts` | `cn()` helper (clsx + tailwind-merge) |

---

## 5. INFRASTRUCTURE & DOCKER SERVICES

| Service | Image | Port | Purpose |
|---|---|---|---|
| **postgres** | `postgres:16-alpine` | 5432 | Primary relational database |
| **redis** | `redis:7-alpine` | 6379 | Cache layer + Celery message broker |
| **minio** | `minio/minio:latest` | 9000/9001 | S3-compatible object storage for sample binaries |
| **api** | Custom (`Dockerfile.backend`) | 8000 | FastAPI REST API server |
| **worker** | Custom (`Dockerfile.backend`) | — | Celery analysis worker (4 concurrent) |
| **frontend** | Custom (`Dockerfile.frontend`) | 80 | Nginx serving React SPA + API reverse proxy |

---

## 6. PRODUCTION MIDDLEWARE STACK

Applied in order (outermost → innermost):

1. **RequestIDMiddleware** — Unique `X-Request-ID` on every request, response timing
2. **SecurityHeadersMiddleware** — OWASP security headers (HSTS, nosniff, X-Frame-Options, etc.)
3. **RateLimitMiddleware** — Per-IP sliding window rate limiting on `/api/v1/analyze`
4. **FileSizeLimitMiddleware** — Rejects uploads exceeding `MAX_UPLOAD_SIZE_MB`
5. **CORSMiddleware** — Origin-restricted in production, permissive in development

---

## 7. CONFIGURATION REFERENCE

All settings are loaded from environment variables via `app/core/config.py`.
See `.env.example` for the complete reference with defaults.

### Key Environment Variables

| Variable | Default | Description |
|---|---|---|
| `APP_ENV` | `development` | `development` or `production` |
| `DATABASE_URL` | `sqlite:///./zeravynex.db` | Database connection string |
| `REDIS_URL` | (empty) | Redis URL; empty = in-memory fallback |
| `USE_CELERY` | `false` | Enable distributed task queue |
| `STORAGE_BACKEND` | `local` | `local` or `s3` |
| `MAX_UPLOAD_SIZE_MB` | `100` | Maximum upload file size |
| `RATE_LIMIT_UPLOADS_PER_MIN` | `10` | Rate limit on file uploads per IP |
| `CORS_ORIGINS` | `localhost:5173,...` | Allowed CORS origins (comma-separated) |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

---

## 8. ANALYSIS PIPELINE FLOW

```
Upload PE Binary
     │
     ▼
┌─────────────────────────────────┐
│  1. Hasher (MD5/SHA256/Entropy) │
│  2. PE Parser (Headers)         │
│  3. Section Analyzer (RWX/H)    │
│  4. Import/Export Analyzer       │
│  5. String Extractor             │
│  6. IOC Extractor (IPs/URLs)     │
│  7. Heuristic Engine             │
│  8. YARA Scanner                 │
│  9. ML Feature Extractor (25D)   │
│ 10. ML Classifier (Random Forest)│
│ 11. SHAP Explainer (TreeSHAP)    │
│ 12. Decision Fusion (0-100)      │
│ 13. AI Analyst (MITRE/Narrative) │
└─────────────────────────────────┘
     │
     ▼
  Consolidated JSON Report
     │
     ├──► SQLite / PostgreSQL (persistent)
     ├──► Redis Cache (fast retrieval)
     └──► Dashboard / CLI (display)
```

---

## 9. RISK VERDICT SCALE

| Score Range | Verdict | Severity | Color |
|---|---|---|---|
| 0 – 15 | `CLEAN` | INFO | Green |
| 16 – 45 | `SUSPICIOUS` | MEDIUM | Yellow |
| 46 – 75 | `HIGH RISK` | HIGH | Orange |
| 76 – 100 | `CRITICAL MALWARE` | CRITICAL | Red |

---

## 10. MITRE ATT&CK TECHNIQUES MAPPED

| Technique ID | Name | Detection Source |
|---|---|---|
| T1059 | Command and Scripting Interpreter | String/IOC matches |
| T1027.002 | Software Packing | Section entropy + YARA |
| T1055 | Process Injection | Import API analysis |
| T1547.001 | Registry Run Keys / Startup Folder | IOC + string matches |
| T1486 | Data Encrypted for Impact | YARA ransomware rules |
| T1071.001 | Web Protocols | IOC network targets |
| T1497 | Virtualization/Sandbox Evasion | Anti-debug API imports |

---

## 11. TEST SUITE

| Test File | Coverage Area |
|---|---|
| `test_static_analysis.py` | PE parser, sections, entropy, strings, IOCs, heuristics, YARA |
| `test_ml_engine.py` | 25D feature extractor, RF classifier, SHAP explainer |
| `test_decision_fusion.py` | Multi-signal scoring, verdict capping, policy weights |
| `test_ai_analyst.py` | MITRE ATT&CK mapping, narrative generation |
| `test_database.py` | ORM models, relationships, cascading deletes |
| `test_api.py` | REST endpoints, file upload, health check, search |
| `test_storage.py` | LocalStorageProvider save/get/delete, factory method |
| `test_cache.py` | InMemoryLRU eviction, CacheManager report lifecycle |

Run: `pytest tests/ -v` from `backend/` directory.

---

## 12. DEPLOYMENT MODES

### A. Standalone Local Development
```bash
# No Docker, no Redis, no PostgreSQL required
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```
Uses SQLite + in-memory cache + local file storage automatically.

### B. Docker Compose Production
```bash
docker compose up -d --build
```
Launches full 6-service stack: PostgreSQL, Redis, MinIO, API, Worker, Frontend.

### C. Future: Desktop Application (Tauri)
- Package frontend + embedded backend as Windows .exe via Tauri
- SQLite bundled locally, no external services required
- Planned for Phase 8

---

## 13. PYTHON DEPENDENCIES

| Package | Purpose |
|---|---|
| `fastapi` | ASGI web framework |
| `uvicorn[standard]` | Production ASGI server |
| `sqlalchemy` | ORM and database toolkit |
| `psycopg2-binary` | PostgreSQL driver |
| `alembic` | Database migrations |
| `celery` | Distributed task queue |
| `redis` | Redis client (cache + broker) |
| `boto3` | AWS S3 / MinIO client |
| `pefile` | Windows PE binary parser |
| `yara-python` | YARA rule engine |
| `scikit-learn` | ML model training and inference |
| `numpy` | Numerical computing |
| `joblib` | Model serialization |
| `shap` | Shapley value explainability |
| `pydantic` | Data validation |
| `python-multipart` | File upload handling |

## 14. FRONTEND DEPENDENCIES

| Package | Purpose |
|---|---|
| `react` / `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `tailwindcss` | Utility-first CSS framework |
| `framer-motion` | Animations and transitions |
| `recharts` | Data visualization (entropy charts, SHAP bars) |
| `lucide-react` | Icon library |
| `sonner` | Toast notification system |
| `clsx` + `tailwind-merge` | Conditional class name utility |
| `vite` | Build tool and dev server |
| `typescript` | Type safety |
