/**
 * Automated Retry Engine
 * Retries failed test executions up to MAX_RETRIES times to ensure test stability.
 */

export async function executeWithRetry(testFn, testTitle, maxRetries = 2) {
  let attempt = 0;
  let lastError = null;
  const startTime = performance.now();

  while (attempt <= maxRetries) {
    try {
      if (attempt > 0) {
        console.warn(`  🔄 Retrying test "${testTitle}" (Attempt ${attempt}/${maxRetries})...`);
      }
      const result = await testFn();
      const duration = Math.round(performance.now() - startTime);

      return {
        status: 'PASS',
        duration,
        retryCount: attempt,
        error: null
      };
    } catch (err) {
      lastError = err;
      attempt++;
    }
  }

  const duration = Math.round(performance.now() - startTime);
  return {
    status: 'FAIL',
    duration,
    retryCount: maxRetries,
    error: lastError ? lastError.message : 'Unknown execution error'
  };
}
