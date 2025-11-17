import type { Request, Response, NextFunction } from 'express';
import { SearchLog } from '../models/SearchLog';

const CACHE_TTL_MS = 15 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SLOW_THRESHOLD_MS = 500;

type CachedPayload = { expiresAt: number; payload: unknown };
const analyticsCache = new Map<string, CachedPayload>();

function getCached<T>(key: string): T | null {
  const entry = analyticsCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    analyticsCache.delete(key);
    return null;
  }
  return entry.payload as T;
}

function setCache(key: string, payload: unknown) {
  analyticsCache.set(key, { payload, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearAnalyticsCache() {
  analyticsCache.clear();
}

type PopularQueriesResponse = {
  queries: Array<{
    query: string;
    count: number;
    avgResponseTime: number;
    avgResults: number;
  }>;
  period: 'last_30_days';
};

type FailedQueriesResponse = {
  queries: Array<{
    query: string;
    count: number;
    lastSeen: Date;
    fuzzyAttempted: boolean;
  }>;
  total: number;
};

type SlowQueriesResponse = {
  queries: Array<{
    query: string;
    count: number;
    avgResponseTime: number;
    lastSeen: Date;
  }>;
  period: 'last_7_days';
  thresholdMs: number;
};

type StatsResponse = {
  totalSearches: number;
  uniqueQueries: number;
  avgResponseTime: number;
  fuzzyUsageRate: number;
  zeroResultsRate: number;
  period: 'last_7_days';
};

export async function getPopularQueries(req: Request, res: Response, next: NextFunction) {
  try {
    const cacheKey = 'popularQueries';
    const cached = getCached<PopularQueriesResponse>(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const since = new Date(Date.now() - THIRTY_DAYS_MS);
    const docs = await SearchLog.aggregate<{
      _id: string;
      count: number;
      avgResponseTime: number;
      avgResults: number;
    }>([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          avgResults: { $avg: '$resultsCount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]).option({ maxTimeMS: 1000 });

    const responsePayload: PopularQueriesResponse = {
      queries: docs.map((doc) => ({
        query: doc._id,
        count: doc.count,
        avgResponseTime: Math.round(doc.avgResponseTime ?? 0),
        avgResults: Math.round(doc.avgResults ?? 0),
      })),
      period: 'last_30_days',
    };
    setCache(cacheKey, responsePayload);
    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
}

export async function getFailedQueries(req: Request, res: Response, next: NextFunction) {
  try {
    const cacheKey = 'failedQueries';
    const cached = getCached<FailedQueriesResponse>(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const since = new Date(Date.now() - SEVEN_DAYS_MS);
    const docs = await SearchLog.aggregate<{
      _id: string;
      count: number;
      lastSeen: Date;
      fuzzyAttempted: boolean;
    }>([
      { $match: { resultsCount: 0, timestamp: { $gte: since } } },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          lastSeen: { $max: '$timestamp' },
          fuzzyAttempted: { $max: '$fuzzyUsed' },
        },
      },
      { $sort: { count: -1 } },
    ]).option({ maxTimeMS: 1000 });

    const responsePayload: FailedQueriesResponse = {
      queries: docs.map((doc) => ({
        query: doc._id,
        count: doc.count,
        lastSeen: doc.lastSeen,
        fuzzyAttempted: Boolean(doc.fuzzyAttempted),
      })),
      total: docs.reduce((acc, doc) => acc + doc.count, 0),
    };
    setCache(cacheKey, responsePayload);
    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
}

export async function getSlowQueries(req: Request, res: Response, next: NextFunction) {
  try {
    const cacheKey = 'slowQueries';
    const cached = getCached<SlowQueriesResponse>(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const since = new Date(Date.now() - SEVEN_DAYS_MS);
    const docs = await SearchLog.aggregate<{
      _id: string;
      count: number;
      avgResponseTime: number;
      lastSeen: Date;
    }>([
      { $match: { responseTime: { $gt: SLOW_THRESHOLD_MS }, timestamp: { $gte: since } } },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          lastSeen: { $max: '$timestamp' },
        },
      },
      { $sort: { avgResponseTime: -1 } },
      { $limit: 20 },
    ]).option({ maxTimeMS: 1000 });

    const responsePayload: SlowQueriesResponse = {
      queries: docs.map((doc) => ({
        query: doc._id,
        count: doc.count,
        avgResponseTime: Math.round(doc.avgResponseTime ?? 0),
        lastSeen: doc.lastSeen,
      })),
      period: 'last_7_days',
      thresholdMs: SLOW_THRESHOLD_MS,
    };
    setCache(cacheKey, responsePayload);
    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
}

export async function getSearchStats(req: Request, res: Response, next: NextFunction) {
  try {
    const cacheKey = 'searchStats';
    const cached = getCached<StatsResponse>(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const since = new Date(Date.now() - SEVEN_DAYS_MS);
    const [doc] = await SearchLog.aggregate<{
      totalSearches: number;
      uniqueQueries: number;
      avgResponseTime: number;
      fuzzyUsageRate: number;
      zeroResultsRate: number;
    }>([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          uniqueQueries: { $addToSet: '$query' },
          avgResponseTime: { $avg: '$responseTime' },
          fuzzyCount: { $sum: { $cond: ['$fuzzyUsed', 1, 0] } },
          zeroResultsCount: {
            $sum: {
              $cond: [{ $eq: ['$resultsCount', 0] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalSearches: 1,
          uniqueQueries: { $size: '$uniqueQueries' },
          avgResponseTime: { $round: ['$avgResponseTime', 0] },
          fuzzyUsageRate: {
            $cond: [
              { $eq: ['$totalSearches', 0] },
              0,
              { $divide: ['$fuzzyCount', '$totalSearches'] },
            ],
          },
          zeroResultsRate: {
            $cond: [
              { $eq: ['$totalSearches', 0] },
              0,
              { $divide: ['$zeroResultsCount', '$totalSearches'] },
            ],
          },
        },
      },
    ]).option({ maxTimeMS: 1000 });

    const responsePayload: StatsResponse = {
      totalSearches: doc?.totalSearches ?? 0,
      uniqueQueries: doc?.uniqueQueries ?? 0,
      avgResponseTime: doc?.avgResponseTime ?? 0,
      fuzzyUsageRate: Number((doc?.fuzzyUsageRate ?? 0).toFixed(2)),
      zeroResultsRate: Number((doc?.zeroResultsRate ?? 0).toFixed(2)),
      period: 'last_7_days',
    };
    setCache(cacheKey, responsePayload);
    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
}
