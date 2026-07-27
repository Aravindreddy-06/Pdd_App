import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Excel Report Generator for Appium Mobile E2E Test Suite
 */
export async function generateAppiumExcelReport(testResults, summaryMetrics) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Appium Mobile Automation Framework';
  workbook.created = new Date();

  // Colors: Primary Mobile Violet / Purple Gradient Fill
  const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B21A8' } };
  const HEADER_FONT = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  const BORDER_STYLE = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  // -------------------------------------------------------------
  // Sheet 1: Executive Summary
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Executive Summary');
  summarySheet.views = [{ showGridLines: true }];

  // Title Banner
  summarySheet.mergeCells('A1:E2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = '📱 APPIUM MOBILE E2E FUNCTIONALITY TEST REPORT';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = HEADER_FILL;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Metadata Table
  summarySheet.mergeCells('A4:E4');
  const metaHeader = summarySheet.getCell('A4');
  metaHeader.value = 'Mobile Device & Execution Environment';
  metaHeader.font = { name: 'Calibri', size: 12, bold: true, color: { argb: '0F172A' } };
  metaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3E8FF' } };

  const metaData = [
    ['Application Package', 'com.neighborshare.pdd.app'],
    ['Automation Driver', 'Appium UiAutomator2 (Android / Mobile Web)'],
    ['Target Platform', summaryMetrics.deviceInfo || 'Android 14 (Pixel 8 Emulator / Physical Device)'],
    ['Execution Timestamp', new Date().toLocaleString()],
    ['Total Duration', `${(summaryMetrics.totalDurationMs / 1000).toFixed(2)} seconds`]
  ];

  metaData.forEach((row, index) => {
    const rowIndex = 5 + index;
    summarySheet.getCell(`A${rowIndex}`).value = row[0];
    summarySheet.getCell(`A${rowIndex}`).font = { bold: true };
    summarySheet.mergeCells(`B${rowIndex}:E${rowIndex}`);
    summarySheet.getCell(`B${rowIndex}`).value = row[1];
  });

  // KPI Metrics Section
  summarySheet.mergeCells('A11:E11');
  const kpiHeader = summarySheet.getCell('A11');
  kpiHeader.value = 'Appium Test Execution Summary Metrics';
  kpiHeader.font = { name: 'Calibri', size: 12, bold: true, color: { argb: '0F172A' } };
  kpiHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3E8FF' } };

  const kpis = [
    { label: 'Total Test Cases', value: summaryMetrics.total, col: 'A', color: '6B21A8' },
    { label: 'Passed Tests', value: summaryMetrics.passed, col: 'B', color: '16A34A' },
    { label: 'Failed Tests', value: summaryMetrics.failed, col: 'C', color: 'DC2626' },
    { label: 'Pass Rate (%)', value: `${summaryMetrics.passRate}%`, col: 'D', color: summaryMetrics.passRate >= 90 ? '16A34A' : 'DC2626' }
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

  summarySheet.getColumn('A').width = 24;
  summarySheet.getColumn('B').width = 24;
  summarySheet.getColumn('C').width = 24;
  summarySheet.getColumn('D').width = 24;
  summarySheet.getColumn('E').width = 24;

  // -------------------------------------------------------------
  // Sheet 2: Detailed Test Case Results (350 Rows)
  // -------------------------------------------------------------
  const detailsSheet = workbook.addWorksheet('Detailed Test Results');
  detailsSheet.views = [{ showGridLines: true }];

  const headers = [
    { header: '#', key: 'id', width: 6 },
    { header: 'Mobile Module / Feature', key: 'module', width: 28 },
    { header: 'Appium Mobile Test Title', key: 'title', width: 45 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Device / Platform', key: 'device', width: 25 },
    { header: 'Assertion / Error Log', key: 'error', width: 50 }
  ];

  detailsSheet.columns = headers;

  const headerRow = detailsSheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  testResults.forEach((test, idx) => {
    const row = detailsSheet.addRow({
      id: idx + 1,
      module: test.module,
      title: test.title,
      status: test.status,
      duration: test.duration,
      device: test.device || 'Android 14 (Pixel 8)',
      error: test.error || 'N/A (Assertion Passed)'
    });

    row.height = 22;
    row.getCell('id').alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell('duration').alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell('device').alignment = { horizontal: 'center', vertical: 'middle' };

    const statusCell = row.getCell('status');
    if (test.status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
      statusCell.font = { color: { argb: '166534' }, bold: true };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
      statusCell.font = { color: { argb: '991B1B' }, bold: true };
    }
  });

  // Sheet 3: Passed Test Cases
  const passedSheet = workbook.addWorksheet('Passed Test Cases');
  passedSheet.columns = headers;
  testResults.filter(t => t.status === 'PASS').forEach((t, idx) => {
    passedSheet.addRow({
      id: idx + 1,
      module: t.module,
      title: t.title,
      status: t.status,
      duration: t.duration,
      device: t.device || 'Android 14 (Pixel 8)',
      error: 'N/A'
    });
  });

  // Save Excel files
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath1 = path.join(reportsDir, 'Appium_Mobile_E2E_Test_Report.xlsx');
  const reportPath2 = path.join(reportsDir, 'appium_test_report.xlsx');

  await workbook.xlsx.writeFile(reportPath1);
  await workbook.xlsx.writeFile(reportPath2);

  console.log(`\n📊 Appium Mobile Excel Test Report generated successfully:`);
  console.log(`📂 Primary Path: file:///${reportPath1.replace(/\\/g, '/')}\n`);

  return reportPath1;
}
