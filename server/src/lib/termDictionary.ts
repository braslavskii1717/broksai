import { extractTermsFromProperties, findSimilarTerms, FuzzySearchCache } from './fuzzySearch';

const DICTIONARY_LIMIT = 1000;

export class TermDictionary {
  private terms: string[] = [];
  private loading: Promise<void> | null = null;
  private readonly cache = new FuzzySearchCache(500, 10 * 60 * 1000);

  async loadDictionary(limit = DICTIONARY_LIMIT) {
    const termSet = await extractTermsFromProperties(limit);
    this.terms = [...termSet].slice(0, limit);
    this.cache.clear();
  }

  async ensureLoaded() {
    if (this.terms.length > 0) return;
    if (!this.loading) {
      this.loading = this.loadDictionary().finally(() => {
        this.loading = null;
      });
    }
    await this.loading;
  }

  findMatches(query: string) {
    if (!query) return [];
    const normalized = query.toLowerCase();
    const cached = this.cache.get(normalized);
    if (cached) {
      return cached;
    }
    const matches = findSimilarTerms(normalized, this.terms);
    this.cache.set(normalized, matches);
    return matches;
  }

  size() {
    return this.terms.length;
  }
}

export const termDictionary = new TermDictionary();
