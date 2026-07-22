# 💻 Local Execution Guide - Appium Mobile Automation Framework

This guide provides step-by-step instructions for installing prerequisites and running the 450+ Appium test case suite locally on your machine.

---

## 📋 Prerequisites

1. **Node.js**: v18.0.0 or higher (`node -v`)
2. **Java JDK**: JDK 17 (`java -version`)
3. **Android Studio & SDK**: Android SDK API 30+ (`adb devices`)
4. **Appium v2 Server**: Installed globally (`npm install -g appium@latest`)
5. **UiAutomator2 Driver**: (`appium driver install uiautomator2`)

---

## 🚀 Step-by-Step Local Execution

### 1. Clone & Install Project Dependencies
```powershell
git clone https://github.com/Aravindreddy-06/Pdd_App.git
cd Pdd_App/App/neighbor-share
npm install
```

### 2. Start Android Emulator
Launch your Android Virtual Device (AVD) from Android Studio or via CLI:
```powershell
emulator -avd Nexus_6_API_30
```

### 3. Start Appium Server
In a separate terminal window:
```powershell
appium --log-timestamp
```

### 4. Execute Test Automation Suite (450+ Test Cases)
```powershell
npm run test:automation
```

### 5. View Generated Reports
After test execution, reports will be saved locally at:
- **HTML Report:** [`automation/reports/HTML/execution-report.html`](file:///c:/PDD/App/neighbor-share/automation/reports/HTML/execution-report.html)
- **Dashboard:** [`automation/reports/HTML/dashboard.html`](file:///c:/PDD/App/neighbor-share/automation/reports/HTML/dashboard.html)
- **Excel Report:** [`automation/reports/Excel/Automation_Test_Report.xlsx`](file:///c:/PDD/App/neighbor-share/automation/reports/Excel/Automation_Test_Report.xlsx)
- **JSON Export:** [`automation/reports/JSON/execution-results.json`](file:///c:/PDD/App/neighbor-share/automation/reports/JSON/execution-results.json)
- **Markdown Summary:** [`automation/reports/Summary/summary.md`](file:///c:/PDD/App/neighbor-share/automation/reports/Summary/summary.md)
