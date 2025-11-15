import type { Request, Response } from 'express';
import { z } from 'zod';
import { Property } from '../models/Property';
import { buildPropertyQuery } from '../services/queryBuilder';

const PROPERTY_IMAGE_PLACEHOLDER = '/images/placeholders/property-fallback.svg';

const normalizeProperty = (property: any) => {
  if (!property) return property;
  const plain = typeof property.toObject === 'function' ? property.toObject() : property;
  const images = Array.isArray(plain.images) && plain.images.length ? plain.images : [];
  const coverImage = plain.coverImage ?? images[0];
  const fallbackImage = coverImage ?? PROPERTY_IMAGE_PLACEHOLDER;
  return {
    ...plain,
    id: (plain.id ?? plain._id ?? '').toString() || plain.id,
    image: fallbackImage,
    images: images.length ? images : [fallbackImage],
  };
};

const createPropertySchema = z.object({
  title: z.string().min(3),
  address: z.string().min(3),
  district: z.string().min(2),
  city: z.string().min(2),
  cityId: z.number().int(),
  status: z.string().min(2),
  price: z.number().positive(),
  pricePerMeter: z.number().positive(),
  roomsCount: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  area: z.number().positive().optional(),
  livingArea: z.number().positive().optional(),
  kitchenArea: z.number().positive().optional(),
  floorNumber: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  dealType: z.enum(['buy', 'rent', 'daily']).default('buy'),
  propertyType: z.string().min(2),
  houseType: z.string().optional(),
  condition: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().min(5)).nonempty(),
  coverImage: z.string().url().optional(),
  developer: z.string().optional(),
  view: z.string().optional(),
  parkingType: z.string().optional(),
  petFriendly: z.boolean().optional(),
  accessibilityFriendly: z.boolean().optional(),
  metroDistance: z.number().optional(),
  metroName: z.string().optional(),
  metroLine: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export async function listProperties(request: Request, response: Response) {
  try {
    const { filters, limit } = buildPropertyQuery(request.query);
    const data = await Property.find(filters).limit(limit).lean();
    const normalized = data.map((item) => normalizeProperty(item));
    response.json({ data: normalized, meta: { total: normalized.length } });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: 'Не удалось получить список объектов' });
  }
}

export async function getProperty(request: Request, response: Response) {
  try {
    const property = await Property.findById(request.params.id).lean();
    if (!property) {
      return response.status(404).json({ message: 'Объект не найден' });
    }
    return response.json({ data: normalizeProperty(property) });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Ошибка при получении объекта' });
  }
}

export async function createProperty(request: Request, response: Response) {
  try {
    const parsed = createPropertySchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({ message: 'Некорректные данные', errors: parsed.error.flatten() });
    }

    const payload = parsed.data;
    const coverImage = payload.coverImage ?? payload.images[0];

    const created = await Property.create({
      ...payload,
      coverImage,
      hasPhotos: true,
    });

    return response.status(201).json({ data: normalizeProperty(created) });
  } catch (error) {
    console.error('createProperty error', error);
    return response.status(500).json({ message: 'Не удалось создать объект' });
  }
}
