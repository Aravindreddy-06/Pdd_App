import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateSummaryMarkdown(testCases, metrics) {
  const summaryDir = path.join(__dirname, '..', 'reports', 'Summary');
  if (!fs.existsSync(summaryDir)) fs.mkdirSync(summaryDir, { recursive: true });

  const passed = testCases.filter(t => t.status === 'PASSED');
  const failed = testCases.filter(t => t.status === 'FAILED');
  const skipped = testCases.filter(t => t.status === 'SKIPPED');

  const mdContent = `# Android Appium E2E Execution Summary

**Build Number:** #${process.env.GITHUB_RUN_NUMBER || '104'}  
**Execution Date:** ${new Date().toLocaleString()}  
**Git Commit:** ${process.env.GITHUB_SHA || '10cccd0'}  
**Branch:** ${process.env.GITHUB_REF_NAME || 'main'}  

**APK Version:** 1.0.0-debug  
**Device:** Android Emulator (Nexus 6)  
**Android Version:** 11.0 (API 30)  

---

### Execution Metrics

- **Total Test Cases:** ${metrics.total}
- **Executed:** ${metrics.executed}
- **Passed:** ${metrics.passed}
- **Failed:** ${metrics.failed}
- **Skipped:** ${metrics.skipped}
- **Blocked:** ${metrics.blocked}

- **Pass Percentage:** ${metrics.passRate}%
- **Fail Percentage:** ${(100 - metrics.passRate).toFixed(1)}%
- **Execution Duration:** ${(metrics.durationMs / 1000).toFixed(2)} seconds

---

### VALID TEST CASE SUMMARY

#### PASSED TESTS
${passed.slice(0, 15).map(tc => `✓ ${tc.testCaseId} - ${tc.testName}`).join('\n')}
*... and ${Math.max(0, passed.length - 15)} more passed tests.*

#### FAILED TESTS
${failed.length > 0 ? failed.map(tc => `✗ ${tc.testCaseId} - ${tc.testName}\nReason: ${tc.actualResult}`).join('\n\n') : '*No failed tests! All assertions passed.*'}

#### SKIPPED TESTS
${skipped.length > 0 ? skipped.map(tc => `- ${tc.testCaseId} - ${tc.testName}\nReason: ${tc.actualResult}`).join('\n\n') : '*No skipped tests.*'}
`;

  const filePath = path.join(summaryDir, 'summary.md');
  fs.writeFileSync(filePath, mdContent, 'utf-8');
  console.log(`📄 Markdown Summary generated: ${filePath}`);

  // Write to GitHub Step Summary if running in CI
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, mdContent, 'utf-8');
  }

  return filePath;
}
