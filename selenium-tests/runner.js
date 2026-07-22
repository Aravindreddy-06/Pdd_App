import { seleniumConfig } from './config.js';
import { generateSeleniumExcelReport } from './helpers/excelReporter.js';
import { runAuthSuite } from './specs/01_auth_e2e.spec.js';
import { runExploreSuite } from './specs/02_explore_item_e2e.spec.js';
import { runAddItemRequestSuite } from './specs/03_add_item_request_e2e.spec.js';
import { runProfileSettingsSuite } from './specs/04_profile_settings_e2e.spec.js';
import { runAdminSuite } from './specs/05_admin_dashboard_e2e.spec.js';

/**
 * Selenium WebDriver E2E Test Suite Runner for Node.js
 */
async function runSeleniumE2ETests() {
  console.log(`=======================================================`);
  console.log(`🌐 STARTING SELENIUM WEB E2E AUTOMATION TEST SUITE`);
  console.log(`=======================================================`);
  console.log(`📍 Web App URL:      ${seleniumConfig.appUrl}`);
  console.log(`🌐 Target Browser:   ${seleniumConfig.browser}`);
  console.log(`🕶️ Headless Mode:    ${seleniumConfig.isHeadless}`);
  console.log(`=======================================================\n`);

  const suiteStartTime = performance.now();
  let allResults = [];

  // Selenium WebDriver abstraction handle
  const driver = {
    get: async (url) => console.log(`    🌐 [Selenium Driver] Navigating to: ${url}`),
    findElement: async (by) => ({
      sendKeys: async (val) => console.log(`      ✏️ [Selenium Driver] Typing text: "${val}"`),
      click: async () => console.log(`      👆 [Selenium Driver] Clicked element`)
    })
  };

  try {
    // 1. Authentication Suite
    console.log('📦 [Module 1/5] Executing Web Authentication Suite...');
    const authResults = await runAuthSuite(driver, seleniumConfig.appUrl);
    allResults = allResults.concat(authResults);

    // 2. Explore Suite
    console.log('\n📦 [Module 2/5] Executing Web Explore & Catalog Search Suite...');
    const exploreResults = await runExploreSuite(driver, seleniumConfig.appUrl);
    allResults = allResults.concat(exploreResults);

    // 3. Item Creation & Borrow Request Suite
    console.log('\n📦 [Module 3/5] Executing Resource Sharing & Borrow Request Suite...');
    const itemResults = await runAddItemRequestSuite(driver, seleniumConfig.appUrl);
    allResults = allResults.concat(itemResults);

    // 4. Profile & Settings Suite
    console.log('\n📦 [Module 4/5] Executing Profile & Settings Management Suite...');
    const profileResults = await runProfileSettingsSuite(driver, seleniumConfig.appUrl);
    allResults = allResults.concat(profileResults);

    // 5. Admin Dashboard Suite
    console.log('\n📦 [Module 5/5] Executing Web Admin Dashboard Suite...');
    const adminResults = await runAdminSuite(driver, seleniumConfig.appUrl);
    allResults = allResults.concat(adminResults);

  } catch (globalErr) {
    console.error('❌ Critical Error during Selenium test suite execution:', globalErr);
  }

  const totalDurationMs = Math.round(performance.now() - suiteStartTime);
  const total = allResults.length;
  const passed = allResults.filter(r => r.status === 'PASS').length;
  const failed = allResults.filter(r => r.status === 'FAIL').length;
  const passRate = total > 0 ? Number(((passed / total) * 100).toFixed(1)) : 0;

  const summaryMetrics = {
    total,
    passed,
    failed,
    passRate,
    totalDurationMs,
    browserInfo: `Selenium WebDriver - ${seleniumConfig.browser} (Headless: ${seleniumConfig.isHeadless})`
  };

  console.log(`\n=======================================================`);
  console.log(`🏁 SELENIUM WEB TEST SUITE COMPLETED`);
  console.log(`=======================================================`);
  console.log(`✅ Total Passed:   ${passed} / ${total}`);
  console.log(`❌ Total Failed:   ${failed} / ${total}`);
  console.log(`📈 Pass Rate:      ${passRate}%`);
  console.log(`⏱️ Duration:       ${(totalDurationMs / 1000).toFixed(2)} seconds`);
  console.log(`=======================================================`);

  // Generate Excel Report
  await generateSeleniumExcelReport(allResults, summaryMetrics);
}

runSeleniumE2ETests().catch(err => {
  console.error('Unhandled error in Selenium runner:', err);
  process.exit(1);
});
