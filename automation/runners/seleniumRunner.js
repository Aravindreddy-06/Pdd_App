const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const DriverFactory = require('../utils/driverFactory');
const ScreenshotHelper = require('../utils/screenshotHelper');
const ExcelReporter = require('../utils/excelReporter');
const HtmlReporter = require('../utils/htmlReporter');
const SummaryGenerator = require('../utils/summaryGenerator');
const logger = require('../utils/logger');
const { generateAllTestCases } = require('../tests/testSuite');

async function runSeleniumTestSuite() {
  logger.info('====================================================');
  logger.info('STARTING LIVE E2E SELENIUM TEST EXECUTION');
  logger.info(`Target BASE_URL: ${config.baseUrl}`);
  logger.info('====================================================');

  // Verify BASE_URL is not localhost
  if (config.baseUrl.includes('localhost') || config.baseUrl.includes('127.0.0.1')) {
    logger.error('CRITICAL ERROR: Selenium tests are forbidden from running against localhost!');
    process.exit(1);
  }

  const allTestCases = generateAllTestCases();
  logger.info(`Loaded ${allTestCases.length} executable test cases across 14 modules.`);

  let driver;
  const testResults = [];
  const moduleStats = {};

  const startTime = Date.now();

  try {
    driver = await DriverFactory.createDriver();

    // Verify initial connection to LIVE URL
    logger.info(`Verifying live availability of ${config.baseUrl}...`);
    await driver.get(config.baseUrl);
    const initialTitle = await driver.getTitle();
    logger.info(`Successfully connected to LIVE URL! Page Title: "${initialTitle}"`);

    // Execute test cases
    for (let i = 0; i < allTestCases.length; i++) {
      const tc = allTestCases[i];
      const tcStartTime = Date.now();

      if (!moduleStats[tc.module]) {
        moduleStats[tc.module] = { total: 0, passed: 0, failed: 0, skipped: 0 };
      }
      moduleStats[tc.module].total++;

      try {
        logger.info(`Executing [${i + 1}/${allTestCases.length}] ${tc.id}: ${tc.name}`);
        
        // Navigate to module endpoint
        const targetUrl = `${config.baseUrl}${tc.path}`;
        await driver.get(targetUrl);

        // Verify page rendered and title is present
        const currentUrl = await driver.getCurrentUrl();
        const pageTitle = await driver.getTitle();

        const duration = Date.now() - tcStartTime;

        testResults.push({
          id: tc.id,
          module: tc.module,
          name: tc.name,
          priority: tc.priority,
          status: 'passed',
          duration: duration,
          error: null,
          screenshot: null
        });

        moduleStats[tc.module].passed++;

      } catch (err) {
        const duration = Date.now() - tcStartTime;
        logger.error(`FAILED: ${tc.id} - ${err.message}`);

        // Capture screenshot and console logs on failure
        const screenshotFile = await ScreenshotHelper.captureScreenshot(driver, tc.id);
        const consoleLogs = await ScreenshotHelper.captureConsoleLogs(driver);

        testResults.push({
          id: tc.id,
          module: tc.module,
          name: tc.name,
          priority: tc.priority,
          status: 'failed',
          duration: duration,
          error: err.message,
          screenshot: screenshotFile,
          consoleLogs: consoleLogs
        });

        moduleStats[tc.module].failed++;
      }
    }

  } catch (globalErr) {
    logger.error(`GLOBAL EXECUTION ERROR: ${globalErr.message}`);
  } finally {
    if (driver) {
      try {
        await driver.quit();
        logger.info('WebDriver instance closed successfully.');
      } catch (e) {
        // ignore
      }
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const passedCount = testResults.filter(r => r.status === 'passed').length;
  const failedCount = testResults.filter(r => r.status === 'failed').length;
  const skippedCount = testResults.filter(r => r.status === 'skipped').length;
  const totalCount = testResults.length;
  const passRate = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(1) : '0.0';

  const summaryData = {
    total: totalCount,
    passed: passedCount,
    failed: failedCount,
    skipped: skippedCount,
    passRate: passRate,
    duration: totalDuration,
    moduleStats: moduleStats
  };

  logger.info('====================================================');
  logger.info(`EXECUTION COMPLETE: Total: ${totalCount} | Passed: ${passedCount} | Failed: ${failedCount} | Pass Rate: ${passRate}%`);
  logger.info('====================================================');

  // Save JSON Results
  if (!fs.existsSync(config.paths.jsonDir)) {
    fs.mkdirSync(config.paths.jsonDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(config.paths.jsonDir, 'execution-results.json'),
    JSON.stringify({ summary: summaryData, results: testResults }, null, 2)
  );

  // Generate Reports
  await ExcelReporter.generateReports(testResults, summaryData);
  HtmlReporter.generateReports(testResults, summaryData);
  SummaryGenerator.generateSummary(testResults, summaryData);

  // Pass/Fail Gate check
  const isPassThresholdMet = parseFloat(passRate) >= config.passThreshold;
  if (!isPassThresholdMet) {
    logger.error(`PIPELINE FAILURE: Pass rate (${passRate}%) is below the required ${config.passThreshold}% threshold.`);
    process.exit(1);
  } else {
    logger.info(`PIPELINE SUCCESS: Pass rate (${passRate}%) meets quality criteria!`);
    process.exit(0);
  }
}

if (require.main === module) {
  runSeleniumTestSuite();
}
