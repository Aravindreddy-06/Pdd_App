# ⚙️ Repository Configuration Guide

Instructions for configuring repository secrets, permissions, and GitHub Pages settings.

---

## 🔑 Required Repository Settings

### 1. Workflow Permissions
Navigate to **Settings** -> **Actions** -> **General** -> **Workflow permissions**:
- Select: **Read and write permissions**
- Check: **Allow GitHub Actions to create and approve pull requests**

### 2. GitHub Pages Setup
Navigate to **Settings** -> **Pages**:
- **Source**: Deploy from a branch
- **Branch**: `gh-pages` / `/ (root)`
- Click **Save**

---

## 📂 Repository Deliverables Checklist
- [x] Complete Appium Automation Framework (`automation/`)
- [x] Page Object Model Implementation (`automation/pages/`)
- [x] Test Data Framework (`automation/data/`)
- [x] 400+ Executable Test Cases (`automation/data/testCaseGenerator.js`)
- [x] Appium Configuration (`automation/config/appium.config.js`)
- [x] 4 Excel Workbooks Reporter (`automation/utils/excelReporter.js`)
- [x] 3 HTML Dashboards Reporter (`automation/utils/htmlReporter.js`)
- [x] Failure Diagnostics & Screenshots (`automation/utils/failureDiagnostics.js`)
- [x] Logging Utility (`automation/utils/loggerUtil.js`)
- [x] GitHub Actions Workflow (`.github/workflows/android-e2e.yml`)
- [x] GitHub Pages Deployment Workflow (`.github/workflows/deploy-reports.yml`)
- [x] Artifact Upload Configuration (30-Day Retention)
- [x] Historical Report Archiving (`reports/latest/` & `reports/history/build-N/`)
- [x] Folder Structure (`automation/`)
- [x] Local Execution Guide (`docs/LOCAL_EXECUTION_GUIDE.md`)
- [x] CI/CD Execution Guide (`docs/CICD_EXECUTION_GUIDE.md`)
- [x] Troubleshooting Guide (`docs/TROUBLESHOOTING_GUIDE.md`)
- [x] Repository Configuration Guide (`docs/REPOSITORY_CONFIG_GUIDE.md`)
