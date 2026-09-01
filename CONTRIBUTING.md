# 🤝 Contributing to Zeravynex

First off, thank you for considering contributing to **Zeravynex**! We welcome contributions of all kinds—from bug fixes, new YARA rules, and machine learning enhancements to documentation improvements, UI/UX polish, and feature additions.

---

## 🌟 Show Your Support

If you find **Zeravynex** useful or inspiring, please consider **starring the repository on GitHub**! ⭐ 

Starring helps increase project visibility, attracts more contributors, and supports ongoing development of open-source static malware analysis tools.

- 🔗 **Repo URL**: [https://github.com/intrance7/Zeravynex](https://github.com/intrance7/Zeravynex)

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
- [How to Fork the Repository](#-how-to-fork-the-repository)
- [Development & Environment Setup](#-development--environment-setup)
  - [Backend Setup (Python 3.11+)](#backend-setup-python-311)
  - [Frontend Setup (React / Vite / TypeScript)](#frontend-setup-react--vite--typescript)
- [Running Tests & Quality Checks](#-running-tests--quality-checks)
- [How to Submit a Pull Request](#-how-to-submit-a-pull-request)
- [Coding Standards & Commit Conventions](#-coding-standards--commit-conventions)
- [Adding YARA Rules & Malware Heuristics](#-adding-yara-rules--malware-heuristics)
- [Reporting Issues](#-reporting-issues)

---

## 📜 Code of Conduct

This project and all participants are governed by the [Zeravynex Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to maintain a respectful, welcoming, and inclusive community environment.

---

## 💡 How Can I Contribute?

You can contribute to **Zeravynex** in many ways:

1. **🐛 Reporting Bugs**: Submit detailed issue reports using the Bug Report Template if you encounter unexpected behavior or errors.
2. **💡 Suggesting Enhancements**: Propose new features, ML algorithms, analysis modules, or UI improvements via the Feature Request Template.
3. **📖 Improving Documentation**: Help clarify setup guides, architecture documents, API endpoints, or code docstrings.
4. **🛡️ Adding YARA Rules & Detection Heuristics**: Contribute static detection rules and malware signature heuristics for binary analysis.
5. **🎨 UI/UX Refinement**: Improve frontend components, dashboard charts, dark mode themes, or accessibility features in React.
6. **🧪 Writing Tests**: Expand test coverage for both backend (Pytest) and frontend (Vitest / React Testing Library).

---

## 🍴 How to Fork the Repository

To start working on Zeravynex, you need your own fork of the repository on GitHub:

1. **Navigate to the Repository**: Go to [https://github.com/intrance7/Zeravynex](https://github.com/intrance7/Zeravynex).
2. **Create a Fork**: Click the **Fork** button in the top-right corner of the page to create a copy under your GitHub account.
3. **Clone Your Fork Locally**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Zeravynex.git
   cd Zeravynex
   ```
4. **Add the Upstream Remote**: Keep your fork in sync with the main repository by linking `upstream`:
   ```bash
   git remote add upstream https://github.com/intrance7/Zeravynex.git
   git fetch upstream
   ```

---

## 🛠️ Development & Environment Setup

Zeravynex consists of a **FastAPI / Python** backend and a **React / Vite / TypeScript** frontend.

### Backend Setup (Python 3.11+)

1. Navigate to the project root directory:
   ```bash
   cd Zeravynex
   ```

2. Create and activate a virtual environment:
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Launch the local FastAPI development server:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
   The interactive API docs will be available at `http://localhost:8000/docs`.

---

### Frontend Setup (React / Vite / TypeScript)

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd Zeravynex/frontend
   ```

2. Install Node.js dependencies (Node 18+ recommended):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application UI will run at `http://localhost:5173`.

---

## 🧪 Running Tests & Quality Checks

Before submitting a Pull Request, ensure that all automated tests, linters, and build scripts complete without errors.

### 1. Backend Unit & Integration Tests

Run the Pytest suite from the repository root:
```bash
# Run pytest on the backend test suite
pytest backend/tests/ -v

# Run pytest with coverage report
pytest backend/tests/ --cov=backend/app
```

### 2. Frontend Linting & Build Verification

Run TypeScript compilation, Oxlint, and Vite production bundle checks:
```bash
cd frontend

# Run Oxlint for code analysis
npm run lint

# Verify TypeScript type checking and production build
npm run build
```

---

## 🚀 How to Submit a Pull Request

Follow these step-by-step guidelines to propose your changes:

### Step 1: Sync Your Branch with Upstream
Before creating a new feature branch, ensure your local `main` is up to date:
```bash
git checkout main
git pull upstream main
git push origin main
```

### Step 2: Create a Topic Branch
Create a descriptive branch for your feature or bug fix:
```bash
# Format: <category>/<short-description>
git checkout -b feat/add-yara-rule-detection
# or
git checkout -b fix/api-endpoint-timeout
```

### Step 3: Commit Your Changes
Make focused, modular commits following our [Commit Conventions](#-coding-standards--commit-conventions):
```bash
git add .
git commit -m "feat(yara): add static detection rule for ransomware headers"
```

### Step 4: Push to Your Fork
Push your local branch to your GitHub fork:
```bash
git push origin feat/add-yara-rule-detection
```

### Step 5: Open a Pull Request
1. Go to your fork on GitHub (`https://github.com/YOUR-USERNAME/Zeravynex`).
2. Click **Compare & Pull Request**.
3. Ensure the target base branch is set to `intrance7/Zeravynex:main`.
4. Fill out the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely:
   - Provide a clear title and detailed summary of changes.
   - Link related issue numbers (e.g., `Closes #24` or `Fixes #12`).
   - Confirm that tests have been executed and passed.
5. Submit the Pull Request and participate in code review discussions!

---

## 📝 Coding Standards & Commit Conventions

To ensure high code quality and maintainable history across Python and TypeScript stacks, follow these guidelines:

### Coding Standards:
- **Python (Backend)**: Follow PEP 8 style guidelines. Use type hints (`typing` module) for function parameters and return values.
- **TypeScript / React (Frontend)**: Write type-safe TypeScript code without explicit `any` where possible. Use modular functional components.
- **Code Linting**: Run `oxlint` on the frontend before committing.

### Commit Conventions:
We enforce [Conventional Commits](https://www.conventionalcommits.org/) to maintain clean git logs:

- `feat:` A new user-facing feature or enhancement.
- `fix:` A bug fix.
- `docs:` Documentation improvements or updates.
- `style:` Formatting changes or whitespace adjustments.
- `refactor:` Restructuring code without changing external behavior.
- `perf:` Performance improvements.
- `test:` Adding, updating, or fixing unit tests.
- `chore:` Build maintenance, dependency updates, configuration tweaks.

### Commit Message Examples:
```bash
feat(backend): implement SHAP explainability endpoint for PE classifier
fix(frontend): resolve missing graph rendering node crash
docs(contributing): update step-by-step pull request workflow
```

---

## 🛡️ Adding YARA Rules & Malware Heuristics

When contributing detection rules or static analysis modules:
1. Place custom YARA rules inside `backend/yara_rules/` following standard `.yar` / `.yara` syntax.
2. Include mandatory rule metadata:
   ```yara
   meta:
       author = "Your Name / GitHub Handle"
       description = "Detects specific PE header anomaly"
       reference = "https://mitre-attack.github.io/..."
       mitre_att&ck_id = "T1005"
   ```
3. **⚠️ Security Warning**: Do **NOT** upload live, functional malicious binaries directly to GitHub issues or repository pull requests. Use mock test data or standardized synthetic test patterns in `backend/tests/`.

---

## 🐛 Reporting Issues

If you discover a bug or have a feature idea:
- Check existing [GitHub Issues](https://github.com/intrance7/Zeravynex/issues) to avoid duplicates.
- For bugs, use the **Bug Report Template** and provide OS details, Python/Node versions, reproduction steps, and error logs.
- For security vulnerabilities, review our [Security Policy](SECURITY.md) before filing a public issue.

---

Thank you for helping build **Zeravynex**! 🛡️✨
