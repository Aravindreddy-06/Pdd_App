export class AuthPage {
  constructor(driver) {
    this.driver = driver;
    this.emailInput = '#email';
    this.passwordInput = '#password';
    this.submitBtn = '.auth-submit-btn';
  }

  async login(email, password) {
    if (this.driver && this.driver.$) {
      const emailEl = await this.driver.$(this.emailInput);
      await emailEl.setValue(email);
      const passEl = await this.driver.$(this.passwordInput);
      await passEl.setValue(password);
      const btn = await this.driver.$(this.submitBtn);
      await btn.click();
    }
    return true;
  }
}
