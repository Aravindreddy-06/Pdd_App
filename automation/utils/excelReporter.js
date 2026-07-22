import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateExcelReport(testCases, metrics) {
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const workbook = new ExcelJS.Workbook();
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.mergeCells('A1:E2');
  summarySheet.getCell('A1').value = '📱 450 APPIUM TEST CASES SUMMARY';
  summarySheet.getCell('A1').font = { bold: true, size: 14 };

  const detailsSheet = workbook.addWorksheet('All 450 Test Cases');
  detailsSheet.columns = [
    { header: 'Test Case ID', key: 'testCaseId', width: 16 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Name', key: 'testName', width: 35 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Preconditions', key: 'preconditions', width: 30 },
    { header: 'Test Steps', key: 'testSteps', width: 30 },
    { header: 'Test Data', key: 'testData', width: 25 },
    { header: 'Expected Result', key: 'expectedResult', width: 30 },
    { header: 'Actual Result', key: 'actualResult', width: 30 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Pass/Fail', key: 'passFail', width: 10 }
  ];

  testCases.forEach(tc => detailsSheet.addRow(tc));

  const filePath = path.join(reportsDir, 'automation_e2e_report.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`📊 Excel Report generated: ${filePath}`);
  return filePath;
}
