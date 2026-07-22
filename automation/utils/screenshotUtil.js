import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

export async function takeScreenshot(driver, testName) {
  const fileName = `${testName}_${Date.now()}.png`;
  const filePath = path.join(screenshotsDir, fileName);
  if (driver && driver.saveScreenshot) {
    await driver.saveScreenshot(filePath);
    return filePath;
  }
  return null;
}
