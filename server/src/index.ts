import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { connectDB } from './lib/connect';
import { createTextIndex } from './lib/createTextIndex';
import cityRoutes from './routes/cities';
import chatRoutes from './routes/chat';
import propertyRoutes from './routes/properties';
import uploadRoutes from './routes/uploads';
import authRoutes from './routes/auth';
import searchRoutes from './routes/search';
import mapRoutes from './routes/map';
import autocompleteRoutes from './routes/autocomplete';
import analyticsRoutes from './routes/analytics';
import { termDictionary } from './lib/termDictionary';
import { searchLogger } from './lib/searchLogger';
import { openApiSpecPath, swaggerDocument, swaggerOptions, swaggerUi } from './docs/swaggerConfig';

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') ?? '*',
  }),
);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use('/api/cities', cityRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/search/autocomplete', autocompleteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/analytics/search', analyticsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
app.get('/api-docs/openapi.yaml', (_, res) => {
  res.sendFile(openApiSpecPath);
});
app.use('/api/auth', authRoutes);
app.use(chatRoutes);
app.use('/api/uploads', uploadRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

connectDB()
  .then(async () => {
    await createTextIndex();
    await termDictionary.loadDictionary();
    searchLogger.start();
    console.log(`📚 Term dictionary loaded (${termDictionary.size()} terms)`);
    app.listen(PORT, () => {
      console.log(`🚀 API server ready on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start API server', error);
    process.exit(1);
  });

async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Flushing search logs before exit...`);
  try {
    searchLogger.stop();
    await searchLogger.flush();
  } catch (error) {
    console.error('Failed to flush search logs on shutdown', error);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});
