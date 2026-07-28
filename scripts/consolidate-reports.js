import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const targetBase = path.join(rootDir, 'all-test-reports');

const subfolders = {
  selenium: [
    path.join(rootDir, 'selenium-tests', 'reports', 'selenium_e2e_test_report.xlsx'),
    path.join(rootDir, 'reports', 'consolidated', 'Selenium_Login_Test_Report.xlsx'),
  ],
  appium: [
    path.join(rootDir, 'appium-tests', 'reports', 'Appium_Mobile_E2E_Test_Report.xlsx'),
    path.join(rootDir, 'appium-tests', 'reports', 'appium_test_report.xlsx'),
  ],
  'load-tests': [
    path.join(rootDir, 'load-tests', 'reports', 'Baseline_Load_Test_Report.xlsx'),
    path.join(rootDir, 'load-tests', 'reports', 'load_test_report.xlsx'),
  ],
  vulnerability: [
    path.join(rootDir, 'vulnerability', 'reports', 'Vulnerability_Security_Test_Report.xlsx'),
    path.join(rootDir, 'vulnerability', 'reports', 'vulnerability_test_report.xlsx'),
  ]
};

console.log('📦 Consolidating Excel Test Reports into 4 individual subfolders...');

Object.entries(subfolders).forEach(([folderName, files]) => {
  const folderDir = path.join(targetBase, folderName);
  if (!fs.existsSync(folderDir)) {
    fs.mkdirSync(folderDir, { recursive: true });
  }

  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const fileName = path.basename(filePath);
      const destPath = path.join(folderDir, fileName);
      fs.copyFileSync(filePath, destPath);
      console.log(`  ✅ [${folderName}] Copied ${fileName}`);
    } else {
      console.warn(`  ⚠️ File not found: ${filePath}`);
    }
  });
});

console.log(`\n🎉 Consolidation Complete! All 4 subfolders created under: ${targetBase}`);
