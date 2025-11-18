import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is not defined');
    }
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('⚠️  MONGODB_URI не задан. Запуск in-memory MongoDB для разработки.');
  }
  await mongoose.connect(uri);
  console.log('🍃 MongoDB connected');
  
  // Загрузка seed data для in-memory БД
  if (!process.env.MONGODB_URI) {
    await loadSeedData();
  }
}

async function loadSeedData() {
  try {
    // Проверяем есть ли уже данные
    const Property = mongoose.model('Property');
    const count = await Property.countDocuments();
    
    if (count > 0) {
      console.log('📚 Database already has', count, 'properties');
      return;
    }
    
    // Загружаем seed data
    const seedDataPath = path.join(__dirname, '..', 'seed-data.json');
    
    if (!fs.existsSync(seedDataPath)) {
      console.log('⚠️  Seed data file not found, skipping...');
      return;
    }
    
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8')).map((entry: Record<string, unknown>) => {
      const roomsValue = typeof entry.rooms === 'number' ? entry.rooms : (entry as any).roomsCount;
      return {
        ...entry,
        roomsCount: roomsValue ?? 0,
      };
    });
    await Property.insertMany(seedData);
    
    console.log('✅ Loaded', seedData.length, 'properties from seed data');
    
  } catch (error: any) {
    console.log('⚠️  Could not load seed data:', error.message);
  }
}
