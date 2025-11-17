import { SearchLog } from '../models/SearchLog';

export type SearchLogPayload = {
  query: string;
  timestamp?: Date;
  userId?: string;
  resultsCount: number;
  responseTime: number;
  fuzzyUsed: boolean;
  correctedQuery?: string | null;
  ip?: string;
  userAgent?: string;
};

export class SearchLogger {
  private buffer: SearchLogPayload[] = [];
  private flushing = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly flushIntervalMs = 5000, private readonly batchSize = 100) {}

  log(payload: SearchLogPayload) {
    const entry = { ...payload, timestamp: payload.timestamp ?? new Date() };
    this.buffer.push(entry);
    if (this.buffer.length >= this.batchSize) {
      void this.flush();
    }
  }

  start() {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => {
      void this.flush();
    }, this.flushIntervalMs);
    this.timer.unref?.();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async flush() {
    if (this.flushing || this.buffer.length === 0) {
      return;
    }
    this.flushing = true;
    const batch = this.buffer;
    this.buffer = [];
    try {
      await SearchLog.insertMany(batch, { ordered: false });
    } catch (error) {
      console.error('[SearchLogger] Failed to flush search logs', error);
      this.buffer = [...batch, ...this.buffer];
    } finally {
      this.flushing = false;
    }
  }

  clear() {
    this.buffer = [];
  }

  pending() {
    return this.buffer.length;
  }
}

export const searchLogger = new SearchLogger();
