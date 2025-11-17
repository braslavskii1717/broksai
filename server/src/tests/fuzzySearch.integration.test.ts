import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import searchRoutes from '../routes/search';
import { Property } from '../models/Property';
import { createTextIndex } from '../lib/createTextIndex';
import { termDictionary } from '../lib/termDictionary';
import { buildPropertySeed } from './utils/propertyFactory';

const app = express();
app.use(express.json());
app.use('/api/search', searchRoutes);
const agent = request(app);

let mongoServer: MongoMemoryServer;

async function seedFuzzyData() {
  await Property.deleteMany({});
  await Property.insertMany([
    buildPropertySeed(0, {
      title: '2-комнатная квартира на Арбате',
      address: 'Москва, Арбат, 12',
      description: 'вид на кремль',
    }),
    buildPropertySeed(1, {
      title: '3-комнатная квартира на Арбате',
      address: 'Москва, Арбат, 20',
      description: 'вид на реку',
    }),
  ]);
  await termDictionary.loadDictionary();
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

test('fuzzy search finds results for typo and populates metadata', async () => {
  await seedFuzzyData();

  const response = await agent.get('/api/search').query({ q: 'квортира' });

  assert.equal(response.status, 200);
  assert.ok(response.body.results.length > 0, 'ожидаем результаты после fuzzy поиска');
  assert.equal(response.body.metadata.fuzzyUsed, true);
  assert.ok(response.body.metadata.correctedQuery?.includes('кварт'));
  assert.ok(Array.isArray(response.body.metadata.didYouMean));
  assert.ok(response.body.metadata.didYouMean.length > 0);
  assert.ok(response.body.metadata.responseTime < 300);
});
