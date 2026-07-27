const fs = require('fs');
const path = require('path');
const config = require('../config/config.cjs');

class Logger {
  constructor() {
    this.logDir = config.paths.logsDir;
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    this.logFile = path.join(this.logDir, 'execution.log');
    this.logs = [];
  }

  log(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(metadata).length ? ` | ${JSON.stringify(metadata)}` : '';
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    
    console.log(logLine);
    this.logs.push(logLine);
    
    try {
      fs.appendFileSync(this.logFile, logLine + '\n');
    } catch (err) {
      console.error('Failed to write log file:', err);
    }
  }

  info(msg, meta) { this.log('INFO', msg, meta); }
  warn(msg, meta) { this.log('WARN', msg, meta); }
  error(msg, meta) { this.log('ERROR', msg, meta); }
  debug(msg, meta) { this.log('DEBUG', msg, meta); }

  getLogs() { return this.logs; }
}

module.exports = new Logger();
