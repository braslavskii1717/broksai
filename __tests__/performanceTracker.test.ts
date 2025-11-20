import * as fs from 'fs';
import * as path from 'path';

interface PerformanceBaseline {
  testName: string;
  duration: number;
  timestamp: string;
}

interface PerformanceReport {
  baseline: PerformanceBaseline[];
}

const BASELINE_PATH = path.join(__dirname, '../performance-baseline.json');
const REPORT_PATH = path.join(__dirname, '../test-results/performance-report.json');

describe('Performance Tracker', () => {
  let baseline: PerformanceReport;
  let currentResults: PerformanceBaseline[] = [];
  let hasFailure = false;

  beforeAll(() => {
    // Load baseline if exists
    if (fs.existsSync(BASELINE_PATH)) {
      baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
    } else {
      baseline = { baseline: [] };
    }
  });

  afterAll(() => {
    // Ensure test-results directory exists
    const reportDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Update baseline with current results
    const updatedBaseline: PerformanceReport = { baseline: currentResults };
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(updatedBaseline, null, 2));

    // Write performance report
    const report = {
      results: currentResults.map((current) => {
        const baselineEntry = baseline.baseline.find(b => b.testName === current.testName);
        if (baselineEntry) {
          const percentChange = ((current.duration - baselineEntry.duration) / baselineEntry.duration) * 100;
          return {
            testName: current.testName,
            baselineDuration: baselineEntry.duration,
            currentDuration: current.duration,
            percentChange: percentChange.toFixed(2),
            status: percentChange > 10 ? 'REGRESSION' : 'OK'
          };
        }
        return {
          testName: current.testName,
          baselineDuration: null,
          currentDuration: current.duration,
          percentChange: 'N/A',
          status: 'NEW'
        };
      })
    };

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

    // Fail if regression detected
    if (hasFailure) {
      throw new Error('Performance regression detected (>10% slower than baseline)');
    }
  });

  const measurePerformance = (testName: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = Math.round(end - start);

    currentResults.push({
      testName,
      duration,
      timestamp: new Date().toISOString()
    });

    // Check for regression
    const baselineEntry = baseline.baseline.find(b => b.testName === testName);
    if (baselineEntry) {
      const percentChange = ((duration - baselineEntry.duration) / baselineEntry.duration) * 100;
      if (percentChange > 10) {
        hasFailure = true;
        console.error(`❌ REGRESSION: ${testName}`);
        console.error(`  Baseline: ${baselineEntry.duration}ms`);
        console.error(`  Current:  ${duration}ms`);
        console.error(`  Change:   +${percentChange.toFixed(2)}%`);
      } else {
        console.log(`✅ OK: ${testName} (${duration}ms, baseline: ${baselineEntry.duration}ms, ${percentChange.toFixed(2)}%)`);
      }
    } else {
      console.log(`📊 NEW: ${testName} (${duration}ms)`);
    }

    return duration;
  };

  test('Sample performance test 1', () => {
    measurePerformance('sampleTest1', () => {
      // Simulate work
      let sum = 0;
      for (let i = 0; i < 1000000; i++) {
        sum += i;
      }
    });
  });

  test('Sample performance test 2', () => {
    measurePerformance('sampleTest2', () => {
      // Simulate work
      const arr = Array.from({ length: 100000 }, (_, i) => i);
      arr.sort((a, b) => b - a);
    });
  });
});
