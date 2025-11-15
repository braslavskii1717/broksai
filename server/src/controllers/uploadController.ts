import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import type { Request, Response } from 'express';

const uploadsDir = path.resolve(__dirname, '../../uploads');

const ensureUploadsDir = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
};

export async function uploadPhotoController(request: Request, response: Response) {
  try {
    if (!request.file) {
      return response.status(400).json({ message: 'Файл обязателен' });
    }

    await ensureUploadsDir();

    const safeName = `property-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
    const outputPath = path.join(uploadsDir, safeName);

    await sharp(request.file.buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    const publicPath = `/uploads/${safeName}`;
    const publicUrl = process.env.CDN_URL ? `${process.env.CDN_URL}${publicPath}` : publicPath;

    return response.status(201).json({ url: publicUrl, path: publicPath });
  } catch (error) {
    console.error('uploadPhotoController error', error);
    return response.status(500).json({ message: 'Не удалось загрузить фото' });
  }
}
