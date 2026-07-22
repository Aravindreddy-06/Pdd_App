import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Machine-Readable JSON Report Generator
 */
export function generateJsonReport(testResults, summaryMetrics) {
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const jsonReportData = {
    schemaVersion: '1.0.0',
    title: 'Appium Android Mobile E2E Test Execution Summary',
    generatedAt: new Date().toISOString(),
    metrics: summaryMetrics,
    results: testResults
  };

  const jsonPath = path.join(reportsDir, 'appium_e2e_test_report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReportData, null, 2), 'utf-8');

  console.log(`📊 Machine-Readable JSON Test Report generated:`);
  console.log(`📂 Path: file:///${jsonPath.replace(/\\/g, '/')}\n`);

  return jsonPath;
}
