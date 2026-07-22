import { AdminPage } from '../pageObjects/AdminPage.js';
import { generateAdminTestData } from '../testData/testDataGenerator.js';
import { executeWithRetry } from '../helpers/retryHandler.js';

export async function runAdminSuite(driver, baseUrl) {
  const adminPage = new AdminPage(driver);
  const testDataList = generateAdminTestData(80);
  const results = [];

  for (const data of testDataList) {
    const timestamp = new Date().toLocaleTimeString();

    const execution = await executeWithRetry(async () => {
      await adminPage.adminLogin('resourceshareadmin@gmail.com', 'RS-ADMIN-2026');
      await adminPage.inspectDashboardStats();
      return true;
    }, data.title);

    results.push({
      id: data.id,
      module: 'Admin Governance & Security',
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
