import type { NextFunction, Request, Response } from 'express';
import { performance } from 'node:perf_hooks';
import { Property } from '../models/Property';
import type { SearchQueryParams } from '../middleware/validateSearchQuery';
import { termDictionary } from '../lib/termDictionary';
import { PerformanceTracker } from '../lib/performanceTracker';
import { searchLogger } from '../lib/searchLogger';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';

export async function searchProperties(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  try {
    const { q, limit, offset } = res.locals.searchParams as SearchQueryParams;
    const normalizedQuery = q.trim();
    const hasQuery = normalizedQuery.length > 0;

    const filter = hasQuery
      ? ({ $text: { $search: normalizedQuery, $language: 'russian' } } as Record<string, unknown>)
      : {};

    const findQuery = Property.find(filter, hasQuery ? { score: { $meta: 'textScore' } } : undefined)
      .skip(offset)
      .limit(limit)
      .maxTimeMS(500)
      .lean();

    if (hasQuery) {
      findQuery.sort({ score: { $meta: 'textScore' } as any });
    } else {
      findQuery.sort({ publishedAt: -1 });
    }

    let [results, total] = await Promise.all([findQuery, Property.countDocuments(filter).maxTimeMS(500)]);

    let fuzzyUsed = false;
    let correctedQuery: string | null = null;
    let didYouMean: string[] = [];

    if (hasQuery && results.length === 0) {
      await termDictionary.ensureLoaded();
      const similar = termDictionary.findMatches(normalizedQuery);
      if (similar.length > 0) {
        fuzzyUsed = true;
        didYouMean = similar;
        correctedQuery = similar[0];
        const fuzzyFilter = {
          $text: { $search: correctedQuery, $language: 'russian' },
        } as Record<string, unknown>;
        const fuzzyFind = Property.find(fuzzyFilter, { score: { $meta: 'textScore' } })
          .skip(offset)
          .limit(limit)
          .maxTimeMS(500)
          .sort({ score: { $meta: 'textScore' } as any })
          .lean();

        [results, total] = await Promise.all([
          fuzzyFind,
          Property.countDocuments(fuzzyFilter).maxTimeMS(500),
        ]);

        console.info(
          `[search] fuzzy fallback used for query="${normalizedQuery}" suggestions=${didYouMean.join(', ')}`,
        );
      }
    }

    const responseTime = Math.round(performance.now() - start);
    PerformanceTracker.record(responseTime);

    const metadata = {
      query: normalizedQuery,
      limit,
      offset,
      correctedQuery,
      fuzzyUsed,
      didYouMean,
      responseTime,
    };

    searchLogger.log({
      query: normalizedQuery || '(empty)',
      resultsCount: total,
      responseTime,
      fuzzyUsed,
      correctedQuery,
      userId: (req as AuthenticatedRequest).authUserId,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.json({
      results,
      total,
      metadata,
    });
  } catch (error) {
    next(error);
  }
}
