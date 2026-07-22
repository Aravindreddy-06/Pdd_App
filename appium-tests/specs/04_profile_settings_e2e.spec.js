import { ProfilePage } from '../pageObjects/ProfilePage.js';
import { generateProfileTestData } from '../testData/testDataGenerator.js';
import { executeWithRetry } from '../helpers/retryHandler.js';

export async function runProfileSettingsSuite(driver, baseUrl) {
  const profilePage = new ProfilePage(driver);
  const testDataList = generateProfileTestData(75);
  const results = [];

  for (const data of testDataList) {
    const timestamp = new Date().toLocaleTimeString();

    const execution = await executeWithRetry(async () => {
      await profilePage.viewProfile();
      await profilePage.updateBio(data.bioText);
      return true;
    }, data.title);

    results.push({
      id: data.id,
      module: 'Profile, Trust Score & Settings',
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
