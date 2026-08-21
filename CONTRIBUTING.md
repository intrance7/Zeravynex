# 🤝 Contributing to Zeravynex

Thank you for your interest in contributing to **Zeravynex**! We welcome contributions of all types: bug fixes, new detection rules, machine learning enhancements, documentation improvements, UI/UX polish, and feature additions.

---

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Adding YARA Rules & Detection Heuristics](#adding-yara-rules--detection-heuristics)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Coding Standards & Commit Conventions](#coding-standards--commit-conventions)

---

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### Reporting Bugs
Before creating bug reports, please check existing issues to ensure the problem has not already been reported. When filing an issue via the [Bug Report Template](https://github.com/intrance7/Zeravynex/issues/new?template=bug_report.yml), provide detailed steps, sample hashes (do **NOT** upload live malicious binaries directly to GitHub issues), logs, and environment specifications.

### Suggesting Enhancements
Feature requests are tracked in GitHub Issues. Please use the [Feature Request Template](https://github.com/intrance7/Zeravynex/issues/new?template=feature_request.yml) and explain why the feature is useful and how it aligns with static malware analysis.

### Adding YARA Rules & Detection Heuristics
1. Place custom YARA rules in `backend/yara_rules/` following standard YARA syntax.
2. Include metadata (`author`, `description`, `reference`, `mitre_att&ck_id`).
3. Add corresponding test cases in `backend/tests/` to ensure rules trigger on sample files without false-positive regressions.

---

## Development Setup

### Backend Setup (Python 3.11+)

```bash
# Clone the repository
git clone https://github.com/intrance7/Zeravynex.git
cd Zeravynex

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend test suite
pytest backend/tests/ -v

# Run FastAPI server locally
cd backend
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup (Node 18+ / React / Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build
```

---

## Coding Standards & Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Formatting changes that do not affect code logic
- `refactor:` Code restructuring without behavioral changes
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency updates

---

## Submitting Pull Requests

1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Ensure all tests pass (`pytest backend/tests/` and `npm run build`).
3. Commit your changes with clear, descriptive commit messages.
4. Push your branch to your fork and submit a Pull Request.
5. Fill out the [Pull Request Template](.github/pull_request_template.md).
