import type { NextFunction, Request, Response } from 'express';
import { performance } from 'node:perf_hooks';
import { Property } from '../models/Property';
import type { SearchQueryParams } from '../middleware/validateSearchQuery';

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

    const [results, total] = await Promise.all([findQuery, Property.countDocuments(filter).maxTimeMS(500)]);

    const responseTime = Math.round(performance.now() - start);

    res.json({
      results,
      total,
      metadata: {
        query: normalizedQuery,
        limit,
        offset,
        responseTime,
      },
    });
  } catch (error) {
    next(error);
  }
}
