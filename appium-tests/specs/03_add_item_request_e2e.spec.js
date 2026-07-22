import { ItemPage } from '../pageObjects/ItemPage.js';
import { BorrowRequestPage } from '../pageObjects/BorrowRequestPage.js';
import { generateItemRequestTestData } from '../testData/testDataGenerator.js';
import { executeWithRetry } from '../helpers/retryHandler.js';

export async function runAddItemRequestSuite(driver, baseUrl) {
  const itemPage = new ItemPage(driver);
  const borrowPage = new BorrowRequestPage(driver);
  const testDataList = generateItemRequestTestData(90);
  const results = [];

  for (const data of testDataList) {
    const timestamp = new Date().toLocaleTimeString();

    const execution = await executeWithRetry(async () => {
      await itemPage.createNewListing({ title: data.itemName, category: 'General', price: data.dailyPrice });
      await borrowPage.submitBorrowRequest({ startDate: '2026-08-01', endDate: '2026-08-03' });
      await borrowPage.sendChatMessage(data.requestNote);
      return true;
    }, data.title);

    results.push({
      id: data.id,
      module: 'Resource Sharing & Borrowing',
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
