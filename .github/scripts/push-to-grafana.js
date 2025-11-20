#!/usr/bin/env node

/**
 * Grafana Cloud Performance Metrics Pusher
 * CommonJS-compatible, safe fallback if secrets missing
 */

const fs = require('fs');
const https = require('https');

const { GRAFANA_PUSH_URL, GRAFANA_API_KEY, GITHUB_REF = 'unknown' } = process.env;

// Safe exit if Grafana not configured or no data
if (!GRAFANA_PUSH_URL || !GRAFANA_API_KEY || !fs.existsSync('perf-history.json')) {
  console.log('⚠️  Grafana disabled or no performance data; skipping metrics push');
  process.exit(0);
}

const history = JSON.parse(fs.readFileSync('perf-history.json', 'utf8'));

if (!history.length) {
  console.log('⚠️  Empty performance history; skipping');
  process.exit(0);
}

// Calculate metrics
const latest = history[history.length - 1].metrics.time ?? history[history.length - 1].metrics.totalTime ?? 0;
const last30 = history.slice(-30).map(x => x.metrics.time ?? x.metrics.totalTime ?? 0);
const avg = last30.reduce((s, v) => s + v, 0) / last30.length;
const sorted = [...last30].sort((a, b) => a - b);
const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
const base = history[0].metrics.time ?? history[0].metrics.totalTime ?? 1;
const reg = ((latest - base) / base * 100).toFixed(2);

// Prometheus metrics format
const metrics = `ci_performance_avg_time{repo="broksai",branch="${GITHUB_REF}"} ${avg}
ci_performance_p95{repo="broksai",branch="${GITHUB_REF}"} ${p95}
ci_performance_regression{repo="broksai",branch="${GITHUB_REF}"} ${reg}
ci_performance_current{repo="broksai",branch="${GITHUB_REF}"} ${latest}
`;

// Parse Grafana URL
const { hostname, pathname } = new URL(GRAFANA_PUSH_URL);

// Push to Grafana Cloud
const req = https.request({
  hostname,
  path: pathname,
  method: 'POST',
  headers: {
    Authorization: `Bearer ${GRAFANA_API_KEY}`,
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(metrics)
  }
}, (res) => {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    console.log(`✅ Grafana push successful: HTTP ${res.statusCode}`);
    console.log(`   📊 Avg: ${avg.toFixed(0)}ms | P95: ${p95.toFixed(0)}ms | Regression: ${reg}%`);
  } else {
    console.error(`⚠️  Grafana push returned: HTTP ${res.statusCode}`);
  }
});

req.on('error', (error) => {
  console.error('⚠️  Grafana push failed:', error.message);
  // Don't fail CI on Grafana errors
});

req.write(metrics);
req.end();
