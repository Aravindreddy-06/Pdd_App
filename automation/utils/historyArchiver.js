import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function archiveBuildHistory(metrics) {
  const reportsDir = path.join(__dirname, '..', 'reports');
  const latestDir = path.join(reportsDir, 'latest');
  const buildNum = process.env.GITHUB_RUN_NUMBER || '104';
  const historyBuildDir = path.join(reportsDir, 'history', `build-${String(buildNum).padStart(3, '0')}`);

  if (!fs.existsSync(latestDir)) fs.mkdirSync(latestDir, { recursive: true });
  if (!fs.existsSync(historyBuildDir)) fs.mkdirSync(historyBuildDir, { recursive: true });

  // Copy latest HTML, markdown summary to latest/ and history/build-N/
  const htmlFile = path.join(reportsDir, 'HTML', 'execution-report.html');
  const dashFile = path.join(reportsDir, 'HTML', 'dashboard.html');
  const summaryFile = path.join(reportsDir, 'Summary', 'summary.md');

  if (fs.existsSync(htmlFile)) {
    fs.copyFileSync(htmlFile, path.join(latestDir, 'execution-report.html'));
    fs.copyFileSync(htmlFile, path.join(historyBuildDir, 'execution-report.html'));
  }
  if (fs.existsSync(dashFile)) {
    fs.copyFileSync(dashFile, path.join(latestDir, 'dashboard.html'));
    fs.copyFileSync(dashFile, path.join(historyBuildDir, 'dashboard.html'));
  }
  if (fs.existsSync(summaryFile)) {
    fs.copyFileSync(summaryFile, path.join(latestDir, 'summary.md'));
    fs.copyFileSync(summaryFile, path.join(historyBuildDir, 'summary.md'));
  }

  console.log(`📂 Build history archived: ${historyBuildDir}`);
}
