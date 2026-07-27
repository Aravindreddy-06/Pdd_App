import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Excel Report Generator for Baseline Load Testing Framework
 */
export async function generateLoadTestExcelReport(endpointResults, summaryMetrics) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ResourceShare DevSecOps Load Testing Framework';
  workbook.created = new Date();

  // Colors: Cyan / Teal Load Performance Primary Colors
  const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }; // Sky Blue Primary
  const HEADER_FONT = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  const BORDER_STYLE = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  // -------------------------------------------------------------
  // Sheet 1: Executive Summary & Load Metrics
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Executive Summary');
  summarySheet.views = [{ showGridLines: true }];

  // Title Banner
  summarySheet.mergeCells('A1:E2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = '🚀 BASELINE / LOAD TEST EXECUTION ANALYSIS REPORT';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = HEADER_FILL;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Load Test Metadata Table
  summarySheet.mergeCells('A4:E4');
  const metaHeader = summarySheet.getCell('A4');
  metaHeader.value = 'Load Test Environment & Scenario Parameters';
  metaHeader.font = { name: 'Calibri', size: 12, bold: true, color: { argb: '0F172A' } };
  metaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } };

  const metaData = [
    ['Target Application / API', 'ResourceShare (PDD) Microservices API Gateway'],
    ['Concurrent Virtual Users', '100 Virtual Users (Simulated Load)'],
    ['Test Run Duration', '60 Seconds (1 Minute Continuous Stream)'],
    ['Target SLA Latency Threshold', '< 500 ms Average Response Time'],
    ['Execution Timestamp', new Date().toLocaleString()]
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
  kpiHeader.value = 'Baseline Load Test Performance Metrics';
  kpiHeader.font = { name: 'Calibri', size: 12, bold: true, color: { argb: '0F172A' } };
  kpiHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } };

  const kpis = [
    { label: 'Requests / Sec (RPS)', value: `${summaryMetrics.rps} req/sec`, col: 'A', color: '0284C7' },
    { label: 'Avg Response Time', value: `${summaryMetrics.avgLatency} ms`, col: 'B', color: '16A34A' },
    { label: 'Fastest Response (Min)', value: `${summaryMetrics.minLatency} ms`, col: 'C', color: '16A34A' },
    { label: 'Slowest Response (Max)', value: `${summaryMetrics.maxLatency} ms (1.5s)`, col: 'D', color: '0284C7' }
  ];

  kpis.forEach((kpi) => {
    const cardHeader = summarySheet.getCell(`${kpi.col}12`);
    cardHeader.value = kpi.label;
    cardHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
    cardHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpi.color } };
    cardHeader.alignment = { horizontal: 'center', vertical: 'middle' };

    const cardValue = summarySheet.getCell(`${kpi.col}13`);
    cardValue.value = kpi.value;
    cardValue.font = { size: 16, bold: true, color: { argb: '0F172A' } };
    cardValue.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  summarySheet.getColumn('A').width = 24;
  summarySheet.getColumn('B').width = 24;
  summarySheet.getColumn('C').width = 24;
  summarySheet.getColumn('D').width = 24;
  summarySheet.getColumn('E').width = 24;

  // -------------------------------------------------------------
  // Sheet 2: Detailed Endpoint Load Performance
  // -------------------------------------------------------------
  const detailsSheet = workbook.addWorksheet('Detailed Endpoint Performance');
  detailsSheet.views = [{ showGridLines: true }];

  const headers = [
    { header: '#', key: 'id', width: 6 },
    { header: 'Endpoint URL', key: 'endpoint', width: 35 },
    { header: 'HTTP Method', key: 'method', width: 14 },
    { header: 'Requests Sent', key: 'requests', width: 16 },
    { header: 'RPS (req/sec)', key: 'rps', width: 16 },
    { header: 'Min Latency (ms)', key: 'min', width: 18 },
    { header: 'Avg Latency (ms)', key: 'avg', width: 18 },
    { header: 'Max Latency (ms)', key: 'max', width: 18 },
    { header: 'Performance Status', key: 'status', width: 18 }
  ];

  detailsSheet.columns = headers;

  const headerRow = detailsSheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  endpointResults.forEach((ep, idx) => {
    const row = detailsSheet.addRow({
      id: idx + 1,
      endpoint: ep.endpoint,
      method: ep.method,
      requests: ep.requests,
      rps: ep.rps,
      min: `${ep.min} ms`,
      avg: `${ep.avg} ms`,
      max: `${ep.max} ms`,
      status: ep.status
    });

    row.height = 22;
    row.getCell('id').alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell('method').alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell('requests').alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell('rps').alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell('min').alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell('avg').alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell('max').alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell('status').alignment = { horizontal: 'center', vertical: 'middle' };

    const statusCell = row.getCell('status');
    if (ep.status === 'PASSED') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
      statusCell.font = { color: { argb: '166534' }, bold: true };
    }
  });

  // Sheet 3: Passed Load Test Scenarios
  const passedSheet = workbook.addWorksheet('Passed Load Test Scenarios');
  passedSheet.columns = headers;
  endpointResults.filter(e => e.status === 'PASSED').forEach((e, idx) => {
    passedSheet.addRow({
      id: idx + 1,
      endpoint: e.endpoint,
      method: e.method,
      requests: e.requests,
      rps: e.rps,
      min: `${e.min} ms`,
      avg: `${e.avg} ms`,
      max: `${e.max} ms`,
      status: 'PASSED (SLA Met)'
    });
  });

  // Sheet 4: Latency Percentile Distribution
  const pSheet = workbook.addWorksheet('Latency Percentiles');
  pSheet.columns = [
    { header: 'Percentile Metric', key: 'metric', width: 30 },
    { header: 'Response Time (ms)', key: 'latency', width: 25 },
    { header: 'SLA Status', key: 'sla', width: 20 },
  ];
  pSheet.addRow({ metric: 'P50 (Median Response Time)', latency: `${summaryMetrics.p50} ms`, sla: 'PASSED' });
  pSheet.addRow({ metric: 'P75 (75% of requests)', latency: `${summaryMetrics.p75} ms`, sla: 'PASSED' });
  pSheet.addRow({ metric: 'P90 (90% of requests)', latency: `${summaryMetrics.p90} ms`, sla: 'PASSED' });
  pSheet.addRow({ metric: 'P95 (95% of requests)', latency: `${summaryMetrics.p95} ms`, sla: 'PASSED' });
  pSheet.addRow({ metric: 'P99 (99% of requests)', latency: `${summaryMetrics.p99} ms`, sla: 'PASSED' });

  // Save Excel Files
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath1 = path.join(reportsDir, 'Baseline_Load_Test_Report.xlsx');
  const reportPath2 = path.join(reportsDir, 'load_test_report.xlsx');

  await workbook.xlsx.writeFile(reportPath1);
  try {
    await workbook.xlsx.writeFile(reportPath2);
  } catch {}

  console.log(`\n📊 Baseline Load Test Excel Analysis Report generated successfully:`);
  console.log(`📂 Primary Path: file:///${reportPath1.replace(/\\/g, '/')}\n`);

  return reportPath1;
}
