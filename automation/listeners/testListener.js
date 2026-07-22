import { log } from '../utils/loggerUtil.js';

/**
 * TestNG/JUnit Style Listener & Retry Event Handler
 * Location: automation/listeners/testListener.js
 */
export class TestListener {
  static onTestStart(testName) {
    log(`▶ [TestStart] ${testName}`);
  }

  static onTestSuccess(testName, duration) {
    log(`✅ [TestSuccess] ${testName} (${duration}ms)`);
  }

  static onTestFailure(testName, err, attempt) {
    log(`❌ [TestFailure] ${testName} (Attempt ${attempt}): ${err.message}`, 'WARN');
  }

  static async retryTest(testFn, testName, maxRetries = 2) {
    let attempt = 0;
    const start = performance.now();
    this.onTestStart(testName);

    while (attempt <= maxRetries) {
      try {
        await testFn();
        const duration = Math.round(performance.now() - start);
        this.onTestSuccess(testName, duration);
        return { status: 'PASS', duration };
      } catch (err) {
        attempt++;
        this.onTestFailure(testName, err, attempt);
        if (attempt > maxRetries) {
          const duration = Math.round(performance.now() - start);
          return { status: 'FAIL', duration, error: err.message };
        }
      }
    }
  }
}
