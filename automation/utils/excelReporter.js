import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateExcelReport(testCases, metrics) {
  const excelDir = path.join(__dirname, '..', 'reports', 'Excel');
  if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });

  const passedTests = testCases.filter(t => t.status === 'PASSED');
  const failedTests = testCases.filter(t => t.status === 'FAILED');
  const skippedTests = testCases.filter(t => t.status === 'SKIPPED');
  const blockedTests = testCases.filter(t => t.status === 'BLOCKED');

  // 1. Automation_Test_Report.xlsx (7 Sheets)
  const masterWb = new ExcelJS.Workbook();

  // Sheet 1: Executed Test Cases
  const s1 = masterWb.addWorksheet('Executed Test Cases');
  s1.columns = [
    { header: 'Test ID', key: 'testCaseId', width: 15 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Name', key: 'testName', width: 35 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Execution Time (ms)', key: 'duration', width: 20 }
  ];
  testCases.forEach(tc => s1.addRow({ ...tc, duration: tc.duration || 5 }));

  // Sheet 2: Passed Tests
  const s2 = masterWb.addWorksheet('Passed Tests');
  s2.columns = s1.columns;
  passedTests.forEach(tc => s2.addRow({ ...tc, duration: tc.duration || 5 }));

  // Sheet 3: Failed Tests
  const s3 = masterWb.addWorksheet('Failed Tests');
  s3.columns = s1.columns;
  failedTests.forEach(tc => s3.addRow({ ...tc, duration: tc.duration || 5 }));

  // Sheet 4: Skipped Tests
  const s4 = masterWb.addWorksheet('Skipped Tests');
  s4.columns = s1.columns;
  skippedTests.forEach(tc => s4.addRow({ ...tc, duration: tc.duration || 5 }));

  // Sheet 5: Execution Metrics
  const s5 = masterWb.addWorksheet('Execution Metrics');
  s5.columns = [{ header: 'Metric', key: 'metric', width: 25 }, { header: 'Value', key: 'val', width: 20 }];
  s5.addRow({ metric: 'Total Executed', val: metrics.total });
  s5.addRow({ metric: 'Passed', val: metrics.passed });
  s5.addRow({ metric: 'Failed', val: metrics.failed });
  s5.addRow({ metric: 'Skipped', val: metrics.skipped });
  s5.addRow({ metric: 'Blocked', val: metrics.blocked });
  s5.addRow({ metric: 'Pass Percentage', val: `${metrics.passRate}%` });

  // Sheet 6: Defect Summary
  const s6 = masterWb.addWorksheet('Defect Summary');
  s6.columns = [{ header: 'Test ID', key: 'testCaseId', width: 15 }, { header: 'Failure Reason', key: 'reason', width: 50 }];
  failedTests.concat(blockedTests).forEach(tc => s6.addRow({ testCaseId: tc.testCaseId, reason: tc.actualResult }));

  // Sheet 7: Pass Rate Summary
  const s7 = masterWb.addWorksheet('Pass Rate Summary');
  s7.columns = [{ header: 'Target Threshold', key: 'target', width: 20 }, { header: 'Actual Rate', key: 'actual', width: 20 }, { header: 'Quality Gate', key: 'gate', width: 15 }];
  s7.addRow({ target: '>= 95%', actual: `${metrics.passRate}%`, gate: metrics.passRate >= 95 ? 'PASSED' : 'FAILED' });

  await masterWb.xlsx.writeFile(path.join(excelDir, 'Automation_Test_Report.xlsx'));

  // 2. Passed_Test_Cases.xlsx
  const passedWb = new ExcelJS.Workbook();
  const ps = passedWb.addWorksheet('Passed Test Cases');
  ps.columns = s1.columns;
  passedTests.forEach(tc => ps.addRow({ ...tc, duration: tc.duration || 5 }));
  await passedWb.xlsx.writeFile(path.join(excelDir, 'Passed_Test_Cases.xlsx'));

  // 3. Failed_Test_Cases.xlsx
  const failedWb = new ExcelJS.Workbook();
  const fsWb = failedWb.addWorksheet('Failed Test Cases');
  fsWb.columns = s1.columns;
  failedTests.concat(blockedTests).forEach(tc => fsWb.addRow({ ...tc, duration: tc.duration || 5 }));
  await failedWb.xlsx.writeFile(path.join(excelDir, 'Failed_Test_Cases.xlsx'));

  // 4. Execution_Summary.xlsx
  const sumWb = new ExcelJS.Workbook();
  const ss = sumWb.addWorksheet('Execution Summary');
  ss.columns = s5.columns;
  s5.eachRow(row => ss.addRow(row.values));
  await sumWb.xlsx.writeFile(path.join(excelDir, 'Execution_Summary.xlsx'));

  console.log(`📊 4 Excel Workbooks generated in: ${excelDir}`);
}
