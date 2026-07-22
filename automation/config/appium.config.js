/**
 * Appium Framework Configuration
 * Location: automation/config/appium.config.js
 */

export const config = {
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: '/wd/hub'
  },
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_VERSION || '13.0',
    'appium:app': process.env.ANDROID_APK_PATH || '',
    'appium:browserName': process.env.ANDROID_BROWSER || 'Chrome',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true
  },
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  retryCount: 2,
  concurrency: 5
};
