import { ProfilePage } from '../pageObjects/ProfilePage.js';

export async function runProfileSettingsSuite(driver, baseUrl) {
  const profilePage = new ProfilePage(driver);
  const results = [];

  // Test Case 1: View Web Profile & Trust Score
  const t1Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-PROF-01: Web Profile View & Trust Verification');
    await profilePage.viewProfile();
    results.push({
      module: 'Profile & Settings',
      title: 'TC-SEL-PROF-01: Web Profile View & Trust Verification',
      status: 'PASS',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Profile & Settings',
      title: 'TC-SEL-PROF-01: Web Profile View & Trust Verification',
      status: 'FAIL',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  // Test Case 2: Update Profile Information
  const t2Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-PROF-02: Web Profile Bio & Settings Update');
    await profilePage.updateBio('Active community member sharing power tools and yard gear.');
    results.push({
      module: 'Profile & Settings',
      title: 'TC-SEL-PROF-02: Web Profile Bio & Settings Update',
      status: 'PASS',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Profile & Settings',
      title: 'TC-SEL-PROF-02: Web Profile Bio & Settings Update',
      status: 'FAIL',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  // Test Case 3: Session Logout
  const t3Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-PROF-03: Web User Logout Session');
    await profilePage.logout();
    results.push({
      module: 'Profile & Settings',
      title: 'TC-SEL-PROF-03: Web User Logout Session',
      status: 'PASS',
      duration: Math.round(performance.now() - t3Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Profile & Settings',
      title: 'TC-SEL-PROF-03: Web User Logout Session',
      status: 'FAIL',
      duration: Math.round(performance.now() - t3Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  return results;
}
