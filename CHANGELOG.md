# 📜 Changelog

All notable changes to **Zeravynex** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- GitHub CI/CD automation pipeline for backend tests and frontend typechecking & building.
- GitHub CodeQL automated static security analysis.
- Structured GitHub Issue forms and Pull Request templates.
- Project governance documentation (`CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`).

---

## [v0.1.0] - 2026-08-21

### Added
- **Static PE Analysis Engine**:
  - PE header parsing, section permissions, entropy calculation, hashing (MD5, SHA1, SHA256).
  - IAT import and export classification.
  - IOC Extractor (IPv4, URLs, Domains, Registry Keys, File Paths, Mutexes).
- **YARA Scanner Engine**:
  - Multi-rule compilation and detection for Ransomware, Packers (UPX), Droppers, and Injections.
- **Machine Learning & SHAP Explainability**:
  - 25-feature vector extraction (`PEFeatureExtractor`).
  - Pre-trained ML classifier predicting malware probability and confidence.
  - SHAP feature importance scoring and attribution.
- **Multi-Signal Decision Fusion Risk Engine**:
  - Weighted threat score calculation (0–100) and automated verdict triage.
- **FastAPI Backend & Async Analysis Worker**:
  - REST API endpoints for binary uploads, task polling, and history retrieval.
  - SQLite database persistence with SQLAlchemy models.
- **React 18 + TypeScript Frontend Dashboard**:
  - Interactive file dropzone, live analysis status gauge, entropy visualization charts, SHAP explanation breakdown, and analysis history table.
