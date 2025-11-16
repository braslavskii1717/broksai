import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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
}
