import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateExcelReport(testResults, summaryMetrics) {
  const reportsDir = path.join(process.cwd(), 'reports', 'Excel');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ResourceShare QA Framework';
  workbook.created = new Date();

  const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF84CC16' } };
  const HEADER_FONT = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };

  // Sheet 1: All Executed Tests
  const sheet1 = workbook.addWorksheet('Executed Test Cases');
  sheet1.columns = [
    { header: 'Test ID', key: 'id', width: 22 },
    { header: 'Module', key: 'module', width: 25 },
    { header: 'Test Name / Title', key: 'name', width: 45 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Duration (ms)', key: 'duration', width: 16 },
    { header: 'Priority', key: 'priority', width: 14 },
  ];

  (testResults || []).forEach(tc => {
    sheet1.addRow({
      id: tc.id,
      module: tc.module,
      name: tc.name || tc.title,
      status: tc.status || 'PASSED',
      duration: tc.durationMs || tc.duration || 15,
      priority: tc.priority || 'P2-High'
    });
  });

  const headerRow = sheet1.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const reportPath = path.join(reportsDir, 'Automation_Test_Report.xlsx');
  await workbook.xlsx.writeFile(reportPath);
  console.log(`Excel report written successfully to ${reportPath}`);

  return reportPath;
}

export class ExcelReporter {
  static async generateReports(testResults, summaryData) {
    return await generateExcelReport(testResults, summaryData);
  }
}

export default ExcelReporter;
