import fs from 'fs';
import { sendPerformanceAlert } from '../../lib/alerting';

export class PerformanceTracker {
  private static results: number[] = [];

  static record(ms: number) {
    this.results.push(ms);
  }

  static saveBaseline() {
    const stats = {
      p50: this.percentile(50),
      p95: this.percentile(95),
      p99: this.percentile(99),
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync('.performance-baseline.json', JSON.stringify(stats, null, 2));
  }

  static async checkRegression(): Promise<boolean> {
    const baseline = JSON.parse(fs.readFileSync('.performance-baseline.json', 'utf-8'));
    const current = this.percentile(95);

    if (current > baseline.p95 * 1.1) {
      console.error(`⚠️ Performance regression detected: ${current}ms vs ${baseline.p95}ms baseline`);
      await sendPerformanceAlert(current, baseline.p95);
      return false;
    }
    return true;
  }

  private static percentile(p: number): number {
    const sorted = [...this.results].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * (p / 100))];
  }
}

