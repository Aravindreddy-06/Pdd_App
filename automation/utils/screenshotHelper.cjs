const fs = require('fs');
const path = require('path');
const config = require('../config/config.cjs');
const logger = require('./logger.cjs');

class ScreenshotHelper {
  static async captureScreenshot(driver, testId) {
    try {
      if (!fs.existsSync(config.paths.screenshotsDir)) {
        fs.mkdirSync(config.paths.screenshotsDir, { recursive: true });
      }

      const fileName = `${testId}_${Date.now()}.png`;
      const filePath = path.join(config.paths.screenshotsDir, fileName);

      const imageBuffer = await driver.takeScreenshot();
      fs.writeFileSync(filePath, imageBuffer, 'base64');
      logger.info(`Screenshot captured for ${testId}: ${fileName}`);

      return fileName;
    } catch (err) {
      logger.error(`Failed to capture screenshot for ${testId}: ${err.message}`);
      return null;
    }
  }

  static async captureConsoleLogs(driver) {
    try {
      const logs = await driver.manage().logs().get('browser');
      return logs.map(entry => `[${entry.level.name}] ${entry.message}`).join('\n');
    } catch (err) {
      return 'Console logs unavailable in current browser configuration.';
    }
  }
}

module.exports = ScreenshotHelper;
