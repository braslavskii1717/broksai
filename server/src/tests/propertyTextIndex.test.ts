import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { connectDB } from '../lib/connect';
import { createTextIndex } from '../lib/createTextIndex';
import { Property } from '../models/Property';

const baseProperty = {
  district: 'ЦАО',
  city: 'Москва',
  cityId: 77,
  price: 20000000,
  pricePerMeter: 400000,
  propertyType: 'apartment',
  images: ['https://example.com/panoramic.jpg'],
  coverImage: 'https://example.com/panoramic-cover.jpg',
};

async function seedProperties() {
  await Property.deleteMany({});
  await Property.insertMany([
    {
      ...baseProperty,
      title: 'Панорамная квартира в центре',
      address: 'Москва, Новый Арбат, 10',
      description: 'Панорамные окна и французские балконы с видом на Кремль.',
    },
    {
      ...baseProperty,
      title: 'Дом у тихого парка',
      address: 'Москва, Ломоносовский проспект, 5',
      description: 'Уютный дом рядом с парком, без панорамных окон.',
    },
  ]);
}

async function run() {
  await connectDB();
  await createTextIndex();
  await seedProperties();

  type TextSearchResult = { title: string; score?: number };
  const results = (await Property.find(
    { $text: { $search: '"панорамные окна"', $language: 'russian' } },
    { title: 1, score: { $meta: 'textScore' } },
  )
    .sort({ score: { $meta: 'textScore' } as any })
    .lean()) as unknown as TextSearchResult[];

  assert.equal(results.length, 1, 'Должна вернуться одна релевантная запись');
  assert.equal(
    results[0]?.title,
    'Панорамная квартира в центре',
    'Документ с панорамными окнами должен быть выше остальных',
  );

  console.log('✅ propertyTextIndex.test.ts — текстовый поиск работает');
}

run()
  .catch((error) => {
    console.error('❌ propertyTextIndex.test.ts — тест упал', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    process.exit();
  });
