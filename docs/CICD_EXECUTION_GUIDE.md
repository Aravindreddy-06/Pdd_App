# 🚀 CI/CD Execution Guide - GitHub Actions & GitHub Pages Reporting

This document details the automated 21-stage CI/CD pipeline execution flow in GitHub Actions and GitHub Pages deployment.

---

## ⚙️ Workflow Triggers

The primary test workflow [`.github/workflows/android-e2e.yml`](file:///c:/PDD/App/neighbor-share/.github/workflows/android-e2e.yml) triggers on:
- `push` to `main` or `master` branches
- `pull_request` to `main` or `master` branches
- `workflow_dispatch` (Manual trigger via GitHub Actions UI)
- `schedule` (Daily Nightly Cron at midnight UTC: `0 0 * * *`)

---

## 🗺️ 21-Stage CI/CD Pipeline Order

1. **Stage 1:** Checkout Repository (`actions/checkout@v4`)
2. **Stage 2:** Setup Java JDK 17 (`actions/setup-java@v4`)
3. **Stage 3:** Setup Android SDK Tools (`android-actions/setup-android@v3`)
4. **Stage 4:** Install Dependencies & Appium (`npm ci`, `appium driver install uiautomator2`)
5. **Stage 5:** Build Android APK (`npm run build:apk`)
6. **Stage 6:** Enable KVM Hardware Acceleration & Setup Emulator
7. **Stage 7:** Verify Emulator Readiness (`adb wait-for-device`)
8. **Stage 8:** Install APK on Emulator (`adb install ...`)
9. **Stage 9:** Start Appium Server (`appium --log appium.log &`)
10. **Stage 10:** Verify Appium Health (`curl http://localhost:4723/wd/hub/status`)
11. **Stage 11:** Execute 450+ Test Cases (`npm run test:automation`)
12. **Stage 12:** Capture Screenshots (`automation/screenshots/`)
13. **Stage 13:** Capture Logs (`automation/logs/`)
14. **Stage 14:** Generate 4 Excel Reports (`automation/reports/Excel/`)
15. **Stage 15:** Generate 3 HTML Dashboards (`automation/reports/HTML/`)
16. **Stage 16:** Generate JSON Export (`automation/reports/JSON/`)
17. **Stage 17:** Generate Markdown Summary (`automation/reports/Summary/summary.md`)
18. **Stage 18:** Upload Workflow Artifacts (`actions/upload-artifact@v4`, Retention: 30 Days)
19. **Stage 19:** Publish Reports to GitHub Pages (`peaceiris/actions-gh-pages@v3`)
20. **Stage 20:** Update Build History (`reports/latest/` & `reports/history/build-N/`)
21. **Stage 21:** Publish Final Deployment Notice (`$GITHUB_STEP_SUMMARY`)

---

## 🌐 Live GitHub Pages URL

Reports are automatically published to:
👉 `https://Aravindreddy-06.github.io/Pdd_App/latest/execution-report.html`
