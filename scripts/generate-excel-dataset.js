import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateLargeExcelDataset() {
  console.log('Generating large dataset with thousands of records...');
  const startTime = Date.now();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ResourceShare Platform';
  workbook.lastModifiedBy = 'Principal Engineer';
  workbook.created = new Date();

  // Color & Border Styles
  const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF84CC16' } }; // Lime Primary
  const HEADER_FONT = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  const BORDER_STYLE = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  // Pre-defined Arrays for realistic combinatorial generation
  const FIRST_NAMES = [
    'Alex', 'Mike', 'Sarah', 'Dan', 'Emma', 'Lisa', 'Chris', 'Tom', 'Rahul', 'Priya',
    'Ananya', 'Vikram', 'Neha', 'Rohan', 'Sneha', 'Arjun', 'Kavya', 'Aditya', 'Pooja', 'Siddharth',
    'David', 'Emily', 'James', 'Jessica', 'Daniel', 'Sophia', 'Matthew', 'Olivia', 'Andrew', 'Ava'
  ];

  const LAST_NAMES = [
    'Taylor', 'Jenkins', 'Carter', 'Rivera', 'Watson', 'Kudrow', 'Hemsworth', 'Holland', 'Sharma', 'Patel',
    'Verma', 'Gupta', 'Reddy', 'Rao', 'Nair', 'Mehta', 'Joshi', 'Singh', 'Kumar', 'Kapoor',
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
  ];

  const CATEGORIES = [
    'Electronics', 'Tools', 'Outdoors', 'Kitchen', 'Furniture', 'Party & Events',
    'Sports & Fitness', 'Gardening & Lawn', 'Photography', 'Gaming & Consoles', 'Books & Learning', 'Baby & Kids'
  ];

  const NEIGHBORHOODS = [
    'Oakwood Apartments', 'Sunrise Heights', 'Green Valley Residency', 'Maple Wood Lane',
    'Rosewood Gardens', 'Highland Meadows', 'Lakeside Enclave', 'Pine Street Villas',
    'Downtown Event Hub', 'Silver Oak Estates', 'Palm Grove Society', 'Royal Palms Colony'
  ];

  const ITEM_TEMPLATES = [
    { prefix: 'DeWalt 20V Max', suffix: 'Cordless Power Drill Set', cat: 'Tools', basePrice: 15, dep: 1000 },
    { prefix: 'Sony WH-1000XM4', suffix: 'Noise Cancelling Headphones', cat: 'Electronics', basePrice: 20, dep: 1500 },
    { prefix: 'Apple MacBook Pro 14"', suffix: 'M1 Pro (16GB RAM)', cat: 'Electronics', basePrice: 80, dep: 5000 },
    { prefix: 'Xiaomi 4K Laser', suffix: 'Ultra Short Throw Projector', cat: 'Electronics', basePrice: 45, dep: 3000 },
    { prefix: 'Gorilla 16ft', suffix: 'Aluminum Extension Ladder', cat: 'Tools', basePrice: 18, dep: 1200 },
    { prefix: 'Craftsman 150-Piece', suffix: 'Mechanic Tool Box Set', cat: 'Tools', basePrice: 12, dep: 800 },
    { prefix: 'Kärcher 1800 PSI', suffix: 'High Pressure Washer Wand', cat: 'Tools', basePrice: 25, dep: 1500 },
    { prefix: 'Coleman 4-Person', suffix: 'Waterproof Camping Tent', cat: 'Outdoors', basePrice: 30, dep: 2000 },
    { prefix: 'Kawasaki Z800', suffix: 'Streetfighter Superbike', cat: 'Outdoors', basePrice: 60, dep: 10000 },
    { prefix: 'Ninja Air Fryer Max XL', suffix: '5.5 Qt Digital Air Fryer', cat: 'Kitchen', basePrice: 10, dep: 800 },
    { prefix: 'DeLonghi Dedica', suffix: 'Italian Espresso Coffee Machine', cat: 'Kitchen', basePrice: 20, dep: 1500 },
    { prefix: 'Mid-Century Velvet', suffix: 'Accent Armchair', cat: 'Furniture', basePrice: 20, dep: 1500 },
    { prefix: 'JBL PartyBox 310', suffix: '240W Bluetooth Speaker', cat: 'Party & Events', basePrice: 35, dep: 3000 },
    { prefix: 'Sony Alpha A7 III', suffix: 'Full-Frame Mirrorless Camera', cat: 'Photography', basePrice: 70, dep: 5000 },
    { prefix: 'DJI Mini 3 Pro', suffix: 'Foldable 4K Drone Kit', cat: 'Photography', basePrice: 50, dep: 4000 },
    { prefix: 'Greenworks 40V', suffix: 'Cordless Lawn Mower', cat: 'Gardening & Lawn', basePrice: 22, dep: 1800 },
    { prefix: 'Handcrafted Oak', suffix: '6-Seater Dining Table', cat: 'Furniture', basePrice: 25, dep: 2500 },
    { prefix: 'Inflatable SUP 10.6ft', suffix: 'Stand Up Paddleboard Kit', cat: 'Outdoors', basePrice: 25, dep: 2000 },
    { prefix: 'PlayStation 5 Console', suffix: 'DualSense Wireless Controller', cat: 'Gaming & Consoles', basePrice: 30, dep: 3500 },
    { prefix: 'Decathlon Foldable', suffix: 'Treadmill & Walking Pad', cat: 'Sports & Fitness', basePrice: 28, dep: 2500 },
  ];

  // Helper for random selection
  const randArr = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // =========================================================================
  // SHEET 1: MARKETPLACE ITEMS (2,500 RECORDS)
  // =========================================================================
  console.log('Generating Sheet 1: Marketplace Items (2,500 rows)...');
  const sheetItems = workbook.addWorksheet('Marketplace Items');
  sheetItems.columns = [
    { header: 'Item ID', key: 'id', width: 10 },
    { header: 'Item Title', key: 'title', width: 40 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Daily Rate (INR)', key: 'price', width: 18 },
    { header: 'Security Deposit (INR)', key: 'deposit', width: 22 },
    { header: 'Rating', key: 'rating', width: 10 },
    { header: 'Reviews', key: 'reviews', width: 12 },
    { header: 'Distance (KM)', key: 'distance', width: 14 },
    { header: 'Owner Name', key: 'owner', width: 22 },
    { header: 'Neighborhood Address', key: 'location', width: 32 },
    { header: 'Status', key: 'status', width: 14 },
  ];

  for (let i = 1; i <= 2500; i++) {
    const tmpl = ITEM_TEMPLATES[(i - 1) % ITEM_TEMPLATES.length];
    const ownerName = `${randArr(FIRST_NAMES)} ${randArr(LAST_NAMES)}`;
    const location = `${randArr(NEIGHBORHOODS)}, Blk ${randInt(1, 12)}`;

    sheetItems.addRow({
      id: i,
      title: `${tmpl.prefix} ${tmpl.suffix} #${i}`,
      category: tmpl.cat,
      price: tmpl.basePrice + randInt(0, 15),
      deposit: tmpl.dep,
      rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
      reviews: randInt(5, 120),
      distance: `${(0.2 + (Math.random() * 4.8)).toFixed(1)} km`,
      owner: ownerName,
      location: location,
      status: i % 6 === 0 ? 'Rented' : i % 19 === 0 ? 'Maintenance' : 'Available',
    });
  }

  // =========================================================================
  // SHEET 2: RENTAL ORDERS (5,000 TRANSACTIONS)
  // =========================================================================
  console.log('Generating Sheet 2: Rental Orders (5,000 rows)...');
  const sheetOrders = workbook.addWorksheet('Rental Orders');
  sheetOrders.columns = [
    { header: 'Order ID', key: 'id', width: 16 },
    { header: 'Stripe Intent ID', key: 'intent_id', width: 30 },
    { header: 'Customer Name', key: 'customer', width: 22 },
    { header: 'Rented Item', key: 'item', width: 36 },
    { header: 'Duration (Days)', key: 'days', width: 16 },
    { header: 'Total Amount (INR)', key: 'amount', width: 20 },
    { header: 'Payment Method', key: 'method', width: 18 },
    { header: 'Provider / VPA', key: 'provider', width: 28 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Date', key: 'date', width: 16 },
  ];

  const METHODS = ['UPI', 'Card', 'NetBanking', 'Cash on Pickup'];
  const UPI_DOMAINS = ['@okaxis', '@ybl', '@paytm', '@apl', '@okicici', '@okhdfcbank'];
  const CARDS = ['Visa •••• ', 'Mastercard •••• ', 'RuPay •••• ', 'Amex •••• '];

  for (let i = 1001; i <= 6000; i++) {
    const method = randArr(METHODS);
    let provider = 'Cash Direct';
    const customer = `${randArr(FIRST_NAMES)} ${randArr(LAST_NAMES)}`;
    const tmpl = ITEM_TEMPLATES[i % ITEM_TEMPLATES.length];

    if (method === 'UPI') provider = `${customer.toLowerCase().replace(' ', '')}${randArr(UPI_DOMAINS)}`;
    if (method === 'Card') provider = `${randArr(CARDS)}${randInt(1000, 9999)}`;
    if (method === 'NetBanking') provider = randArr(['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank']);

    const days = randInt(1, 7);
    const amount = (tmpl.basePrice * days) + 15;

    // Dates across past 180 days
    const dateObj = new Date(Date.now() - (randInt(1, 180) * 86400000));

    sheetOrders.addRow({
      id: `ORD-2026-${i}`,
      intent_id: `pi_3Mtw${i}LkdIwHu${randInt(10, 99)}xZ`,
      customer: customer,
      item: tmpl.prefix + ' ' + tmpl.suffix,
      days: days,
      amount: amount,
      method: method,
      provider: provider,
      status: i % 17 === 0 ? 'failed' : i % 23 === 0 ? 'refunded' : 'succeeded',
      date: dateObj.toISOString().split('T')[0],
    });
  }

  // =========================================================================
  // SHEET 3: NEIGHBOR PROFILES (1,000 PROFILES)
  // =========================================================================
  console.log('Generating Sheet 3: Neighbor Profiles (1,000 rows)...');
  const sheetUsers = workbook.addWorksheet('Neighbor Profiles');
  sheetUsers.columns = [
    { header: 'User ID', key: 'id', width: 14 },
    { header: 'Full Name', key: 'name', width: 22 },
    { header: 'Email Address', key: 'email', width: 32 },
    { header: 'Phone Number', key: 'phone', width: 18 },
    { header: 'Neighborhood Address', key: 'location', width: 34 },
    { header: 'Trust Rating', key: 'rating', width: 14 },
    { header: 'Shared Count', key: 'shared', width: 14 },
    { header: 'Borrowed Count', key: 'borrowed', width: 16 },
    { header: 'Identity Verified', key: 'verified', width: 18 },
  ];

  for (let i = 1; i <= 1000; i++) {
    const fn = randArr(FIRST_NAMES);
    const ln = randArr(LAST_NAMES);
    const fullName = `${fn} ${ln}`;
    sheetUsers.addRow({
      id: `USR-2026-${1000 + i}`,
      name: fullName,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@resourceshare.app`,
      phone: `+91 ${randInt(90000, 99999)} ${randInt(10000, 99999)}`,
      location: `${randArr(NEIGHBORHOODS)}, Blk ${randInt(1, 15)}`,
      rating: parseFloat((4.3 + Math.random() * 0.7).toFixed(1)),
      shared: randInt(1, 25),
      borrowed: randInt(0, 18),
      verified: i % 10 === 0 ? 'PENDING ⏳' : 'VERIFIED ✓',
    });
  }

  // =========================================================================
  // SHEET 4: SAVED PAYMENT METHODS (1,500 METHODS)
  // =========================================================================
  console.log('Generating Sheet 4: Saved Payment Methods (1,500 rows)...');
  const sheetPM = workbook.addWorksheet('Saved Payment Methods');
  sheetPM.columns = [
    { header: 'Method ID', key: 'id', width: 14 },
    { header: 'User ID', key: 'user_id', width: 16 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Card Brand / Network', key: 'brand', width: 22 },
    { header: 'Last 4 Digits / UPI ID', key: 'identifier', width: 28 },
    { header: 'Expiry (MM/YY)', key: 'expiry', width: 16 },
    { header: 'Default Payment', key: 'is_default', width: 16 },
  ];

  for (let i = 1; i <= 1500; i++) {
    const isCard = i % 2 === 0;
    sheetPM.addRow({
      id: `PM-${5000 + i}`,
      user_id: `USR-2026-${1000 + randInt(1, 1000)}`,
      type: isCard ? 'card' : 'upi',
      brand: isCard ? randArr(['Visa', 'Mastercard', 'RuPay', 'American Express']) : 'UPI App',
      identifier: isCard ? `•••• •••• •••• ${randInt(1000, 9999)}` : `${randArr(FIRST_NAMES).toLowerCase()}${randArr(UPI_DOMAINS)}`,
      expiry: isCard ? `${randInt(1, 12).toString().padStart(2, '0')}/2${randInt(7, 9)}` : 'N/A',
      is_default: i % 4 === 0 ? 'YES' : 'NO',
    });
  }

  // Apply Uniform Styling
  console.log('Applying cell styling across all sheets...');
  workbook.eachSheet((sheet) => {
    const headerRow = sheet.getRow(1);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = BORDER_STYLE;
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.height = 20;
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.border = BORDER_STYLE;
        });
      }
    });
  });

  const outputPath = path.join(__dirname, '../public/resourceshare_large_dataset.xlsx');
  console.log('Saving Excel file to disk...');
  await workbook.xlsx.writeFile(outputPath);
  
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`\n🎉 Excel Large Dataset successfully generated in ${elapsedSec}s!`);
  console.log(`📁 File Path: ${outputPath}`);
  console.log(`📦 File Size: ${sizeMB} MB`);
  console.log(`📊 Total Records Generated: 10,000 Rows across 4 Sheets`);
}

generateLargeExcelDataset().catch(console.error);
