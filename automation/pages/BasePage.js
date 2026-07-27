const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.baseUrl = config.baseUrl;
  }

  async navigateTo(path = '') {
    const fullUrl = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    await this.driver.get(fullUrl);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.driver.wait(
      async (d) => (await d.executeScript('return document.readyState')) === 'complete',
      config.timeout.pageLoad
    );
  }

  async findElement(locator, timeout = config.timeout.explicit) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async click(locator) {
    const element = await this.findElement(locator);
    await this.driver.wait(until.elementIsVisible(element), config.timeout.explicit);
    await element.click();
  }

  async type(locator, text) {
    const element = await this.findElement(locator);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(locator) {
    const element = await this.findElement(locator);
    return await element.getText();
  }

  async isDisplayed(locator) {
    try {
      const element = await this.findElement(locator, 3000);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }
}

module.exports = BasePage;
