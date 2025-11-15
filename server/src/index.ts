import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { connectDB } from './lib/connect';
import cityRoutes from './routes/cities';
import chatRoutes from './routes/chat';
import propertyRoutes from './routes/properties';
import uploadRoutes from './routes/uploads';

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
app.use(chatRoutes);
app.use('/api/uploads', uploadRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API server ready on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start API server', error);
    process.exit(1);
  });
