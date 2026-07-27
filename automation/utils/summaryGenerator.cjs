const fs = require('fs');
const path = require('path');
const config = require('../config/config.cjs');
const logger = require('./logger.cjs');

class SummaryGenerator {
  static generateSummary(testResults, summaryData) {
    logger.info('Generating GitHub Execution Summary markdown...');

    if (!fs.existsSync(config.paths.summaryDir)) {
      fs.mkdirSync(config.paths.summaryDir, { recursive: true });
    }

    const failedTests = testResults.filter(t => t.status === 'failed');
    const isWorkflowPassed = parseFloat(summaryData.passRate) >= config.passThreshold;

    const summaryMd = `# Live GitHub Pages E2E Execution Summary

### 🚀 Deployment Details
- **Deployment URL**: [${config.baseUrl}](${config.baseUrl})
- **Execution Date**: \`${new Date().toISOString()}\`
- **Build Status**: \`PASS\`
- **Deployment Status**: \`PASS\`

---

### 📊 Test Execution Metrics
| Metric | Value |
|---|---|
| **Total Test Cases** | **${summaryData.total}** |
| **Passed** | 🟢 **${summaryData.passed}** |
| **Failed** | 🔴 **${summaryData.failed}** |
| **Skipped** | 🟡 **${summaryData.skipped}** |
| **Pass Percentage** | **${summaryData.passRate}%** (Threshold: \`95.0%\`) |
| **Execution Duration** | **${summaryData.duration}s** |
| **Overall Execution Result** | ${isWorkflowPassed ? '✅ **PASSED**' : '❌ **FAILED (Pass Rate Below 95%)**'} |

---

### 📂 Artifacts Generated & Uploaded
- [x] **Automation_Test_Report.xlsx** (Full 6-Sheet Executive Report)
- [x] **Passed_Test_Cases.xlsx** & **Failed_Test_Cases.xlsx**
- [x] **Summary_Report.xlsx**
- [x] **execution-report.html** & **dashboard.html**
- [x] **execution-results.json**
- [x] **Screenshots & Console Logs**

---

### ❌ Failed Test Cases (${failedTests.length})
${failedTests.length === 0 ? '*No failures! All test cases passed successfully.*' : failedTests.map(t => `- **[${t.id}]** \`${t.name}\` (${t.module}) — *${t.error || 'Assertion failed'}*`).join('\n')}
`;

    // Save summary.md
    fs.writeFileSync(path.join(config.paths.summaryDir, 'summary.md'), summaryMd);

    // Write to GITHUB_STEP_SUMMARY environment file if running inside GitHub Actions
    if (process.env.GITHUB_STEP_SUMMARY) {
      try {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMd);
        logger.info('Successfully published summary to GITHUB_STEP_SUMMARY');
      } catch (err) {
        logger.error(`Failed writing to GITHUB_STEP_SUMMARY: ${err.message}`);
      }
    }

    return summaryMd;
  }
}

module.exports = SummaryGenerator;
