#!/usr/bin/env node

/**
 * Performance Trends Tracker
 * Tracks performance metrics over time and detects degradation trends
 */

const fs = require('fs');
const path = require('path');

// File paths
const HISTORY_FILE = path.join(process.cwd(), 'perf-history.json');
const CURRENT_FILE = path.join(process.cwd(), 'perf-current.json');

// Load or initialize history
let history = [];
if (fs.existsSync(HISTORY_FILE)) {
  try {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch (error) {
    console.error('⚠️  Failed to parse history file, starting fresh');
    history = [];
  }
}

// Load current metrics
if (!fs.existsSync(CURRENT_FILE)) {
  console.error('❌ Current performance metrics file not found');
  process.exit(1);
}

const current = JSON.parse(fs.readFileSync(CURRENT_FILE, 'utf8'));

// Add current metrics to history
history.push({
  date: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || 'local',
  pr: process.env.GITHUB_PR_NUMBER || null,
  metrics: current
});

// Keep only last 30 entries
if (history.length > 30) {
  history = history.slice(-30);
}

// Save updated history
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
console.log('✅ Performance history updated');

// Analyze trends (last 3 entries)
if (history.length >= 3) {
  const lastThree = history.slice(-3);
  let degrading = true;

  // Check if each entry is slower than the previous
  for (let i = 1; i < lastThree.length; i++) {
    const prevTime = lastThree[i - 1].metrics.time || lastThree[i - 1].metrics.totalTime;
    const currTime = lastThree[i].metrics.time || lastThree[i].metrics.totalTime;

    if (currTime <= prevTime) {
      degrading = false;
      break;
    }
  }

  if (degrading) {
    const oldTime = lastThree[0].metrics.time || lastThree[0].metrics.totalTime;
    const newTime = current.time || current.totalTime;
    const degradationPct = ((newTime - oldTime) / oldTime * 100).toFixed(2);

    console.error('\n❌ PERFORMANCE DEGRADATION TREND DETECTED!');
    console.error(`   3 consecutive slowdowns: ${oldTime}ms → ${newTime}ms (+${degradationPct}%)`);
    console.error('   Review recent changes for performance issues\n');
    process.exit(1);
  }
}

// Check for single-commit regression (>10% slower than baseline)
if (history.length >= 2) {
  const baseline = history[0].metrics.time || history[0].metrics.totalTime;
  const currentTime = current.time || current.totalTime;
  const diffPct = ((currentTime - baseline) / baseline * 100).toFixed(2);

  console.log(`\n📊 Performance vs baseline:`);
  console.log(`   Baseline: ${baseline}ms`);
  console.log(`   Current:  ${currentTime}ms (${diffPct > 0 ? '+' : ''}${diffPct}%)`);

  if (Math.abs(diffPct) > 10) {
    console.error('\n⚠️  Performance regression >10% detected!');
    process.exit(1);
  }
}

console.log('\n✅ Performance check passed\n');
