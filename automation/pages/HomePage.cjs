const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage.cjs');

class HomePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.searchBar = By.css('input[placeholder*="Search"]');
    this.cartIcon = By.css('a[href="/cart"]');
    this.exploreLink = By.css('a[href="/explore"]');
    this.itemCards = By.css('.item-card');
  }

  async open() {
    await this.navigateTo('/home');
  }

  async searchItem(query) {
    if (await this.isDisplayed(this.searchBar)) {
      await this.type(this.searchBar, query);
    }
  }

  async openCart() {
    await this.click(this.cartIcon);
  }
}

module.exports = HomePage;
