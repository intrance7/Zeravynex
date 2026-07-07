# Zeravynex — Desktop Application Architecture

> **Decision**: Zeravynex is a **Windows desktop application**, not a web app.
> Users download `Zeravynex-Setup.exe`, install it, and launch from the Start Menu.

---

## Product Experience

```
Download Zeravynex-Setup.exe
            ↓
Install
            ↓
Start Menu / Desktop Shortcut
            ↓
Launch Application
            ↓
Drag & Drop Executable
            ↓
Analyze
            ↓
Professional Investigation Dashboard
```

### Key Principles

- **Installable .exe** — published through GitHub Releases
- **Works like a normal Windows application** — Start Menu, taskbar, native feel
- **Fully local** — no account required, no internet required for core analysis
- **ML model bundled** — ships with the installer
- **No Docker for end users** — Docker is dev/CI infrastructure only

---

## System Architecture

```
                    WINDOWS DESKTOP APPLICATION
                              ZERAVYNEX

                    ┌──────────────────────────┐
                    │       React UI           │
                    │                          │
                    │ Dashboard                │
                    │ File Submission          │
                    │ Analysis Results         │
                    │ History                  │
                    │ Settings                 │
                    │ Model Information        │
                    └─────────────┬────────────┘
                                  │
                           Tauri IPC Commands
                                  │
                    ┌──────────────────────────┐
                    │      TAURI CORE          │
                    │         RUST             │
                    │                          │
                    │ Window Management        │
                    │ File Selection           │
                    │ Permissions              │
                    │ Process Management       │
                    │ Secure IPC               │
                    └─────────────┬────────────┘
                                  │
                         LOCAL ANALYSIS SERVICE
                                  │
                    ┌──────────────────────────┐
                    │        PYTHON            │
                    │    ANALYSIS ENGINE       │
                    │                          │
                    │ PE Analysis              │
                    │ Feature Extraction       │
                    │ YARA                     │
                    │ ML Inference             │
                    │ SHAP                     │
                    │ IOC Extraction           │
                    │ Risk Engine              │
                    └─────────────┬────────────┘
                                  │
                    ┌──────────────────────────┐
                    │         SQLITE           │
                    │                          │
                    │ Analysis History         │
                    │ File Metadata            │
                    │ Detection Results        │
                    │ Model Information        │
                    │ Settings                 │
                    └──────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Desktop Framework | Tauri | Creates the Windows desktop application |
| Desktop Core | Rust | OS interaction, process management, secure IPC |
| Frontend | React | UI architecture |
| Language | TypeScript | Type-safe frontend development |
| Build Tool | Vite | Frontend development and bundling |
| Styling | Tailwind CSS | UI styling |
| Components | shadcn/ui | Professional UI components |
| Charts | Recharts | Detection and ML visualization |
| Analysis Engine | Python | Malware analysis and ML ecosystem |
| PE Parsing | pefile | Windows PE parsing |
| Binary Parsing | LIEF | Advanced binary inspection |
| Detection | YARA | Signature and rule-based detection |
| ML | scikit-learn | Baseline malware classifier |
| Advanced ML | XGBoost | Strong tabular classifier |
| Explainability | SHAP | Explain model predictions |
| Database | SQLite | Local analysis history |
| ORM | SQLAlchemy | Database abstraction |
| Packaging | PyInstaller | Packages Python analysis engine |
| Installer | Tauri Bundler | Generates Windows installer |
| Testing | Pytest + Vitest | Backend/frontend tests |
| CI/CD | GitHub Actions | Automated builds and releases |

---

## Why Tauri Over Alternatives

### Electron
- **Pro**: Extremely mature, easy React integration
- **Con**: Larger installer, higher RAM, bundles Chromium

### PyQt / PySide
- **Pro**: Easiest Python integration, single language
- **Con**: Polished modern UI takes more work, doesn't demonstrate web frontend skills

### Tauri (chosen)
- **Pro**: Small installer, native feel, React frontend, Rust exposure, explicit permissions
- **Con**: Three languages (TypeScript, Rust, Python) — mitigated by keeping Rust minimal

### Rust Responsibility (minimal)

Rust handles ONLY:
- Desktop Window
- File Dialog
- Application Lifecycle
- Launching Analysis Worker
- IPC
- Filesystem Permissions

Python handles ALL analysis:
- PE Parsing
- Feature Extraction
- YARA
- ML
- SHAP
- Risk Scoring

---

## How Analysis Works Internally

```
User drags invoice.exe onto Zeravynex
            ↓
React UI sends file path via Tauri IPC
            ↓
Tauri validates the path permission
            ↓
Tauri launches: zeravynex-engine.exe (packaged Python)
            ↓
Python analysis pipeline:
  FILE VALIDATION → HASH CALCULATION → PE PARSING
  → SECTION ANALYSIS → IMPORT ANALYSIS → STRING EXTRACTION
  → IOC EXTRACTION → YARA SCANNING → FEATURE EXTRACTION
  → ML PREDICTION → SHAP EXPLANATION → RISK SCORING
            ↓
Engine returns JSON report
            ↓
