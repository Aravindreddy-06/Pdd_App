const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const config = require('../config/config.cjs');
const logger = require('./logger.cjs');

class ExcelReporter {
  static async generateReports(testResults, summaryData) {
    logger.info('Generating Excel Reports with ExcelJS...');

    if (!fs.existsSync(config.paths.excelDir)) {
      fs.mkdirSync(config.paths.excelDir, { recursive: true });
    }

    const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF84CC16' } };
    const HEADER_FONT = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    const BORDER_STYLE = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };

    // 1. Automation_Test_Report.xlsx (6 Sheets)
    const mainWorkbook = new ExcelJS.Workbook();
    
    // Sheet 1: Executed Test Cases
    const sheet1 = mainWorkbook.addWorksheet('Executed Test Cases');
    sheet1.columns = [
      { header: 'Test ID', key: 'id', width: 15 },
      { header: 'Module', key: 'module', width: 22 },
      { header: 'Test Name', key: 'name', width: 35 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Execution Time (ms)', key: 'duration', width: 20 },
      { header: 'Priority', key: 'priority', width: 14 },
    ];

    // Sheet 2: Passed Tests
    const sheet2 = mainWorkbook.addWorksheet('Passed Tests');
    sheet2.columns = sheet1.columns;

    // Sheet 3: Failed Tests
    const sheet3 = mainWorkbook.addWorksheet('Failed Tests');
    sheet3.columns = [
      ...sheet1.columns,
      { header: 'Failure Reason', key: 'error', width: 45 },
      { header: 'Screenshot', key: 'screenshot', width: 25 },
    ];

    // Sheet 4: Skipped Tests
    const sheet4 = mainWorkbook.addWorksheet('Skipped Tests');
    sheet4.columns = sheet1.columns;

    // Sheet 5: Execution Metrics
    const sheet5 = mainWorkbook.addWorksheet('Execution Metrics');
    sheet5.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 25 },
    ];

    // Sheet 6: Defect Summary
    const sheet6 = mainWorkbook.addWorksheet('Defect Summary');
    sheet6.columns = [
      { header: 'Module', key: 'module', width: 25 },
      { header: 'Total Tests', key: 'total', width: 16 },
      { header: 'Passed', key: 'passed', width: 14 },
      { header: 'Failed', key: 'failed', width: 14 },
      { header: 'Pass Rate (%)', key: 'rate', width: 16 },
    ];

    // Populate data
    testResults.forEach(tc => {
      const rowData = {
        id: tc.id,
        module: tc.module,
        name: tc.name,
        status: tc.status.toUpperCase(),
        duration: tc.duration,
        priority: tc.priority,
        error: tc.error || '',
        screenshot: tc.screenshot || 'N/A'
      };

      sheet1.addRow(rowData);
      if (tc.status === 'passed') sheet2.addRow(rowData);
      if (tc.status === 'failed') sheet3.addRow(rowData);
      if (tc.status === 'skipped') sheet4.addRow(rowData);
    });

    // Populate Metrics
    sheet5.addRow({ metric: 'Total Test Cases', value: summaryData.total });
    sheet5.addRow({ metric: 'Passed Test Cases', value: summaryData.passed });
    sheet5.addRow({ metric: 'Failed Test Cases', value: summaryData.failed });
    sheet5.addRow({ metric: 'Skipped Test Cases', value: summaryData.skipped });
    sheet5.addRow({ metric: 'Pass Percentage (%)', value: `${summaryData.passRate}%` });
    sheet5.addRow({ metric: 'Execution Duration (s)', value: summaryData.duration });
    sheet5.addRow({ metric: 'Deployment URL', value: config.baseUrl });

    // Populate Module Breakdown
    Object.keys(summaryData.moduleStats || {}).forEach(mod => {
      const stat = summaryData.moduleStats[mod];
      const rate = stat.total > 0 ? ((stat.passed / stat.total) * 100).toFixed(1) : '100.0';
      sheet6.addRow({
        module: mod,
        total: stat.total,
        passed: stat.passed,
        failed: stat.failed,
        rate: `${rate}%`
      });
    });

    // Style all sheets in mainWorkbook
    mainWorkbook.eachSheet(sheet => {
      const headerRow = sheet.getRow(1);
      headerRow.height = 24;
      headerRow.eachCell(cell => {
        cell.fill = HEADER_FILL;
        cell.font = HEADER_FONT;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = BORDER_STYLE;
      });
      sheet.eachRow((row, rIdx) => {
        if (rIdx > 1) {
          row.eachCell(cell => {
            cell.border = BORDER_STYLE;
          });
        }
      });
    });

    await mainWorkbook.xlsx.writeFile(path.join(config.paths.excelDir, 'Automation_Test_Report.xlsx'));

    // 2. Passed_Test_Cases.xlsx
    const passedWb = new ExcelJS.Workbook();
    const pSheet = passedWb.addWorksheet('Passed Tests');
    pSheet.columns = sheet1.columns;
    testResults.filter(t => t.status === 'passed').forEach(t => pSheet.addRow(t));
    await passedWb.xlsx.writeFile(path.join(config.paths.excelDir, 'Passed_Test_Cases.xlsx'));

    // 3. Failed_Test_Cases.xlsx
    const failedWb = new ExcelJS.Workbook();
    const fSheet = failedWb.addWorksheet('Failed Tests');
    fSheet.columns = sheet3.columns;
    testResults.filter(t => t.status === 'failed').forEach(t => fSheet.addRow(t));
    await failedWb.xlsx.writeFile(path.join(config.paths.excelDir, 'Failed_Test_Cases.xlsx'));

    // 4. Summary_Report.xlsx
    const summaryWb = new ExcelJS.Workbook();
    const sSheet = summaryWb.addWorksheet('Summary Metrics');
    sSheet.columns = sheet5.columns;
    sSheet.rows = sheet5.rows;
    await summaryWb.xlsx.writeFile(path.join(config.paths.excelDir, 'Summary_Report.xlsx'));

    logger.info('All Excel Reports generated successfully in Test Results/Excel/');
  }
}

module.exports = ExcelReporter;
