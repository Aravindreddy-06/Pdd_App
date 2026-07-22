/**
 * Selenium WebDriver Configuration File for Web Application Testing
 * Supports Headless / GUI Chrome, Firefox, and Edge browsers.
 */

export const seleniumConfig = {
  // Target Web Application URL
  appUrl: process.env.APP_URL || 'http://localhost:5173',

  // Browser Options
  browser: process.env.SELENIUM_BROWSER || 'chrome',
  isHeadless: process.env.HEADLESS !== 'false',

  // Selenium Timeout Settings (in milliseconds)
  timeouts: {
    implicit: 5000,
    pageLoad: 15000,
    script: 10000
  },

  // Window Resolution
  windowSize: {
    width: 1280,
    height: 800
  }
};
