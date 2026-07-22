import { AuthPage } from '../pages/AuthPage.js';
import { getTestData } from '../data/dataProvider.js';
import { TestListener } from '../listeners/testListener.js';

export async function runAuthTests(driver) {
  const authPage = new AuthPage(driver);
  const dataList = getTestData('AUTH', 50);
  const results = [];

  for (const item of dataList) {
    const outcome = await TestListener.retryTest(async () => {
      await authPage.login(item.user, 'Pass123!');
      return true;
    }, item.title);

    results.push({
      id: item.testId,
      module: 'Authentication',
      title: item.title,
      status: outcome.status,
      duration: outcome.duration
    });
  }

  return results;
}
