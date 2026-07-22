export class HomePage {
  constructor(driver) {
    this.driver = driver;
    this.searchInput = '.search-input';
  }

  async search(query) {
    if (this.driver && this.driver.$) {
      const el = await this.driver.$(this.searchInput);
      await el.setValue(query);
    }
    return true;
  }
}
