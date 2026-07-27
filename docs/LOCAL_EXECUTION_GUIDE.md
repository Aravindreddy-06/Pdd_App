# 📖 Local Execution Guide — Selenium E2E Automation Framework

## Overview
This guide provides instructions for configuring and executing the **Selenium E2E Automation Framework** locally against your deployed application URL.

---

## ⚠️ Mandatory Rules
1. **Never run Selenium against `localhost` or `127.0.0.1`**.
2. Selenium must always run against the **LIVE deployed application URL** configured via `BASE_URL`.

---

## 🛠️ Prerequisites
- **Node.js**: v18.x or later
- **Google Chrome**: Latest version installed
- **NPM**: Package manager

---

## 🚀 Execution Steps

### 1. Configure the Target Live URL
Set the `BASE_URL` environment variable to your live GitHub Pages or staging deployment URL:

```bash
# PowerShell (Windows)
$env:BASE_URL="https://aravindreddy-06.github.io/Pdd_App"

# Bash / Linux / macOS
export BASE_URL="https://aravindreddy-06.github.io/Pdd_App"
```

### 2. Run the Full 400+ Selenium E2E Test Suite
Execute the runner script using NPM:

```bash
npm run test:selenium:live
```

---

## 📊 Output Artifacts & Reports
After execution completes, all artifacts are generated under `Test Results/`:

```
Test Results/
├── Excel/
│   ├── Automation_Test_Report.xlsx  (6 Sheets Executive Report)
│   ├── Passed_Test_Cases.xlsx
│   ├── Failed_Test_Cases.xlsx
│   └── Summary_Report.xlsx
├── HTML/
│   ├── execution-report.html        (Interactive HTML Report)
│   └── dashboard.html               (Dashboard View)
├── JSON/
│   └── execution-results.json
├── Screenshots/                     (Failure Screenshots)
├── Logs/
│   └── execution.log
└── Summary/
    └── summary.md
```
