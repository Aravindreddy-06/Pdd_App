import { AuthPage } from '../pageObjects/AuthPage.js';

export async function runAuthSuite(driver, baseUrl) {
  const authPage = new AuthPage(driver);
  const results = [];

  // Test Case 1: Web App Landing Page Navigation
  const t1Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-AUTH-01: Navigate to Web Landing Page');
    if (driver && driver.get) await driver.get(`${baseUrl}/`);
    results.push({
      module: 'Authentication',
      title: 'TC-SEL-AUTH-01: Web App Landing Page Navigation',
      status: 'PASS',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Authentication',
      title: 'TC-SEL-AUTH-01: Web App Landing Page Navigation',
      status: 'FAIL',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  // Test Case 2: Web User Registration
  const t2Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-AUTH-02: Web Account Registration (Sign Up)');
    await authPage.signup({
      name: 'Selenium Web Tester',
      email: `sel_user_${Date.now()}@example.com`,
      phone: '+15559876543'
    });
    results.push({
      module: 'Authentication',
      title: 'TC-SEL-AUTH-02: Web Account Registration (Sign Up)',
      status: 'PASS',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Authentication',
      title: 'TC-SEL-AUTH-02: Web Account Registration (Sign Up)',
      status: 'FAIL',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  // Test Case 3: Web Login Flow
  const t3Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-AUTH-03: Web User Login Authentication');
    await authPage.openLogin(baseUrl);
    await authPage.login('resourceshareadmin@gmail.com', 'RS-ADMIN-2026');
    results.push({
      module: 'Authentication',
      title: 'TC-SEL-AUTH-03: Web User Login Authentication',
      status: 'PASS',
      duration: Math.round(performance.now() - t3Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Authentication',
      title: 'TC-SEL-AUTH-03: Web User Login Authentication',
      status: 'FAIL',
      duration: Math.round(performance.now() - t3Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  return results;
}
