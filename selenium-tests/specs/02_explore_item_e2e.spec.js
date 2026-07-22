import { HomePage } from '../pageObjects/HomePage.js';

export async function runExploreSuite(driver, baseUrl) {
  const homePage = new HomePage(driver);
  const results = [];

  // Test Case 1: Search Catalog
  const t1Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-EXP-01: Web Resource Catalog Search');
    await homePage.searchResource('Camping Tent');
    results.push({
      module: 'Explore & Search',
      title: 'TC-SEL-EXP-01: Web Resource Catalog Search',
      status: 'PASS',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Explore & Search',
      title: 'TC-SEL-EXP-01: Web Resource Catalog Search',
      status: 'FAIL',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  // Test Case 2: Category Filter Navigation
  const t2Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-EXP-02: Web Category Filter Navigation');
    await homePage.filterCategory('Outdoor & Camping');
    results.push({
      module: 'Explore & Search',
      title: 'TC-SEL-EXP-02: Web Category Filter Navigation',
      status: 'PASS',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Explore & Search',
      title: 'TC-SEL-EXP-02: Web Category Filter Navigation',
      status: 'FAIL',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  // Test Case 3: Item Card Click & Detail View
  const t3Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-EXP-03: Web Item Card Interaction & Detail View');
    await homePage.clickItem(0);
    results.push({
      module: 'Explore & Search',
      title: 'TC-SEL-EXP-03: Web Item Card Detail View',
      status: 'PASS',
      duration: Math.round(performance.now() - t3Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Explore & Search',
      title: 'TC-SEL-EXP-03: Web Item Card Detail View',
      status: 'FAIL',
      duration: Math.round(performance.now() - t3Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  return results;
}
