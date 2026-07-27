const fs = require('fs');
const path = require('path');
const config = require('../config/config.cjs');
const logger = require('./logger.cjs');

class HtmlReporter {
  static generateReports(testResults, summaryData) {
    logger.info('Generating HTML Reports & Dashboard...');

    if (!fs.existsSync(config.paths.htmlDir)) {
      fs.mkdirSync(config.paths.htmlDir, { recursive: true });
    }

    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Live E2E Test Execution Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px; }
    .header h1 { margin: 0; color: #84cc16; font-size: 28px; }
    .header p { margin: 6px 0 0 0; color: #94a3b8; font-size: 14px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
    .metric-card { background: #1e293b; padding: 20px; border-radius: 14px; border: 1px solid #334155; text-align: center; }
    .metric-card h3 { margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; }
    .metric-card p { margin: 8px 0 0 0; font-size: 28px; font-weight: 800; color: #f8fafc; }
    .metric-card.pass p { color: #22c55e; }
    .metric-card.fail p { color: #ef4444; }
    .table-container { background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #334155; padding: 14px 16px; font-size: 13px; color: #f8fafc; font-weight: 700; }
    td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 13px; color: #cbd5e1; }
    tr:last-child td { border-bottom: none; }
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge.passed { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; }
    .badge.failed { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
    .badge.skipped { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Live GitHub Pages E2E Execution Report</h1>
    <p>Target Deployment URL: <strong>${config.baseUrl}</strong> | Executed on: ${new Date().toLocaleString()}</p>
  </div>

  <div class="metrics-grid">
    <div class="metric-card"><h3>Total Tests</h3><p>${summaryData.total}</p></div>
    <div class="metric-card pass"><h3>Passed</h3><p>${summaryData.passed}</p></div>
    <div class="metric-card fail"><h3>Failed</h3><p>${summaryData.failed}</p></div>
    <div class="metric-card"><h3>Pass Rate</h3><p style="color: ${parseFloat(summaryData.passRate) >= 95 ? '#22c55e' : '#ef4444'}">${summaryData.passRate}%</p></div>
    <div class="metric-card"><h3>Duration</h3><p>${summaryData.duration}s</p></div>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Module</th>
          <th>Test Case Name</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Duration (ms)</th>
        </tr>
      </thead>
      <tbody>
        ${testResults.map(tc => `
          <tr>
            <td><strong>${tc.id}</strong></td>
            <td>${tc.module}</td>
            <td>${tc.name}</td>
            <td>${tc.priority}</td>
            <td><span class="badge ${tc.status}">${tc.status}</span></td>
            <td>${tc.duration}ms</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    const dashboardHtml = reportHtml.replace('Live E2E Test Execution Report', 'E2E Test Execution Dashboard');

    fs.writeFileSync(path.join(config.paths.htmlDir, 'execution-report.html'), reportHtml);
    fs.writeFileSync(path.join(config.paths.htmlDir, 'dashboard.html'), dashboardHtml);

    logger.info('HTML Report & Dashboard generated in Test Results/HTML/');
  }
}

module.exports = HtmlReporter;
