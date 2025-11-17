import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import autocompleteRoutes from '../routes/autocomplete';
import { Property } from '../models/Property';
import { createTextIndex } from '../lib/createTextIndex';
import { autocompleteCache } from '../lib/autocompleteCache';
import { buildPropertySeed, generatePropertyBatch } from './utils/propertyFactory';

const app = express();
app.use(express.json());
app.use('/api/search/autocomplete', autocompleteRoutes);
const agent = request(app);

let mongoServer: MongoMemoryServer;

const FREQUENT_PREFIX = '2-ком';
const PANORAMA_WORD = 'панорамная';

async function seedAutocompleteData() {
  autocompleteCache.clear();
  await Property.deleteMany({});

  const panoramic = Array.from({ length: 120 }).map((_, index) =>
    buildPropertySeed(index, {
      title: '2-комнатная квартира на Арбате',
      address: `Москва, Арбат, ${index + 1}`,
      description: `${PANORAMA_WORD} квартира с видом на Кремль`,
    }),
  );

  const centralStudios = Array.from({ length: 80 }).map((_, index) =>
    buildPropertySeed(index + 200, {
      title: `Студия у метро ${index}`,
      address: 'Москва, Тверская улица',
      description: 'уютная студия рядом с метро',
    }),
  );

  const filler = generatePropertyBatch(900, (idx) => ({
    title: `Квартира ${idx + 400} в новом ЖК`,
    address: `Санкт-Петербург, Невский ${idx + 5}`,
  }));

  await Property.insertMany([...panoramic, ...centralStudios, ...filler]);
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
  await seedAutocompleteData();
});

test.afterEach(async () => {
  autocompleteCache.clear();
  await Property.deleteMany({});
});

test('returns suggestions for valid prefix', async () => {
  const response = await agent.get('/api/search/autocomplete').query({ q: FREQUENT_PREFIX });

  assert.equal(response.status, 200);
  assert.ok(response.body.suggestions.length <= 10);
  assert.ok(
    response.body.suggestions.some((item: { text: string }) => item.text.includes('2-комнатная')),
    'Ожидаем подсказку по названию',
  );
  assert.equal(response.body.metadata.count, response.body.suggestions.length);
  assert.equal(response.body.metadata.cached, false);
});

test('responds under 100ms and tracks metadata', async () => {
  const response = await agent.get('/api/search/autocomplete').query({ q: 'москва' });

  assert.equal(response.status, 200);
  assert.ok(response.body.metadata.responseTime < 100, 'autocomplete должен отвечать быстрее 100мс');
});

test('caches repeated prefixes and speeds up response', async () => {
  const first = await agent.get('/api/search/autocomplete').query({ q: PANORAMA_WORD });
  const second = await agent.get('/api/search/autocomplete').query({ q: PANORAMA_WORD });

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(first.body.metadata.cached, false);
  assert.equal(second.body.metadata.cached, true);
  assert.ok(
    second.body.metadata.responseTime <= first.body.metadata.responseTime,
    'Кэшированный ответ должен быть не медленнее первого',
  );
});

test('rejects too short prefix', async () => {
  const response = await agent.get('/api/search/autocomplete').query({ q: 'я' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'INVALID_QUERY');
});

test('returns empty suggestions for unknown text', async () => {
  const response = await agent.get('/api/search/autocomplete').query({ q: 'яяяяяяяя' });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.suggestions, []);
  assert.equal(response.body.metadata.count, 0);
});
