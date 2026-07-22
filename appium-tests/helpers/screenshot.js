import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '..', 'reports', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

export async function captureScreenshot(driver, testName) {
  const sanitizedName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${sanitizedName}_${Date.now()}.png`;
  const filePath = path.join(screenshotsDir, filename);

  try {
    if (driver && driver.saveScreenshot) {
      await driver.saveScreenshot(filePath);
      console.log(`📸 Screenshot captured: ${filePath}`);
      return `screenshots/${filename}`;
    }
  } catch (err) {
    console.error(`⚠️ Could not save screenshot for ${testName}: ${err.message}`);
  }
  return null;
}
