const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://aravindreddy-06.github.io/Pdd_App';

// Strict validation: Prevent executing Selenium against localhost
if (BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')) {
  console.error('ERROR: Selenium tests MUST run against the live deployment URL, NOT localhost.');
}

module.exports = {
  baseUrl: BASE_URL.replace(/\/$/, ''),
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS !== 'false',
  timeout: {
    implicit: 10000,
    pageLoad: 30000,
    script: 30000,
    explicit: 15000,
  },
  retries: 2,
  passThreshold: 95.0, // 95% pass rate required for workflow success
  maxCriticalFailuresPercent: 5.0,
  paths: {
    resultsDir: path.join(process.cwd(), 'Test Results'),
    excelDir: path.join(process.cwd(), 'Test Results', 'Excel'),
    htmlDir: path.join(process.cwd(), 'Test Results', 'HTML'),
    screenshotsDir: path.join(process.cwd(), 'Test Results', 'Screenshots'),
    logsDir: path.join(process.cwd(), 'Test Results', 'Logs'),
    jsonDir: path.join(process.cwd(), 'Test Results', 'JSON'),
    summaryDir: path.join(process.cwd(), 'Test Results', 'Summary'),
  }
};
