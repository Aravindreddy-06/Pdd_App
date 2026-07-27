# 🛠️ Troubleshooting Guide — Phase 7 CI/CD & Selenium E2E

## Common Issues & Resolutions

### 1. `BASE_URL` Localhost Guard Triggered
**Error**: `CRITICAL ERROR: Selenium tests are forbidden from running against localhost!`
**Resolution**: Ensure `BASE_URL` environment variable points to your live deployment (e.g. `https://aravindreddy-06.github.io/Pdd_App`).

### 2. GitHub Pages Deployment Timeout (Stage 6)
**Error**: `Deployment timeout! Target URL did not return HTTP 200.`
**Resolution**: Check repository Settings > Pages to ensure source is set to **GitHub Actions**.

### 3. Selenium Chrome Driver Initialization Error
**Error**: `WebDriverError: chrome not reachable` or `DevToolsActivePort file doesn't exist`
**Resolution**: Verify Chrome options in `automation/utils/driverFactory.js` include `--headless=new`, `--no-sandbox`, and `--disable-dev-shm-usage`.

### 4. Workflow Failure Threshold
**Condition**: Workflow fails if Pass Rate < 95.0%.
**Resolution**: Inspect `Test Results/Screenshots/` and `Test Results/Logs/execution.log` in job artifacts to diagnose root cause.
