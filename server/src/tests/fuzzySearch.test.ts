import test from 'node:test';
import assert from 'node:assert/strict';
import { FuzzySearchCache, findSimilarTerms, levenshteinDistance } from '../lib/fuzzySearch';

test('levenshteinDistance handles identical strings', () => {
  assert.equal(levenshteinDistance('квартира', 'квартира'), 0);
});

test('levenshteinDistance detects one substitution regardless of case', () => {
  assert.equal(levenshteinDistance('Мосва', 'Москва'), 1);
});

test('levenshteinDistance exits when distance exceeds threshold', () => {
  assert.equal(levenshteinDistance('дом', 'квартира', 2), 3);
});

test('findSimilarTerms returns sorted matches within max distance', () => {
  const terms = ['квартира', 'комната', 'дом'];
  const matches = findSimilarTerms('квартира', terms, 2);
  assert.deepEqual(matches, ['квартира']);

  const typoMatches = findSimilarTerms('квортира', terms, 2);
  assert.deepEqual(typoMatches, ['квартира']);
});

test('FuzzySearchCache stores and expires values respecting ttl', async () => {
  const cache = new FuzzySearchCache(2, 50);
  cache.set('typo', ['квартира']);
  assert.deepEqual(cache.get('typo'), ['квартира']);

  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(cache.get('typo'), null);

  cache.set('a', ['1']);
  cache.set('b', ['2']);
  cache.set('c', ['3']);
  assert.equal(cache.size(), 2);
});
