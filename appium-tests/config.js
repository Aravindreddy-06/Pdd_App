/**
 * Appium Capabilities & Configuration File
 * Target Platform: Android (Native APK / Webview Chrome)
 */

export const appiumConfig = {
  // Appium Server Connection Settings
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: '/wd/hub'
  },

  // Android Capabilities (Appium v2 / UiAutomator2)
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_VERSION || '13.0',
    'appium:app': process.env.ANDROID_APK_PATH || '', // Path to compiled .apk file if testing native app
    'appium:browserName': process.env.ANDROID_BROWSER || 'Chrome', // Used for mobile web / PWA testing
    'appium:newCommandTimeout': 300,
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:autoGrantPermissions': true
  },

  // Target Web Application URL (if running web test)
  appUrl: process.env.APP_URL || 'http://localhost:5173'
};
