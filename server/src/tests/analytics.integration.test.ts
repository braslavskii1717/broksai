import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { performance } from 'node:perf_hooks';
import searchRoutes from '../routes/search';
import analyticsRoutes, { resetAnalyticsRateLimiter } from '../routes/analytics';
import { Property } from '../models/Property';
import { SearchLog } from '../models/SearchLog';
import { createTextIndex } from '../lib/createTextIndex';
import { searchLogger } from '../lib/searchLogger';
import { clearAnalyticsCache } from '../controllers/analyticsController';
import { buildPropertySeed } from './utils/propertyFactory';
import { User } from '../models/User';
import { signAuthToken } from '../services/authService';

const app = express();
app.use(express.json());
app.use('/api/search', searchRoutes);
app.use('/api/analytics/search', analyticsRoutes);
const agent = request(app);

let mongoServer: MongoMemoryServer;
let adminToken: string;

async function createAdmin() {
  await User.deleteMany({});
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    passwordHash: 'hashed',
  });
  adminToken = signAuthToken(admin._id.toString());
}

function authHeader() {
  return { Authorization: `Bearer ${adminToken}` };
}

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await createTextIndex();
  await createAdmin();
});

test.after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test.beforeEach(async () => {
  await SearchLog.deleteMany({});
  await Property.deleteMany({});
  clearAnalyticsCache();
  resetAnalyticsRateLimiter();
  searchLogger.clear();
});

test('logs search queries asynchronously', async () => {
  await Property.insertMany([buildPropertySeed(0, { title: 'Панорамная квартира' })]);

  const response = await agent.get('/api/search').query({ q: 'панорамная' });
  assert.equal(response.status, 200);

  await searchLogger.flush();
  const logs = await SearchLog.find({});
  assert.equal(logs.length, 1);
  assert.equal(logs[0]?.query, 'панорамная');
  assert.equal(logs[0]?.resultsCount >= 1, true);
});

test('popular queries endpoint returns aggregated data', async () => {
  const now = new Date();
  await SearchLog.insertMany([
    { query: 'квартира', timestamp: now, resultsCount: 10, responseTime: 180, fuzzyUsed: false },
    { query: 'квартира', timestamp: now, resultsCount: 8, responseTime: 190, fuzzyUsed: false },
    { query: 'дом', timestamp: now, resultsCount: 4, responseTime: 220, fuzzyUsed: false },
  ]);

  const response = await agent
    .get('/api/analytics/search/popular')
    .set(authHeader())
    .expect(200);

  assert.equal(response.body.period, 'last_30_days');
  assert.equal(response.body.queries[0].query, 'квартира');
  assert.equal(response.body.queries[0].count, 2);
});

test('failed queries endpoint highlights zero-result searches', async () => {
  const now = new Date();
  await SearchLog.insertMany([
    { query: 'пентхауз', timestamp: now, resultsCount: 0, responseTime: 320, fuzzyUsed: false },
    { query: 'пентхауз', timestamp: now, resultsCount: 0, responseTime: 310, fuzzyUsed: true },
    { query: 'лофт', timestamp: now, resultsCount: 3, responseTime: 210, fuzzyUsed: false },
  ]);

  const response = await agent
    .get('/api/analytics/search/failed')
    .set(authHeader())
    .expect(200);

  assert.equal(response.body.total, 2);
  assert.equal(response.body.queries[0].query, 'пентхауз');
  assert.equal(response.body.queries[0].fuzzyAttempted, true);
});

test('stats endpoint returns summary metrics', async () => {
  const now = new Date();
  await SearchLog.insertMany([
    { query: 'квартира', timestamp: now, resultsCount: 5, responseTime: 180, fuzzyUsed: false },
    { query: 'квартира', timestamp: now, resultsCount: 0, responseTime: 220, fuzzyUsed: true },
    { query: 'дом', timestamp: now, resultsCount: 2, responseTime: 300, fuzzyUsed: false },
  ]);

  const response = await agent
    .get('/api/analytics/search/stats')
    .set(authHeader())
    .expect(200);

  assert.equal(response.body.totalSearches, 3);
  assert.ok(response.body.uniqueQueries >= 2);
  assert.ok(response.body.fuzzyUsageRate > 0);
  assert.ok(response.body.zeroResultsRate > 0);
});

test('search response remains fast despite logging', async () => {
  await Property.insertMany([buildPropertySeed(0, { title: 'Уютная студия' })]);

  const started = performance.now();
  const response = await agent.get('/api/search').query({ q: 'студия' });
  const duration = performance.now() - started;

  assert.equal(response.status, 200);
  assert.ok(duration < 500);
  await searchLogger.flush();
});
