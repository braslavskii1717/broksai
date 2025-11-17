import { Property } from '../models/Property';

const DEFAULT_MAX_DISTANCE = 2;

function normalize(value: string) {
  return value.normalize('NFC').toLowerCase();
}

export function levenshteinDistance(a: string, b: string, maxDistance = DEFAULT_MAX_DISTANCE) {
  const aChars = [...normalize(a)];
  const bChars = [...normalize(b)];

  if (Math.abs(aChars.length - bChars.length) > maxDistance) {
    return maxDistance + 1;
  }

  const previous = new Array(bChars.length + 1).fill(0);
  const current = new Array(bChars.length + 1).fill(0);

  for (let j = 0; j <= bChars.length; j += 1) {
    previous[j] = j;
  }

  for (let i = 1; i <= aChars.length; i += 1) {
    current[0] = i;
    let rowMin = current[0];

    for (let j = 1; j <= bChars.length; j += 1) {
      const cost = aChars[i - 1] === bChars[j - 1] ? 0 : 1;
      const deletion = previous[j] + 1;
      const insertion = current[j - 1] + 1;
      const substitution = previous[j - 1] + cost;
      const value = Math.min(deletion, insertion, substitution);
      current[j] = value;
      if (value < rowMin) {
        rowMin = value;
      }
    }

    if (rowMin > maxDistance) {
      return maxDistance + 1;
    }

    for (let j = 0; j < previous.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[bChars.length];
}

export function findSimilarTerms(query: string, terms: string[], maxDistance = DEFAULT_MAX_DISTANCE) {
  if (!query) return [];
  const normalized = normalize(query);
  const matches: Array<{ term: string; distance: number }> = [];

  for (const term of terms.slice(0, 1000)) {
    const distance = levenshteinDistance(normalized, term, maxDistance);
    if (distance <= maxDistance) {
      matches.push({ term, distance });
    }
  }

  return matches
    .sort((a, b) => a.distance - b.distance || a.term.localeCompare(b.term, 'ru'))
    .map((match) => match.term)
    .slice(0, 3);
}

export async function extractTermsFromProperties(limit = 1000) {
  const cursor = Property.find({}, { title: 1, address: 1 })
    .lean()
    .cursor();

  const frequencies = new Map<string, number>();
  for await (const doc of cursor) {
    const text = `${doc.title ?? ''} ${doc.address ?? ''}`.toLowerCase();
    const matches = text.match(/[а-яё0-9-]+/g);
    if (!matches) continue;
    for (const match of matches) {
      const count = frequencies.get(match) ?? 0;
      frequencies.set(match, count + 1);
    }
  }
  await cursor.close();

  const sorted = [...frequencies.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  return new Set(sorted.map(([term]) => term));
}

type CacheEntry = { value: string[]; expiresAt: number };

export class FuzzySearchCache {
  private readonly store = new Map<string, CacheEntry>();

  constructor(private readonly capacity = 500, private readonly ttlMs = 10 * 60 * 1000) {}

  get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: string[]) {
    if (this.store.size >= this.capacity && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) {
        this.store.delete(firstKey);
      }
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}
