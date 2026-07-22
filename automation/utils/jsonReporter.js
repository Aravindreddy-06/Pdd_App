import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateJsonReport(testCases, metrics) {
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const data = {
    title: '450 Executable Appium Test Cases Execution Report',
    generatedAt: new Date().toISOString(),
    metrics,
    testCases
  };

  const filePath = path.join(reportsDir, 'automation_e2e_report.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`📊 JSON Report generated: ${filePath}`);
  return filePath;
}
