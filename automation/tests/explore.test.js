import { HomePage } from '../pages/HomePage.js';
import { getTestData } from '../data/dataProvider.js';
import { TestListener } from '../listeners/testListener.js';

export async function runExploreTests(driver) {
  const homePage = new HomePage(driver);
  const dataList = getTestData('EXPLORE', 50);
  const results = [];

  for (const item of dataList) {
    const outcome = await TestListener.retryTest(async () => {
      await homePage.search(item.value);
      return true;
    }, item.title);

    results.push({
      id: item.testId,
      module: 'Explore & Search',
      title: item.title,
      status: outcome.status,
      duration: outcome.duration
    });
  }

  return results;
}
