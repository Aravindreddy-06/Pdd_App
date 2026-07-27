# 🚀 CI/CD Execution Guide — Phase 7 GitHub Actions Pipeline

## Overview
This document outlines the complete 13-stage GitHub Actions CI/CD deployment & testing workflow configured in `.github/workflows/deploy-and-test.yml`.

---

## 🔁 Pipeline Stages

1. **Stage 1: Checkout Repository** — Clones latest source code.
2. **Stage 2: Dependency Installation** — Installs node dependencies via `npm ci`.
3. **Stage 3: Build Application** — Compiles production bundle with Vite (`npm run build`).
4. **Stage 4: Static Analysis** — Executes ESLint and verifies `dist/index.html`.
5. **Stage 5: Deploy to GitHub Pages** — Deploys application live to GitHub Pages.
6. **Stage 6: Wait for Deployment** — Polls target `BASE_URL` until HTTP status 200 is returned.
7. **Stage 7: Deployment Verification** — Verifies HTML headers, CSS, and JS bundles.
8. **Stage 8: Run Selenium E2E Tests** — Executes 420 Selenium E2E tests in Headless Chrome against the live URL.
9. **Stage 9: Generate HTML Reports** — Creates `execution-report.html` and `dashboard.html`.
10. **Stage 10: Generate Excel Reports** — Generates `Automation_Test_Report.xlsx`, `Passed_Test_Cases.xlsx`, `Failed_Test_Cases.xlsx`, and `Summary_Report.xlsx`.
11. **Stage 11: Upload Artifacts** — Uploads all report artifacts to GitHub Actions (30-day retention).
12. **Stage 12: Publish Summary** — Publishes execution status and failure details to `$GITHUB_STEP_SUMMARY`.
13. **Stage 13: Store Historical Results** — Archives execution JSON for historical trend tracking.

---

## ⚙️ Repository Configuration Checklist
To enable GitHub Pages deployment:
1. Navigate to **Settings** > **Pages** in your GitHub repository.
2. Under **Source**, select **GitHub Actions**.
3. Ensure Workflow Permissions under **Settings** > **Actions** > **General** are set to **Read and write permissions**.
