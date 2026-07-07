# Zeravynex v1.0 — Project Specification

**Explainable AI Malware Analysis Platform**

> Static analysis of Windows PE files with ML classification, YARA detection,
> IOC extraction, risk scoring, and LLM-powered investigation narratives.

## v1 Constraint

**Uploaded files are NEVER executed.** Zeravynex v1.0 is a pure static analysis platform.

## Build Stages

| Stage | Deliverable | Prerequisite |
|-------|------------|-------------|
| 0 | Project specification (this document) | — |
| 1 | Malware analysis engine (PE parser, YARA, IOC, risk scoring) | Stage 0 |
| 2 | ML engine (feature extraction, model, SHAP explanations) | Stage 1 |
| 3 | Web application (FastAPI + React dashboard) | Stages 1–2 |
| 4 | AI analyst engine (LLM narratives, ATT&CK mapping) | Stages 1–3 |

See the full specification in the implementation plan artifact for complete details on:
- Input/output JSON schemas
- Technology stack
- API contract
- Database models
- Risk scoring algorithm
- ML feature vector
- YARA rule categories
- Verification criteria per stage
