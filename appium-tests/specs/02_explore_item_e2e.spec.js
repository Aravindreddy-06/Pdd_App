import { HomePage } from '../pageObjects/HomePage.js';
import { generateExploreTestData } from '../testData/testDataGenerator.js';
import { executeWithRetry } from '../helpers/retryHandler.js';

export async function runExploreSuite(driver, baseUrl) {
  const homePage = new HomePage(driver);
  const testDataList = generateExploreTestData(80);
  const results = [];

  for (const data of testDataList) {
    const timestamp = new Date().toLocaleTimeString();

    const execution = await executeWithRetry(async () => {
      await homePage.searchResource(data.query);
      await homePage.filterCategory(data.category);
      await homePage.selectItemCard(0);
      return true;
    }, data.title);

    results.push({
      id: data.id,
      module: 'Explore & Catalog Search',
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
