import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Historical Execution Trend Tracker
 */
export function updateExecutionHistory(summaryMetrics) {
  const historyDir = path.join(__dirname, '..', 'reports', 'history');
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }

  const historyFilePath = path.join(historyDir, 'history.json');
  let historyData = [];

  if (fs.existsSync(historyFilePath)) {
    try {
      historyData = JSON.parse(fs.readFileSync(historyFilePath, 'utf-8'));
    } catch (e) {
      historyData = [];
    }
  }

  const record = {
    runId: Date.now(),
    timestamp: new Date().toISOString(),
    total: summaryMetrics.total,
    passed: summaryMetrics.passed,
    failed: summaryMetrics.failed,
    passRate: summaryMetrics.passRate,
    durationMs: summaryMetrics.totalDurationMs
  };

  historyData.push(record);
  // Maintain last 50 execution runs
  if (historyData.length > 50) {
    historyData = historyData.slice(historyData.length - 50);
  }

  fs.writeFileSync(historyFilePath, JSON.stringify(historyData, null, 2), 'utf-8');
  console.log(`📈 Historical execution record saved to: ${historyFilePath}`);
  return historyFilePath;
}