React renders the Investigation Dashboard
```

---

## UI Pages

### 1. Home
- App title and tagline
- Drag & drop zone / file select button
- Recent analyses list

### 2. Analyzing Screen
- File name display
- Step-by-step progress with checkmarks:
  ✓ Validating File → ✓ Calculating Hashes → ✓ Parsing PE Structure
  → ● Running YARA Rules → ○ Running ML Model → ○ Generating Report

### 3. Investigation Dashboard (main screen)
- Verdict badge (CLEAN / LOW RISK / SUSPICIOUS / HIGHLY SUSPICIOUS / MALICIOUS)
- Risk score gauge (0–100)
- ML probability
- Detection evidence with severity tags
- Tabbed sections: Overview | PE Headers | Sections | Imports | Strings | IOCs | YARA | ML Explanation

### 4. Analysis History
- Table: File name, verdict, score, date
- Search and filter

### 5. Compare Analysis (advanced)
- Side-by-side comparison of two analyses
- Section count, entropy, ML probability, YARA matches

### 6. YARA Rule Manager
- View / Enable / Disable / Import / Create / Test rules

### 7. Model Information
- Model name, version, algorithm, training data
- Feature count, precision, recall, F1, ROC-AUC

### 8. Settings
- **General**: Theme, auto-delete samples, history retention
- **Detection**: ML threshold, YARA rules, heuristic sensitivity
- **Privacy**: Local analysis only, telemetry disabled
- **Advanced**: Engine path, analysis timeout, max file size

---

## Why SQLite Instead of PostgreSQL

Zeravynex v1 is a **local desktop application**.

PostgreSQL requires: Application + PostgreSQL Server + Database Configuration + Background Service

SQLite gives: Application + `zeravynex.db`

SQLite is embedded, serverless, portable, and sufficient for analysis history and settings.

**Migration path**: If we later build Zeravynex Enterprise (centralized server, multi-user SOC), we migrate to PostgreSQL.

---

## Docker Strategy

Docker is **NOT** required for end users. It IS used for development:

```
ZERAVYNEX PROJECT

       DEVELOPMENT                     END USER
            │                              │
            ▼                              ▼
     Docker Compose                 Windows Installer
     ML Experiments                 Zeravynex.exe
     Reproducible Training
     Integration Tests
     Security Tooling
     CI Environments
```

```
docker/
├── training.Dockerfile
├── test.Dockerfile
└── docker-compose.dev.yml
```

> **Security note**: A normal Docker container is NOT a sufficient sandbox for
> executing hostile malware. Zeravynex v1 performs static analysis only.
> Dynamic analysis (future) requires disposable VMs with strict isolation.

---

## Packaging Pipeline

### Development
```
React Dev Server + Tauri Dev Process + Python Analysis Engine
```

### Production Build
```
PYTHON ENGINE → PyInstaller → zeravynex-engine.exe
REACT FRONTEND → Vite → Static Assets
ASSETS + TAURI CORE + ENGINE + ML MODEL + YARA RULES
    → Tauri Bundler → Zeravynex_1.0.0_x64-setup.exe
```

---

## Target Repository Structure

```
zeravynex/
├── apps/
│   └── desktop/
│       ├── src/                    # React + TypeScript frontend
│       ├── src-tauri/              # Rust Tauri backend
│       ├── public/
│       └── package.json
│
├── engine/
│   ├── zeravynex/
│   │   ├── analysis/              # PE parsing, sections, imports
│   │   ├── detection/             # YARA, heuristics
│   │   ├── features/              # ML feature extraction
│   │   ├── ioc/                   # IOC extraction
│   │   ├── ml/                    # ML inference
│   │   ├── reporting/             # Report generation
│   │   └── storage/               # SQLite persistence
│   ├── tests/
│   └── pyproject.toml
│
├── ml/
│   ├── datasets/
│   ├── experiments/
│   ├── notebooks/
│   ├── pipelines/
│   └── models/
│
├── rules/
│   ├── generic/
│   ├── packers/
│   ├── suspicious/
│   └── experimental/
│
├── assets/
│   ├── models/                    # Bundled ML model
│   └── rules/                     # Bundled YARA rules
│
├── docker/
│   ├── training.Dockerfile
│   ├── test.Dockerfile
│   └── docker-compose.dev.yml
│
├── docs/
│   ├── architecture/
│   ├── threat-model/
│   ├── ml-methodology/
│   └── screenshots/
│
├── scripts/
├── .github/workflows/
├── README.md
├── SECURITY.md
├── CONTRIBUTING.md
├── LICENSE
└── CHANGELOG.md
```

---

## Development Plan

| Phase | Build | Time Estimate |
|-------|-------|--------------|
| 1 | Requirements + architecture + UI design | 3 days |
| 2 | Python CLI static analyzer | 7–10 days |
| 3 | Detection engine + risk scoring | 5–7 days |
| 4 | YARA integration | 3–5 days |
| 5 | ML dataset pipeline | 7–10 days |
| 6 | ML classifier + evaluation | 7–10 days |
| 7 | SHAP explainability | 3–5 days |
| 8 | SQLite persistence | 3 days |
| 9 | React + TypeScript UI | 10–14 days |
| 10 | Tauri desktop integration | 5–7 days |
| 11 | Engine packaging | 3–5 days |
| 12 | Security hardening | 5–7 days |
| 13 | Testing | 5–7 days |
| 14 | Installer + GitHub Releases + CI | 4–6 days |
| 15 | Documentation + demo | 3–5 days |

**Target**: At 3–4 focused hours/day, polished v1 ≈ 12–16 weeks.
**8-week MVP**: Static PE analysis, YARA, heuristics, baseline ML, SQLite history, polished React/Tauri UI, Windows installer, tests, professional GitHub repo.

---

## Build Order (unchanged principle)

> Build the malware-analysis engine first. Add ML second. Build the desktop application third. Add LLM features last.

The first deliverable is **Zeravynex Engine v0.1**: file validation → SHA-256 hashing → PE parsing → section analysis → import analysis → entropy → JSON report. Once that contract is stable, the UI, ML, YARA, and installer integrate cleanly.
