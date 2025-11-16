import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchQueryParams = z.infer<typeof searchQuerySchema>;

declare module 'express-serve-static-core' {
  interface Locals {
    searchParams: SearchQueryParams;
  }
}

export function validateSearchQuery(req: Request, res: Response, next: NextFunction) {
  const result = searchQuerySchema.safeParse(req.query);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      error: 'INVALID_QUERY',
      message: firstIssue?.message ?? 'Некорректные параметры поиска',
    });
  }

  res.locals.searchParams = result.data;
  next();
}
