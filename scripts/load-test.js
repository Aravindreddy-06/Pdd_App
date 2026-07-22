import http from 'http';
import https from 'https';
import { URL } from 'url';

/**
 * Baseline & Load Testing Runner
 * Configured for 100 Virtual Users running concurrently for 60 seconds (1 minute)
 */

const TARGET_URL = process.env.TEST_URL || 'https://yvzoyodkolevobhdgexe.supabase.co/rest/v1/items';
const API_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_e3F_pBjBDFLUS1Hm9tn8bA_20AK26sZ';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENCY || '100', 10);
const DURATION_SECONDS = parseInt(process.env.DURATION || '60', 10);

console.log(`=======================================================`);
console.log(`🚀 STARTING BASELINE / LOAD TEST`);
console.log(`=======================================================`);
console.log(`📍 Target URL:        ${TARGET_URL}`);
console.log(`👥 Virtual Users:     ${CONCURRENT_USERS} concurrent users`);
console.log(`⏱️ Duration:          ${DURATION_SECONDS} seconds`);
console.log(`=======================================================\n`);

const parsedUrl = new URL(TARGET_URL);
const transport = parsedUrl.protocol === 'https:' ? https : http;

let totalRequests = 0;
let totalSuccessful = 0;
let totalFailed = 0;
const statusCodes = {};
const latencies = [];

const startTime = Date.now();
const endTime = startTime + (DURATION_SECONDS * 1000);
let isRunning = true;

const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
  path: parsedUrl.pathname + parsedUrl.search,
  method: 'GET',
  headers: {
    'apikey': API_KEY,
    'Authorization': `Bearer ${API_KEY}`,
    'User-Agent': 'LoadTestWorker/1.0'
  }
};

function sendRequest(workerId) {
  if (!isRunning || Date.now() >= endTime) return;

  const reqStart = performance.now();
  
  const req = transport.request(options, (res) => {
    let body = '';
    res.on('data', () => {});
    res.on('end', () => {
      const durationMs = performance.now() - reqStart;
      totalRequests++;
      latencies.push(durationMs);

      const code = res.statusCode;
      statusCodes[code] = (statusCodes[code] || 0) + 1;

      if (code >= 200 && code < 400) {
        totalSuccessful++;
      } else {
        totalFailed++;
      }

      if (isRunning && Date.now() < endTime) {
        setImmediate(() => sendRequest(workerId));
      }
    });
  });

  req.on('error', (err) => {
    const durationMs = performance.now() - reqStart;
    totalRequests++;
    totalFailed++;
    latencies.push(durationMs);
    statusCodes['ERR'] = (statusCodes['ERR'] || 0) + 1;

    if (isRunning && Date.now() < endTime) {
      setTimeout(() => sendRequest(workerId), 50); // slight delay on connection error
    }
  });

  req.end();
}

// Progress reporting interval
const progressInterval = setInterval(() => {
  const elapsedSec = (Date.now() - startTime) / 1000;
  const currentRps = (totalRequests / Math.max(1, elapsedSec)).toFixed(1);
  process.stdout.write(`\r⏳ Testing... Elapsed: ${elapsedSec.toFixed(0)}s / ${DURATION_SECONDS}s | Completed: ${totalRequests} reqs | RPS: ${currentRps} req/sec`);
}, 1000);

// Spawn Virtual Users
for (let i = 0; i < CONCURRENT_USERS; i++) {
  sendRequest(i);
}

// Complete test after duration
setTimeout(() => {
  isRunning = false;
  clearInterval(progressInterval);
  console.log('\n\n=======================================================');
  console.log('🏁 BASELINE / LOAD TEST RESULTS SUMMARY');
  console.log('=======================================================');

  const totalTimeSec = (Date.now() - startTime) / 1000;
  const rps = (totalRequests / totalTimeSec).toFixed(2);

  if (latencies.length === 0) {
    console.log('❌ No requests completed during test period.');
    process.exit(1);
  }

  latencies.sort((a, b) => a - b);
  const minLatency = latencies[0].toFixed(2);
  const maxLatency = latencies[latencies.length - 1].toFixed(2);
  const sumLatency = latencies.reduce((acc, val) => acc + val, 0);
  const avgLatency = (sumLatency / latencies.length).toFixed(2);
  
  const p50 = latencies[Math.floor(latencies.length * 0.50)].toFixed(2);
  const p90 = latencies[Math.floor(latencies.length * 0.90)].toFixed(2);
  const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2);

  console.log(`📊 Throughput & Volume:`);
  console.log(`   - Total Duration:       ${totalTimeSec.toFixed(2)}s`);
  console.log(`   - Total Requests Sent:  ${totalRequests}`);
  console.log(`   - Requests per second:  ${rps} req/sec`);
  console.log(`   - Successful Requests:  ${totalSuccessful} (${((totalSuccessful/totalRequests)*100).toFixed(1)}%)`);
  console.log(`   - Failed Requests:      ${totalFailed} (${((totalFailed/totalRequests)*100).toFixed(1)}%)`);

  console.log(`\n⏱️ Response Time (Latency):`);
  console.log(`   - Minimum (Fastest):    ${minLatency} ms`);
  console.log(`   - Average:              ${avgLatency} ms`);
  console.log(`   - Maximum (Slowest):    ${maxLatency} ms (${(maxLatency/1000).toFixed(2)}s)`);
  console.log(`   - P50 (Median):         ${p50} ms`);
  console.log(`   - P90 (90% of requests): ${p90} ms`);
  console.log(`   - P99 (99% of requests): ${p99} ms`);

  console.log(`\n📋 Status Code Breakdown:`);
  Object.entries(statusCodes).forEach(([code, count]) => {
    console.log(`   - HTTP ${code}: ${count}`);
  });
  console.log('=======================================================\n');
}, DURATION_SECONDS * 1000);
