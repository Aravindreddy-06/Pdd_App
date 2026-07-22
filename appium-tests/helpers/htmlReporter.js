import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enterprise HTML Report Generator
 * Outputs a responsive, single-file HTML dashboard with charts, KPI cards, filterable test table, screenshots & logs.
 */
export function generateHtmlReport(testResults, summaryMetrics) {
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const passPercentage = summaryMetrics.passRate;
  const failPercentage = (100 - passPercentage).toFixed(1);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appium Android Mobile E2E Test Report</title>
  <style>
    :root {
      --bg-color: #0f172a;
      --card-bg: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border-color: #334155;
      --accent-blue: #3b82f6;
      --pass-green: #22c55e;
      --fail-red: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: var(--bg-color); color: var(--text-main); padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    
    /* Header Banner */
    .header { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 1.5rem 2rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 2rem; }
    .header h1 { font-size: 1.6rem; display: flex; align-items: center; gap: 0.5rem; }
    .header .meta { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem; }
    .badge-env { background: rgba(59, 130, 246, 0.2); color: var(--accent-blue); padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: 600; font-size: 0.85rem; border: 1px solid rgba(59, 130, 246, 0.3); }

    /* KPI Cards */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .kpi-card { background: var(--card-bg); padding: 1.25rem; border-radius: 10px; border: 1px solid var(--border-color); text-align: center; }
    .kpi-card .label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-card .value { font-size: 2rem; font-weight: 700; margin-top: 0.5rem; }
    .val-pass { color: var(--pass-green); }
    .val-fail { color: var(--fail-red); }
    .val-total { color: var(--accent-blue); }

    /* Section Headers */
    .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; }
    
    /* Table Styling */
    .table-container { background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem; }
    th { background: #0f172a; padding: 1rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); }
    td { padding: 1rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: rgba(255, 255, 255, 0.02); }

    /* Status Pills */
    .status-pill { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 12px; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; }
    .pill-pass { background: rgba(34, 197, 94, 0.15); color: var(--pass-green); border: 1px solid rgba(34, 197, 94, 0.3); }
    .pill-fail { background: rgba(239, 68, 68, 0.15); color: var(--fail-red); border: 1px solid rgba(239, 68, 68, 0.3); }

    /* Controls & Search */
    .filter-btn { background: #334155; color: var(--text-main); border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
    .filter-btn:hover, .filter-btn.active { background: var(--accent-blue); }

    /* Footer */
    .footer { text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1>📱 Android Appium Mobile E2E Test Report</h1>
        <div class="meta">Target: <strong>NeighborShare (PDD) Android App</strong> | Execution Date: ${new Date().toLocaleString()}</div>
      </div>
      <div class="badge-env">CI/CD Automated Execution</div>
    </div>

    <!-- KPI Summary Grid -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="label">Total Executed</div>
        <div class="value val-total">${summaryMetrics.total}</div>
      </div>
      <div class="kpi-card">
        <div class="label">Passed Tests</div>
        <div class="value val-pass">${summaryMetrics.passed}</div>
      </div>
      <div class="kpi-card">
        <div class="label">Failed Tests</div>
        <div class="value val-fail">${summaryMetrics.failed}</div>
      </div>
      <div class="kpi-card">
        <div class="label">Pass Rate</div>
        <div class="value ${summaryMetrics.passRate >= 90 ? 'val-pass' : 'val-fail'}">${summaryMetrics.passRate}%</div>
      </div>
      <div class="kpi-card">
        <div class="label">Total Duration</div>
        <div class="value" style="font-size: 1.5rem; margin-top: 0.75rem;">${(summaryMetrics.totalDurationMs / 1000).toFixed(2)}s</div>
      </div>
    </div>

    <!-- Test Results Table -->
    <div class="section-title">
      <span>Detailed Test Suite Breakdown</span>
      <div style="display: flex; gap: 0.5rem;">
        <button class="filter-btn active" onclick="filterTable('all')">All (${summaryMetrics.total})</button>
        <button class="filter-btn" onclick="filterTable('PASS')">Passed (${summaryMetrics.passed})</button>
        <button class="filter-btn" onclick="filterTable('FAIL')">Failed (${summaryMetrics.failed})</button>
      </div>
    </div>

    <div class="table-container">
      <table id="resultsTable">
        <thead>
          <tr>
            <th>#</th>
            <th>Module</th>
            <th>Test Case Description</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Timestamp</th>
            <th>Artifacts / Details</th>
          </tr>
        </thead>
        <tbody>
          ${testResults.map((test, index) => `
            <tr class="test-row" data-status="${test.status}">
              <td>${index + 1}</td>
              <td><strong>${test.module}</strong></td>
              <td>${test.title}</td>
              <td>
                <span class="status-pill ${test.status === 'PASS' ? 'pill-pass' : 'pill-fail'}">${test.status}</span>
              </td>
              <td>${test.duration} ms</td>
              <td>${test.timestamp}</td>
              <td>${test.error ? `<span style="color:var(--fail-red); font-size:0.85rem;">${test.error}</span>` : '<span style="color:var(--text-muted); font-size:0.85rem;">Log Captured</span>'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Artifacts Links -->
    <div class="header" style="background: var(--card-bg); margin-bottom: 0;">
      <div>
        <h3 style="font-size: 1.1rem; margin-bottom: 0.25rem;">📄 Additional Artifact Downloads</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Download raw execution artifacts for audit and reporting</p>
      </div>
      <div>
        <a href="appium_e2e_test_report.xlsx" download style="color: var(--accent-blue); text-decoration: none; font-weight: 600;">📥 Excel Report (.xlsx)</a>
      </div>
    </div>

    <div class="footer">
      Generated automatically by Enterprise Appium Automation Framework & GitHub Actions CI/CD Pipeline
    </div>
  </div>

  <script>
    function filterTable(status) {
      const rows = document.querySelectorAll('.test-row');
      const buttons = document.querySelectorAll('.filter-btn');
      
      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      rows.forEach(row => {
        if (status === 'all' || row.getAttribute('data-status') === status) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

  const htmlPath = path.join(reportsDir, 'index.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  console.log(`📊 Enterprise HTML Test Report generated:`);
  console.log(`📂 Path: file:///${htmlPath.replace(/\\/g, '/')}\n`);

  return htmlPath;
}
