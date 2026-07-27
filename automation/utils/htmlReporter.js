import fs from 'fs';
import path from 'path';

export function generateHtmlReport(testResults, summaryData) {
  const htmlDir = path.join(process.cwd(), 'reports', 'HTML');
  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }

  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>E2E Execution Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
    h1 { color: #84cc16; }
  </style>
</head>
<body>
  <h1>E2E Test Suite Execution Dashboard</h1>
  <p>Total: ${summaryData?.total || (testResults || []).length} | Passed: ${summaryData?.passed || 0}</p>
</body>
</html>`;

  fs.writeFileSync(path.join(htmlDir, 'execution-report.html'), reportHtml);
}

export class HtmlReporter {
  static generateReports(testResults, summaryData) {
    generateHtmlReport(testResults, summaryData);
  }
}

export default HtmlReporter;
