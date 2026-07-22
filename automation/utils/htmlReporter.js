import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateHtmlReport(testCases, metrics) {
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>450 Executable Appium Test Cases Report</title>
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; padding: 20px; }
    .header { background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 20px; }
    .card { background: #1e293b; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #334155; }
    .val { font-size: 1.8rem; font-weight: bold; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; font-size: 0.85rem; border-radius: 8px; overflow: hidden; }
    th, td { padding: 10px; border-bottom: 1px solid #334155; text-align: left; vertical-align: top; }
    th { background: #0f172a; color: #94a3b8; text-transform: uppercase; }
    .badge { padding: 3px 8px; border-radius: 12px; font-weight: bold; font-size: 0.75rem; text-transform: uppercase; display: inline-block; }
    .PASSED { background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid #22c55e; }
    .FAILED { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; }
    .SKIPPED { background: rgba(234, 179, 8, 0.2); color: #eab308; border: 1px solid #eab308; }
    .BLOCKED { background: rgba(168, 85, 247, 0.2); color: #a855f7; border: 1px solid #a855f7; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📱 450 Executable Appium Test Suite Execution Report</h1>
    <p>Target App: <strong>NeighborShare Android App</strong> | Execution Date: ${new Date().toLocaleString()}</p>
  </div>

  <div class="metrics-grid">
    <div class="card"><div>Total Executed</div><div class="val">${metrics.total}</div></div>
    <div class="card"><div>Passed</div><div class="val" style="color:#22c55e">${metrics.passed}</div></div>
    <div class="card"><div>Failed</div><div class="val" style="color:#ef4444">${metrics.failed}</div></div>
    <div class="card"><div>Skipped</div><div class="val" style="color:#eab308">${metrics.skipped}</div></div>
    <div class="card"><div>Blocked</div><div class="val" style="color:#a855f7">${metrics.blocked}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Module</th>
        <th>Test Name</th>
        <th>Priority</th>
        <th>Preconditions</th>
        <th>Test Steps</th>
        <th>Test Data</th>
        <th>Expected Result</th>
        <th>Actual Result</th>
        <th>Status</th>
        <th>Pass/Fail</th>
      </tr>
    </thead>
    <tbody>
      ${testCases.map(tc => `
        <tr>
          <td><strong>${tc.testCaseId}</strong></td>
          <td>${tc.module}</td>
          <td>${tc.testName}</td>
          <td><span style="font-weight:600; color:#3b82f6">${tc.priority}</span></td>
          <td><small>${tc.preconditions}</small></td>
          <td><small>${tc.testSteps.replace(/\n/g, '<br>')}</small></td>
          <td><code>${tc.testData}</code></td>
          <td><small>${tc.expectedResult}</small></td>
          <td><small>${tc.actualResult}</small></td>
          <td><span class="badge ${tc.status}">${tc.status}</span></td>
          <td><strong>${tc.passFail}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  const filePath = path.join(reportsDir, 'index.html');
  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`📊 HTML Report generated: ${filePath}`);
  return filePath;
}
