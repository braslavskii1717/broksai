type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type Suggestion = {
  text: string;
  frequency: number;
  type: 'title' | 'address' | 'phrase';
};

export class AutocompleteCache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();

  constructor(private readonly capacity = 100) {}

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    // refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number) {
    const expiresAt = Date.now() + ttlMs;
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value;
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }
    this.cache.set(key, { value, expiresAt });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const autocompleteCache = new AutocompleteCache<{ suggestions: Suggestion[] }>(100);
