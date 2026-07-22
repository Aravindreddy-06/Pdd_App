/**
 * Data Driven Testing Provider
 * Location: automation/data/dataProvider.js
 */
export function getTestData(suiteName, count = 50) {
  const data = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      testId: `${suiteName.toUpperCase()}_TC_${String(i).padStart(3, '0')}`,
      title: `${suiteName} Data-Driven Test #${i}`,
      user: `user_${i}@example.com`,
      value: `Value #${i}`
    });
  }
  return data;
}
