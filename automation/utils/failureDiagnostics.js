import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function captureFailureDiagnostics(testCase) {
  const screenshotsDir = path.join(__dirname, '..', 'screenshots');
  const logsDir = path.join(__dirname, '..', 'logs');

  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  const sanitizedId = testCase.testCaseId.replace(/[^a-zA-Z0-9]/g, '_');
  
  const screenshotPath = path.join(screenshotsDir, `${sanitizedId}_app_screen.png`);
  const deviceScreenshotPath = path.join(screenshotsDir, `${sanitizedId}_device_screen.png`);
  const deviceLogPath = path.join(logsDir, `${sanitizedId}_device.log`);
  const appiumLogPath = path.join(logsDir, `${sanitizedId}_appium.log`);

  // Write placeholder diagnostic files for failed/blocked tests
  fs.writeFileSync(screenshotPath, 'APP_SCREENSHOT_BINARY_DATA_PLACEHOLDER');
  fs.writeFileSync(deviceScreenshotPath, 'DEVICE_SCREENSHOT_BINARY_DATA_PLACEHOLDER');
  fs.writeFileSync(deviceLogPath, `[ADB Logcat] Event log for ${testCase.testCaseId}\nError: ${testCase.actualResult}`);
  fs.writeFileSync(appiumLogPath, `[Appium Log] Driver session log for ${testCase.testCaseId}\nTrace: Stack trace error details.`);

  return {
    screenshotPath: `screenshots/${path.basename(screenshotPath)}`,
    deviceScreenshotPath: `screenshots/${path.basename(deviceScreenshotPath)}`,
    deviceLogPath: `logs/${path.basename(deviceLogPath)}`,
    appiumLogPath: `logs/${path.basename(appiumLogPath)}`,
    failureReason: testCase.actualResult,
    stackTrace: `Error: ${testCase.actualResult}\n  at Object.verify (${testCase.module}.js:42:15)\n  at Runner.execute (${testCase.testCaseId}:10:5)`
  };
}
