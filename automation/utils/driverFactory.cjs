const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config/config.cjs');
const logger = require('./logger.cjs');

class DriverFactory {
  static async createDriver() {
    logger.info(`Initializing ${config.browser.toUpperCase()} WebDriver... (Headless: ${config.headless})`);
    
    const options = new chrome.Options();
    options.addArguments(
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--ignore-certificate-errors',
      '--disable-extensions',
      '--remote-allow-origins=*',
      '--allow-insecure-localhost'
    );

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({
      implicit: config.timeout.implicit,
      pageLoad: config.timeout.pageLoad,
      script: config.timeout.script,
    });

    return driver;
  }
}

module.exports = DriverFactory;
