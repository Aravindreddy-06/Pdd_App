import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Excel Test Report Generator using ExcelJS
 * Outputs a formatted Excel workbook with summary & detailed test case results.
 */
export async function generateExcelReport(testResults, summaryMetrics) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Appium E2E Automation Framework';
  workbook.created = new Date();

  // -------------------------------------------------------------
  // Sheet 1: Executive Summary
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Test Execution Summary');
  summarySheet.views = [{ showGridLines: true }];

  // Title Banner
  summarySheet.mergeCells('A1:E2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = '📱 APPIUM ANDROID E2E MOBILE TEST REPORT';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } }; // Dark Blue
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Environment & Metadata Info Table
  summarySheet.mergeCells('A4:E4');
  const metaHeader = summarySheet.getCell('A4');
  metaHeader.value = 'Execution Metadata & Environment';
  metaHeader.font = { name: 'Calibri', size: 12, bold: true, color: { argb: '1E293B' } };
  metaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };

  const metaData = [
    ['Project Name', 'NeighborShare (PDD) Mobile App'],
    ['Test Framework', 'Appium v2.0 (UiAutomator2 / Android)'],
    ['Execution Date', new Date().toLocaleString()],
    ['Target Platform', summaryMetrics.platform || 'Android 13.0 (Chrome Mobile / Native)'],
    ['Total Duration', `${(summaryMetrics.totalDurationMs / 1000).toFixed(2)} seconds`]
  ];

  metaData.forEach((row, index) => {
    const rowIndex = 5 + index;
    summarySheet.getCell(`A${rowIndex}`).value = row[0];
    summarySheet.getCell(`A${rowIndex}`).font = { bold: true };
    summarySheet.mergeCells(`B${rowIndex}:E${rowIndex}`);
    summarySheet.getCell(`B${rowIndex}`).value = row[1];
  });

  // KPI Metrics Header
  summarySheet.mergeCells('A11:E11');
  const kpiHeader = summarySheet.getCell('A11');
  kpiHeader.value = 'Test Execution Summary Metrics';
  kpiHeader.font = { name: 'Calibri', size: 12, bold: true, color: { argb: '1E293B' } };
  kpiHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };

  // KPI Metric Cards
  const kpis = [
    { label: 'Total Test Cases', value: summaryMetrics.total, col: 'A', row: 13, color: '3B82F6' },
    { label: 'Passed Tests', value: summaryMetrics.passed, col: 'B', row: 13, color: '22C55E' },
    { label: 'Failed Tests', value: summaryMetrics.failed, col: 'C', row: 13, color: 'EF4444' },
    { label: 'Pass Rate (%)', value: `${summaryMetrics.passRate}%`, col: 'D', row: 13, color: summaryMetrics.passRate >= 90 ? '16A34A' : 'DC2626' }
  ];

  kpis.forEach((kpi) => {
    const cardHeader = summarySheet.getCell(`${kpi.col}12`);
    cardHeader.value = kpi.label;
    cardHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
    cardHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.color } };
    cardHeader.alignment = { horizontal: 'center', vertical: 'middle' };

    const cardValue = summarySheet.getCell(`${kpi.col}13`);
    cardValue.value = kpi.value;
    cardValue.font = { size: 18, bold: true, color: { argb: '0F172A' } };
    cardValue.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Set Column Widths for Summary Sheet
  summarySheet.getColumn('A').width = 24;
  summarySheet.getColumn('B').width = 24;
  summarySheet.getColumn('C').width = 24;
  summarySheet.getColumn('D').width = 24;
  summarySheet.getColumn('E').width = 24;

  // -------------------------------------------------------------
  // Sheet 2: Detailed Test Case Results
  // -------------------------------------------------------------
  const detailsSheet = workbook.addWorksheet('Detailed Test Results');
  detailsSheet.views = [{ showGridLines: true }];

  // Column Headers
  const headers = [
    { header: '#', key: 'id', width: 6 },
    { header: 'Module / Feature', key: 'module', width: 22 },
    { header: 'Test Case Title', key: 'title', width: 35 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Timestamp', key: 'timestamp', width: 22 },
    { header: 'Error / Failure Details', key: 'error', width: 50 }
  ];

  detailsSheet.columns = headers;

  // Header Row Formatting
  const headerRow = detailsSheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } }; // Dark Slate
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Populate Test Case Data
  testResults.forEach((test, idx) => {
    const row = detailsSheet.addRow({
      id: idx + 1,
      module: test.module,
      title: test.title,
      status: test.status,
      duration: test.duration,
      timestamp: test.timestamp,
      error: test.error || 'N/A'
    });

    row.height = 22;

    // Center Align Specific Columns
    row.getCell('id').alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell('duration').alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell('timestamp').alignment = { horizontal: 'center', vertical: 'middle' };

    // Status Cell Highlighting (Green for PASS, Red for FAIL)
    const statusCell = row.getCell('status');
    if (test.status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }; // Light Green
      statusCell.font = { color: { argb: '166534' }, bold: true };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }; // Light Red
      statusCell.font = { color: { argb: '991B1B' }, bold: true };
    }
  });

  // Ensure output reports directory exists
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, 'appium_e2e_test_report.xlsx');
  await workbook.xlsx.writeFile(reportPath);

  console.log(`\n📊 Excel Test Analysis Report successfully generated:`);
  console.log(`📂 Path: file:///${reportPath.replace(/\\/g, '/')}\n`);

  return reportPath;
}
