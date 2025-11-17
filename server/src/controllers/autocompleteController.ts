import type { NextFunction, Request, Response } from 'express';
import { performance } from 'node:perf_hooks';
import type { PipelineStage } from 'mongoose';
import { Property } from '../models/Property';
import { autocompleteCache, type Suggestion } from '../lib/autocompleteCache';
import { PerformanceTracker } from '../lib/performanceTracker';
import type { AutocompleteQueryParams } from '../middleware/validateAutocompleteQuery';

const CACHE_TTL_MS = 5 * 60 * 1000;
const KEY_PREFIX = 'autocomplete:';
const LIMIT = 10;
const TYPE_PRIORITY: Record<Suggestion['type'], number> = { title: 3, address: 2, phrase: 1 };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type TokenField = '$title' | '$address' | '$description';

function buildTokenExtractor(field: TokenField, regex: RegExp) {
  return {
    $filter: {
      input: {
        $map: {
          input: {
            $split: [
              {
                $replaceAll: {
                  input: {
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: { $toLower: { $ifNull: [field, ''] } },
                          find: '-',
                          replacement: ' ',
                        },
                      },
                      find: ',',
                      replacement: ' ',
                    },
                  },
                  find: '.',
                  replacement: ' ',
                },
              },
              ' ',
            ],
          },
          as: 'token',
          in: { $trim: { input: '$$token' } },
        },
      },
      as: 'token',
      cond: {
        $and: [
          { $ne: ['$$token', ''] },
          { $regexMatch: { input: '$$token', regex } },
        ],
      },
    },
  } as const;
}

async function aggregateField(field: 'title' | 'address', regex: RegExp): Promise<Suggestion[]> {
  const pipeline: PipelineStage[] = [
    { $match: { [field]: { $regex: regex } } },
    {
      $group: {
        _id: { $toLower: `$${field}` },
        text: { $first: `$${field}` },
        frequency: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        text: '$text',
        frequency: 1,
        type: { $literal: field },
      },
    },
    { $sort: { frequency: -1 } },
    { $limit: LIMIT },
  ];

  return Property.aggregate<Suggestion>(pipeline).option({ maxTimeMS: 100 });
}

async function aggregatePhrases(regex: RegExp): Promise<Suggestion[]> {
  const pipeline: PipelineStage[] = [
    {
      $project: {
        tokens: {
          $concatArrays: [
            buildTokenExtractor('$title', regex),
            buildTokenExtractor('$address', regex),
            buildTokenExtractor('$description', regex),
          ],
        },
      },
    },
    { $unwind: '$tokens' },
    {
      $group: {
        _id: '$tokens',
        text: { $first: '$tokens' },
        frequency: { $sum: 1 },
      },
    },
    { $sort: { frequency: -1 } },
    { $limit: LIMIT },
    {
      $project: {
        _id: 0,
        text: '$text',
        frequency: 1,
        type: { $literal: 'phrase' },
      },
    },
  ];

  return Property.aggregate<Suggestion>(pipeline).option({ maxTimeMS: 100 });
}

function mergeSuggestions(lists: Suggestion[][]): Suggestion[] {
  const merged = new Map<string, Suggestion>();

  for (const suggestion of lists.flat()) {
    const key = suggestion.text.toLowerCase();
    const existing = merged.get(key);
    if (existing) {
      existing.frequency += suggestion.frequency;
      if (TYPE_PRIORITY[suggestion.type] > TYPE_PRIORITY[existing.type]) {
        existing.type = suggestion.type;
      }
    } else {
      merged.set(key, { ...suggestion });
    }
  }

  return [...merged.values()].sort((a, b) => b.frequency - a.frequency).slice(0, LIMIT);
}

async function loadSuggestions(prefix: string) {
  const escaped = escapeRegExp(prefix);
  const regex = new RegExp(`^${escaped}`, 'i');
  const lowerRegex = new RegExp(`^${escaped}`);

  const [titleMatches, addressMatches, phraseMatches] = await Promise.all([
    aggregateField('title', regex),
    aggregateField('address', regex),
    aggregatePhrases(lowerRegex),
  ]);

  return mergeSuggestions([titleMatches, addressMatches, phraseMatches]);
}

export async function autocompleteSearch(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  try {
    const { q } = res.locals.autocompleteParams as AutocompleteQueryParams;
    const cacheKey = `${KEY_PREFIX}${q}`;

    const cached = autocompleteCache.get(cacheKey);
    if (cached) {
      const responseTime = Math.round(performance.now() - start);
      PerformanceTracker.record(responseTime);
      return res.json({
        suggestions: cached.suggestions,
        metadata: {
          query: q,
          count: cached.suggestions.length,
          responseTime,
          cached: true,
        },
      });
    }

    const suggestions = await loadSuggestions(q);
    autocompleteCache.set(cacheKey, { suggestions }, CACHE_TTL_MS);

    const responseTime = Math.round(performance.now() - start);
    PerformanceTracker.record(responseTime);
    if (responseTime > 100) {
      console.warn(`[autocomplete] Slow response ${responseTime}ms for prefix "${q}"`);
    }

    res.json({
      suggestions,
      metadata: {
        query: q,
        count: suggestions.length,
        responseTime,
        cached: false,
      },
    });
  } catch (error) {
    next(error);
  }
}
