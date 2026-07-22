/**
 * Test Data Framework - Programmatic Data Generator for 400+ E2E Test Cases
 */

export function generateAuthTestData(count = 75) {
  const data = [];
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'testorg.io'];
  
  for (let i = 1; i <= count; i++) {
    data.push({
      id: `TC-AUTH-${String(i).padStart(3, '0')}`,
      title: `Auth Scenario ${i}: Verification of ${i % 2 === 0 ? 'Valid' : 'Edge/Boundary'} Credentials & Security #${i}`,
      email: `test_user_${i}_${Date.now()}@${domains[i % domains.length]}`,
      password: i % 3 === 0 ? 'Short' : i % 5 === 0 ? 'PasswordWithNoNumber' : `SecurePass#${i}2026!`,
      name: `User TestName_${i}`,
      phone: `+1555019${String(i).padStart(4, '0')}`,
      isEdgeCase: i % 4 === 0,
      expectedResult: (i % 3 === 0 || i % 5 === 0) ? 'FAIL_VALIDATION' : 'SUCCESS'
    });
  }
  return data;
}

export function generateExploreTestData(count = 80) {
  const categories = ['Tools & Equipment', 'Outdoor & Camping', 'Electronics & Audio', 'Gardening & Lawn', 'Sports & Fitness', 'Home Appliances', 'Party & Event Supplies', 'Automotive Care'];
  const queries = ['Drill', 'Mower', 'Camping Tent', 'Projector', 'Pressure Washer', 'Kayak', 'Generator', 'Ladder', 'Bike Rack', 'Folding Chairs'];
  const data = [];

  for (let i = 1; i <= count; i++) {
    data.push({
      id: `TC-EXPLORE-${String(i).padStart(3, '0')}`,
      title: `Explore Scenario ${i}: Search & Filter for "${queries[i % queries.length]}" in Category "${categories[i % categories.length]}"`,
      query: queries[i % queries.length],
      category: categories[i % categories.length],
      maxPrice: (i * 10) % 150 + 10,
      distanceKm: (i * 5) % 50 + 1,
      sortBy: i % 2 === 0 ? 'distance' : 'price'
    });
  }
  return data;
}

export function generateItemRequestTestData(count = 90) {
  const itemNames = ['Power Lawn Aerator', 'DeWalt Mitre Saw', 'Bose Portable Speaker', 'Heavy Duty Extension Ladder', '4-Person Camping Tent', 'Karcher Pressure Washer', 'DJI Mini Drone', 'Car Battery Charger'];
  const data = [];

  for (let i = 1; i <= count; i++) {
    data.push({
      id: `TC-ITEM-${String(i).padStart(3, '0')}`,
      title: `Item/Request Scenario ${i}: Listing & Request Lifecycle for "${itemNames[i % itemNames.length]} #${i}"`,
      itemName: `${itemNames[i % itemNames.length]} #${i}`,
      dailyPrice: `$${(i % 25) + 5}/day`,
      durationDays: (i % 7) + 1,
      requestNote: `Request note #${i}: Need this item for a weekend home renovation project.`
    });
  }
  return data;
}

export function generateProfileTestData(count = 75) {
  const data = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      id: `TC-PROF-${String(i).padStart(3, '0')}`,
      title: `Profile & Settings Scenario ${i}: Audit Trust Score & Settings Preference Config #${i}`,
      bioText: `Community member bio #${i}: Passionate about neighborhood resource sharing.`,
      notificationEnabled: i % 2 === 0,
      privacyLevel: i % 3 === 0 ? 'Private' : 'Public',
      trustBadge: i > 30 ? 'Verified Neighbor Gold' : 'Verified Member'
    });
  }
  return data;
}

export function generateAdminTestData(count = 80) {
  const actions = ['Inspect User Trust Score', 'Moderate Flagged Item', 'Export System Audit Log', 'Review Analytics Dashboard', 'Verify Security Tokens'];
  const data = [];

  for (let i = 1; i <= count; i++) {
    data.push({
      id: `TC-ADM-${String(i).padStart(3, '0')}`,
      title: `Admin Governance Scenario ${i}: ${actions[i % actions.length]} for Target Sector #${i}`,
      actionName: actions[i % actions.length],
      targetId: `RES-ADMIN-OBJ-${1000 + i}`
    });
  }
  return data;
}
