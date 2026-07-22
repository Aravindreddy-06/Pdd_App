import { AdminPage } from '../pageObjects/AdminPage.js';

export async function runAdminSuite(driver, baseUrl) {
  const adminPage = new AdminPage(driver);
  const results = [];

  // Test Case 1: Admin Login
  const t1Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-ADM-01: Web Admin Authentication');
    await adminPage.login('resourceshareadmin@gmail.com', 'RS-ADMIN-2026');
    results.push({
      module: 'Admin Management',
      title: 'TC-SEL-ADM-01: Web Admin Secret Authentication',
      status: 'PASS',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Admin Management',
      title: 'TC-SEL-ADM-01: Web Admin Secret Authentication',
      status: 'FAIL',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  // Test Case 2: Inspect Admin Dashboard
  const t2Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-ADM-02: Web Admin Dashboard Metrics Inspection');
    await adminPage.viewDashboardStats();
    results.push({
      module: 'Admin Management',
      title: 'TC-SEL-ADM-02: Web Admin Dashboard Metrics & Moderation',
      status: 'PASS',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Admin Management',
      title: 'TC-SEL-ADM-02: Web Admin Dashboard Metrics & Moderation',
      status: 'FAIL',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  return results;
}
