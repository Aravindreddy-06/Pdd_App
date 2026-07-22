import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '..', 'reports', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'execution.log');

export function logMessage(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const formattedLog = `[${timestamp}] [${level}] ${message}\n`;
  
  // Console output
  if (level === 'ERROR') {
    console.error(`❌ ${message}`);
  } else if (level === 'WARN') {
    console.warn(`⚠️ ${message}`);
  } else {
    console.log(`ℹ️ ${message}`);
  }

  // File write
  fs.appendFileSync(logFilePath, formattedLog, 'utf-8');
}

export function getLogFilePath() {
  return logFilePath;
}
