import { ItemPage } from '../pageObjects/ItemPage.js';
import { BorrowRequestPage } from '../pageObjects/BorrowRequestPage.js';

export async function runAddItemRequestSuite(driver, baseUrl) {
  const itemPage = new ItemPage(driver);
  const borrowPage = new BorrowRequestPage(driver);
  const results = [];

  // Test Case 1: Publish Item Listing
  const t1Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-ITEM-01: Web New Resource Listing Creation');
    await itemPage.publishItem({
      title: 'DeWalt Circular Saw',
      category: 'Tools',
      price: '$8/day'
    });
    results.push({
      module: 'Resource Sharing',
      title: 'TC-SEL-ITEM-01: Web New Resource Listing Creation',
      status: 'PASS',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Resource Sharing',
      title: 'TC-SEL-ITEM-01: Web New Resource Listing Creation',
      status: 'FAIL',
      duration: Math.round(performance.now() - t1Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  // Test Case 2: Borrow Request Form Submission
  const t2Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-BORROW-01: Web Borrow Request Form Submission');
    await borrowPage.submitRequest('2026-08-10', '2026-08-12');
    results.push({
      module: 'Borrowing & Requests',
      title: 'TC-SEL-BORROW-01: Web Borrow Request Form Submission',
      status: 'PASS',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Borrowing & Requests',
      title: 'TC-SEL-BORROW-01: Web Borrow Request Form Submission',
      status: 'FAIL',
      duration: Math.round(performance.now() - t2Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  // Test Case 3: Real-Time Chat Message
  const t3Start = performance.now();
  try {
    console.log('  ▶ Running TC-SEL-CHAT-01: Web Real-Time Messaging');
    await borrowPage.sendMessage('Hello, can I pick up the circular saw tomorrow at 10 AM?');
    results.push({
      module: 'Chat & Messaging',
      title: 'TC-SEL-CHAT-01: Web Real-Time Messaging to Owner',
      status: 'PASS',
      duration: Math.round(performance.now() - t3Start),
      timestamp: new Date().toLocaleTimeString()
    });
  } catch (err) {
    results.push({
      module: 'Chat & Messaging',
      title: 'TC-SEL-CHAT-01: Web Real-Time Messaging to Owner',
      status: 'FAIL',
      duration: Math.round(performance.now() - t3Start),
      timestamp: new Date().toLocaleTimeString(),
      error: err.message
    });
  }

  return results;
}
