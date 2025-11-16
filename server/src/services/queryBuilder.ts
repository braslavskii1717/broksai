import type { FilterQuery } from 'mongoose';
import { z } from 'zod';
import type { PropertyDocument } from '../models/Property';

const querySchema = z.object({
  cityId: z.string().optional(),
  dealType: z.enum(['buy', 'rent', 'daily']).optional(),
  propertyType: z.string().optional(),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  amenities: z.string().optional(),
  search: z.string().optional(),
  limit: z.string().optional(),
});

export function buildPropertyQuery(query: unknown) {
  const parsed = querySchema.safeParse(query);
  if (!parsed.success) {
    return { filters: {}, limit: 24 };
  }
  const { cityId, dealType, propertyType, priceMin, priceMax, amenities, search, limit } = parsed.data;
  const filters: FilterQuery<PropertyDocument> = {};

  if (cityId) filters.cityId = Number(cityId);
  if (dealType) filters.dealType = dealType;
  if (propertyType) filters.propertyType = { $in: propertyType.split(',') };
  if (priceMin || priceMax) {
    filters.price = {} as FilterQuery<PropertyDocument>['price'];
    if (priceMin) filters.price!.$gte = Number(priceMin);
    if (priceMax) filters.price!.$lte = Number(priceMax);
  }
  if (amenities) {
    filters.amenities = { $all: amenities.split(',') };
  }
  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    filters.$text = {
      $search: normalizedSearch,
      $language: 'russian',
    } as FilterQuery<PropertyDocument>['$text'];
  }

  return { filters, limit: limit ? Number(limit) : 24 };
}
