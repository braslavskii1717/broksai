import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { performance } from 'node:perf_hooks';
import { createTextIndex } from '../lib/createTextIndex';
import searchRoutes from '../routes/search';
import { Property } from '../models/Property';
import { generatePropertyBatch, buildPropertySeed } from './utils/propertyFactory';

const BULK_COUNT = 1200;
const SPECIAL_COUNT = 2;
const TOTAL_PROPERTIES = BULK_COUNT + SPECIAL_COUNT;
const PANORAMA_TITLE = 'Панорамная квартира у Кремля';
const COZY_TITLE = 'Уютная студия у Патриарших';

const app = express();
app.use(express.json());
app.use('/api/search', searchRoutes);
const agent = request(app);

let mongoServer: MongoMemoryServer;

function buildSpecialProperties() {
  const now = Date.now();
  return [
    buildPropertySeed(0, {
      title: PANORAMA_TITLE,
      address: 'Москва, Новый Арбат, 10',
      description: 'панорамная квартира панорамная квартира с панорамными окнами и видом на Кремль',
      publishedAt: new Date(now + 60_000),
    }),
    buildPropertySeed(1, {
      title: COZY_TITLE,
      address: 'Москва, Малая Бронная, 20',
      description: 'уютная студия уютная студия рядом с Патриаршими прудами',
      publishedAt: new Date(now + 30_000),
    }),
  ];
}

async function seedDatabase() {
  await Property.deleteMany({});
  const bulkProperties = generatePropertyBatch(BULK_COUNT, (index) => ({ title: `Квартира ${index + 1}` }));
  const specialProperties = buildSpecialProperties();
  await Property.insertMany([...specialProperties, ...bulkProperties]);
}

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await createTextIndex();
});

test.after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test.beforeEach(async () => {
  await seedDatabase();
});

test.afterEach(async () => {
  await Property.deleteMany({});
});

test('responds under 500ms with 1000+ properties', async () => {
  const start = performance.now();
  const response = await agent.get('/api/search').query({ q: 'квартира', limit: 20, offset: 0 });
  const duration = performance.now() - start;

  assert.equal(response.status, 200);
  assert.ok(duration < 500, `Response took ${duration}ms which exceeds 500ms`);
  assert.ok(response.body.metadata.responseTime < 500, 'metadata.responseTime должен быть < 500ms');
  assert.ok(Array.isArray(response.body.results));
  assert.ok(response.body.total >= BULK_COUNT);
});

test('respects pagination with limit and offset', async () => {
  const firstPage = await agent.get('/api/search').query({ q: '', limit: 10, offset: 0 });
  const secondPage = await agent.get('/api/search').query({ q: '', limit: 10, offset: 10 });

  assert.equal(firstPage.status, 200);
  assert.equal(secondPage.status, 200);
  assert.equal(firstPage.body.results.length, 10);
  assert.equal(secondPage.body.results.length, 10);
  assert.equal(firstPage.body.total, TOTAL_PROPERTIES);
  assert.equal(secondPage.body.total, TOTAL_PROPERTIES);

  const firstIds = firstPage.body.results.map((item: { _id: string }) => item._id);
  const secondIds = secondPage.body.results.map((item: { _id: string }) => item._id);
  firstIds.forEach((id: string) => {
    assert.ok(!secondIds.includes(id), 'IDs between pages should not overlap');
  });
});

test('returns relevant results sorted by textScore', async () => {
  const response = await agent.get('/api/search').query({ q: 'панорамная квартира', limit: 5, offset: 0 });

  assert.equal(response.status, 200);
  const [first, second] = response.body.results;

  assert.ok(first, 'Expected at least one result');
  assert.equal(first.title, PANORAMA_TITLE);
  assert.ok(typeof first.score === 'number');
  assert.ok(first.score > 0.8, `textScore ${first.score} должен быть > 0.8`);
  if (second?.score) {
    assert.ok(first.score >= second.score, 'Первый результат должен иметь максимальный score');
  }
});

test('supports Russian text search queries', async () => {
  const response = await agent.get('/api/search').query({ q: 'уютная студия', limit: 5, offset: 0 });

  assert.equal(response.status, 200);
  const titles = response.body.results.map((item: { title: string }) => item.title);
  assert.ok(titles.includes(COZY_TITLE), 'Ожидаем, что среди результатов будет уютная студия');
});

test('returns all properties when query is empty', async () => {
  const response = await agent.get('/api/search').query({ q: '', limit: 25, offset: 0 });

  assert.equal(response.status, 200);
  assert.equal(response.body.results.length, 25);
  assert.equal(response.body.total, TOTAL_PROPERTIES);
  assert.equal(response.body.metadata.query, '');
});

test('handles queries without matches', async () => {
  const response = await agent.get('/api/search').query({ q: 'несуществующаяфраза' });

  assert.equal(response.status, 200);
  assert.equal(response.body.total, 0);
  assert.deepEqual(response.body.results, []);
});

test('validates query parameters', async () => {
  const response = await agent.get('/api/search').query({ q: 'квартира', limit: 0, offset: -1 });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'INVALID_QUERY');
});
