export class PerformanceTracker {
  private static readonly samples: number[] = [];
  private static readonly MAX_SAMPLES = 1000;

  static record(durationMs: number) {
    if (Number.isFinite(durationMs) && durationMs >= 0) {
      this.samples.push(durationMs);
      if (this.samples.length > this.MAX_SAMPLES) {
        this.samples.shift();
      }
    }
  }

  static latest() {
    return this.samples[this.samples.length - 1] ?? 0;
  }
}
