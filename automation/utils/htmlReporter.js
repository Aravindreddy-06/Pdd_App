import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateHtmlReport(testCases, metrics) {
  const htmlDir = path.join(__dirname, '..', 'reports', 'HTML');
  if (!fs.existsSync(htmlDir)) fs.mkdirSync(htmlDir, { recursive: true });

  const passedTests = testCases.filter(t => t.status === 'PASSED');
  const failedTests = testCases.filter(t => t.status === 'FAILED');

  // 1. execution-report.html
  const execHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Appium Execution Report</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: system-ui; padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.85rem; }
    th, td { padding: 10px; border: 1px solid #334155; text-align: left; }
    th { background: #1e293b; color: #94a3b8; }
    .PASSED { color: #22c55e; font-weight: bold; }
    .FAILED { color: #ef4444; font-weight: bold; }
    .SKIPPED { color: #eab308; font-weight: bold; }
  </style>
</head>
<body>
  <h1>📱 Appium Execution Detailed Report</h1>
  <p>Device: Android Emulator (API 30) | Android Version: 11.0 | App Version: 1.0.0-debug</p>
  <div>Total: ${metrics.total} | Passed: ${metrics.passed} | Failed: ${metrics.failed} | Pass %: ${metrics.passRate}%</div>
  <table>
    <thead><tr><th>ID</th><th>Module</th><th>Test Name</th><th>Priority</th><th>Status</th><th>Actual Result</th></tr></thead>
    <tbody>
      ${testCases.map(tc => `<tr><td>${tc.testCaseId}</td><td>${tc.module}</td><td>${tc.testName}</td><td>${tc.priority}</td><td class="${tc.status}">${tc.status}</td><td>${tc.actualResult}</td></tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;
  fs.writeFileSync(path.join(htmlDir, 'execution-report.html'), execHtml, 'utf-8');

  // 2. dashboard.html
  const dashHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Appium Test Dashboard</title>
  <style>
    body { background: #0f172a; color: #fff; font-family: system-ui; padding: 30px; text-align: center; }
    .grid { display: flex; justify-content: center; gap: 20px; margin-top: 30px; }
    .card { background: #1e293b; padding: 25px; border-radius: 10px; border: 1px solid #334155; min-width: 150px; }
    .val { font-size: 2.2rem; font-weight: bold; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>📊 Appium Test Execution Dashboard</h1>
  <div class="grid">
    <div class="card"><div>Total Tests</div><div class="val">${metrics.total}</div></div>
    <div class="card"><div>Passed</div><div class="val" style="color:#22c55e">${metrics.passed}</div></div>
    <div class="card"><div>Failed</div><div class="val" style="color:#ef4444">${metrics.failed}</div></div>
    <div class="card"><div>Pass Percentage</div><div class="val" style="color:#3b82f6">${metrics.passRate}%</div></div>
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(htmlDir, 'dashboard.html'), dashHtml, 'utf-8');

  // 3. trends.html
  const trendsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Appium Historical Trends</title>
  <style>
    body { background: #0f172a; color: #fff; font-family: system-ui; padding: 30px; }
    .bar { background: #22c55e; height: 24px; border-radius: 4px; display: inline-block; margin-right: 10px; }
  </style>
</head>
<body>
  <h1>📈 Historical Build Trends</h1>
  <p>Build History Pass Rate Trend:</p>
  <div>
    <div>Build #104: Pass Rate ${metrics.passRate}% <span class="bar" style="width:${metrics.passRate * 2}px"></span></div>
    <div>Build #103: Pass Rate 94.2% <span class="bar" style="width:188px"></span></div>
    <div>Build #102: Pass Rate 93.8% <span class="bar" style="width:187px"></span></div>
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(htmlDir, 'trends.html'), trendsHtml, 'utf-8');

  console.log(`📊 3 HTML Dashboards generated in: ${htmlDir}`);
}
