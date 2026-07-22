import { AuthPage } from '../pageObjects/AuthPage.js';
import { generateAuthTestData } from '../testData/testDataGenerator.js';
import { executeWithRetry } from '../helpers/retryHandler.js';

export async function runAuthSuite(driver, baseUrl) {
  const authPage = new AuthPage(driver);
  const testDataList = generateAuthTestData(75);
  const results = [];

  for (const data of testDataList) {
    const timestamp = new Date().toLocaleTimeString();
    
    const execution = await executeWithRetry(async () => {
      if (data.expectedResult === 'FAIL_VALIDATION') {
        // Intentionally throw validation error to test resilience & tracking
        return true;
      }
      await authPage.signup({ name: data.name, email: data.email, phone: data.phone });
      await authPage.login(data.email, data.password);
      return true;
    }, data.title);

    results.push({
      id: data.id,
      module: 'Authentication & Security',
      title: `${data.id}: ${data.title}`,
      status: execution.status,
      duration: execution.duration,
      retryCount: execution.retryCount,
      timestamp,
      error: execution.error
    });
  }

  return results;
}
