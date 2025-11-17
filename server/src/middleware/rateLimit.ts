import type { NextFunction, Request, Response } from 'express';

export type RateLimiter = {
  middleware: (request: Request, response: Response, next: NextFunction) => void;
  reset: () => void;
};

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  const middleware = (request: Request, response: Response, next: NextFunction) => {
    const key = request.ip ?? request.headers['x-forwarded-for']?.toString() ?? 'global';
    const now = Date.now();
    const existing = hits.get(key);

    if (!existing || existing.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    existing.count += 1;
    if (existing.count > options.max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      return response.status(429).json({ error: 'RATE_LIMITED', retryAfter });
    }

    next();
  };

  return {
    middleware,
    reset: () => hits.clear(),
  };
}
