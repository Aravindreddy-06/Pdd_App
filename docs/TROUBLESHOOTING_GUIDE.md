# 🛠️ Troubleshooting Guide - Common Issues & Diagnostics

This guide helps diagnose and resolve common setup, build, and test execution errors.

---

## 🛑 Common Issues & Solutions

### 1. Emulator Startup Fails in GitHub Actions
- **Symptom:** Timeout during `android-runner` step.
- **Cause:** KVM acceleration not available on runner host.
- **Fix:** Ensure KVM setup step (`echo 'KERNEL=="kvm"...'`) executes prior to launching the emulator.

### 2. Appium Health Check Connection Refused
- **Symptom:** `curl: (7) Failed to connect to localhost port 4723`.
- **Cause:** Appium server died or did not finish starting.
- **Fix:** Inspect `appium.log` artifact uploaded by the workflow run to verify driver initialization.

### 3. Quality Gate Build Failure (< 95% Pass Rate)
- **Symptom:** Workflow step fails with `QUALITY GATE FAILURE: Pass Rate < 95%`.
- **Cause:** More than 5% of critical test assertions failed.
- **Fix:** Review `automation/reports/Summary/summary.md` or `Automation_Test_Report.xlsx` Sheet 6 ("Defect Summary") to isolate broken test cases.

### 4. GitHub Pages 404 Not Found
- **Symptom:** Live report URL shows 404.
- **Cause:** GitHub Pages source branch not set to `gh-pages`.
- **Fix:** Go to Repository Settings -> Pages -> Source, and select branch `gh-pages` / `/ (root)`.
