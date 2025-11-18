import type { NextFunction, Request, Response } from 'express';
import type { SearchFilters, SortBy, SortOrder } from '../types/filters';

const VALID_PROPERTY_TYPES = ['apartment', 'penthouse', 'loft', 'house', 'townhouse', 'studio'] as const;
const VALID_DEAL_TYPES = ['buy', 'rent', 'daily'] as const;
const VALID_STATUSES = ['available', 'reserved', 'sold'] as const;
const VALID_SORT_FIELDS: SortBy[] = ['price', 'area', 'rooms', 'pricePerMeter', 'createdAt', 'distance'];
const VALID_SORT_ORDER: SortOrder[] = ['asc', 'desc'];

const DEFAULT_LIMIT = 24;
const DEFAULT_OFFSET = 0;
const LIMIT_RANGE = { min: 1, max: 100 };
const OFFSET_RANGE = { min: 0, max: 10_000 };
const PRICE_RANGE = { min: 0, max: 10_000_000_000 };
const PRICE_PER_METER_RANGE = { min: 0, max: 1_000_000 };
const AREA_RANGE = { min: 5, max: 10_000 };
const ROOMS_RANGE = { min: 0, max: 10 };
const LAT_RANGE = { min: -90, max: 90 };
const LNG_RANGE = { min: -180, max: 180 };
const RADIUS_RANGE = { min: 0.1, max: 100 };

type ValidationErrors = Record<string, string>;

declare module 'express-serve-static-core' {
  interface Locals {
    searchFilters: SearchFilters;
  }
}

function takeFirst(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value.find((entry) => typeof entry === 'string');
    return first?.trim();
  }
  return typeof value === 'string' ? value.trim() : undefined;
}

function splitValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => (typeof entry === 'string' ? entry.split(',') : []))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function parseNumberField(
  field: string,
  value: unknown,
  errors: ValidationErrors,
  options: { min?: number; max?: number; integer?: boolean } = {},
) {
  const raw = takeFirst(value);
  if (raw === undefined) return undefined;

  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    errors[field] = 'Must be a number';
    return undefined;
  }

  if (options.integer && !Number.isInteger(parsed)) {
    errors[field] = 'Must be an integer';
    return undefined;
  }

  if (options.min !== undefined && parsed < options.min) {
    errors[field] = `Must be >= ${options.min}`;
    return undefined;
  }

  if (options.max !== undefined && parsed > options.max) {
    errors[field] = `Must be <= ${options.max}`;
    return undefined;
  }

  return parsed;
}

function sanitizeText(value: unknown, { maxLength = 200 }: { maxLength?: number } = {}) {
  const raw = takeFirst(value);
  if (!raw) return undefined;
  const trimmed = raw.slice(0, maxLength).trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeEnumCollection(field: string, value: unknown, allowed: readonly string[], errors: ValidationErrors) {
  const parts = splitValues(value).map((entry) => entry.toLowerCase());
  if (!parts.length) return undefined;
  const unknown = parts.filter((entry) => !allowed.includes(entry));
  if (unknown.length) {
    errors[field] = 'Invalid value';
    return undefined;
  }
  return parts.length === 1 ? parts[0] : Array.from(new Set(parts));
}

export function validateFilters(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationErrors = {};
  const filters: SearchFilters = {};

  const query = sanitizeText(req.query.q ?? req.query.query);
  if (query) {
    filters.query = query;
  }

  const city = sanitizeText(req.query.city);
  if (city) filters.city = city;

  const district = sanitizeText(req.query.district);
  if (district) filters.district = district;

  const priceMin = parseNumberField('priceMin', req.query.priceMin, errors, {
    min: PRICE_RANGE.min,
    max: PRICE_RANGE.max,
  });
  if (priceMin !== undefined) filters.priceMin = priceMin;

  const priceMax = parseNumberField('priceMax', req.query.priceMax, errors, {
    min: PRICE_RANGE.min,
    max: PRICE_RANGE.max,
  });
  if (priceMax !== undefined) filters.priceMax = priceMax;

  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
    errors.priceMax = 'Must be >= priceMin';
  }

  const pricePerMeterMin = parseNumberField('pricePerMeterMin', req.query.pricePerMeterMin, errors, {
    min: PRICE_PER_METER_RANGE.min,
    max: PRICE_PER_METER_RANGE.max,
  });
  if (pricePerMeterMin !== undefined) filters.pricePerMeterMin = pricePerMeterMin;

  const pricePerMeterMax = parseNumberField('pricePerMeterMax', req.query.pricePerMeterMax, errors, {
    min: PRICE_PER_METER_RANGE.min,
    max: PRICE_PER_METER_RANGE.max,
  });
  if (pricePerMeterMax !== undefined) filters.pricePerMeterMax = pricePerMeterMax;

  if (pricePerMeterMin !== undefined && pricePerMeterMax !== undefined && pricePerMeterMin > pricePerMeterMax) {
    errors.pricePerMeterMax = 'Must be >= pricePerMeterMin';
  }

  const rooms = parseNumberField('rooms', req.query.rooms, errors, {
    min: ROOMS_RANGE.min,
    max: ROOMS_RANGE.max,
    integer: true,
  });
  if (rooms !== undefined) filters.rooms = rooms;

  const roomsMin = parseNumberField('roomsMin', req.query.roomsMin, errors, {
    min: ROOMS_RANGE.min,
    max: ROOMS_RANGE.max,
    integer: true,
  });
  if (roomsMin !== undefined) filters.roomsMin = roomsMin;

  const roomsMax = parseNumberField('roomsMax', req.query.roomsMax, errors, {
    min: ROOMS_RANGE.min,
    max: ROOMS_RANGE.max,
    integer: true,
  });
  if (roomsMax !== undefined) filters.roomsMax = roomsMax;

  if (roomsMin !== undefined && roomsMax !== undefined && roomsMin > roomsMax) {
    errors.roomsMax = 'Must be >= roomsMin';
  }

  const areaMin = parseNumberField('areaMin', req.query.areaMin, errors, {
    min: AREA_RANGE.min,
    max: AREA_RANGE.max,
  });
  if (areaMin !== undefined) filters.areaMin = areaMin;

  const areaMax = parseNumberField('areaMax', req.query.areaMax, errors, {
    min: AREA_RANGE.min,
    max: AREA_RANGE.max,
  });
  if (areaMax !== undefined) filters.areaMax = areaMax;

  if (areaMin !== undefined && areaMax !== undefined && areaMin > areaMax) {
    errors.areaMax = 'Must be >= areaMin';
  }

  const sortBy = sanitizeText(req.query.sortBy)?.toLowerCase() as SortBy | undefined;
  if (sortBy) {
    if (!VALID_SORT_FIELDS.includes(sortBy)) {
      errors.sortBy = 'Invalid value';
    } else {
      filters.sortBy = sortBy;
    }
  }

  const sortOrder = sanitizeText(req.query.sortOrder)?.toLowerCase() as SortOrder | undefined;
  if (sortOrder) {
    if (!VALID_SORT_ORDER.includes(sortOrder)) {
      errors.sortOrder = 'Invalid value';
    } else {
      filters.sortOrder = sortOrder;
    }
  }

  const propertyType = normalizeEnumCollection('propertyType', req.query.propertyType, VALID_PROPERTY_TYPES, errors);
  if (propertyType) {
    filters.propertyType = propertyType;
  }

  const dealType = normalizeEnumCollection('dealType', req.query.dealType, VALID_DEAL_TYPES, errors);
  if (dealType) {
    filters.dealType = dealType;
  }

  const status = normalizeEnumCollection('status', req.query.status, VALID_STATUSES, errors);
  if (status) {
    filters.status = status;
  }

  const limit = parseNumberField('limit', req.query.limit, errors, {
    min: LIMIT_RANGE.min,
    max: LIMIT_RANGE.max,
    integer: true,
  });
  filters.limit = limit ?? DEFAULT_LIMIT;

  const offset = parseNumberField('offset', req.query.offset, errors, {
    min: OFFSET_RANGE.min,
    max: OFFSET_RANGE.max,
    integer: true,
  });
  filters.offset = offset ?? DEFAULT_OFFSET;

  const latitude = parseNumberField('lat', req.query.lat, errors, {
    min: LAT_RANGE.min,
    max: LAT_RANGE.max,
  });
  if (latitude !== undefined) filters.lat = latitude;

  const longitude = parseNumberField('lng', req.query.lng, errors, {
    min: LNG_RANGE.min,
    max: LNG_RANGE.max,
  });
  if (longitude !== undefined) filters.lng = longitude;

  const radius = parseNumberField('radius', req.query.radius, errors, {
    min: RADIUS_RANGE.min,
    max: RADIUS_RANGE.max,
  });
  if (radius !== undefined) filters.radius = radius;

  const hasLat = latitude !== undefined;
  const hasLng = longitude !== undefined;
  const hasRadius = radius !== undefined;
  if (hasLat || hasLng || hasRadius) {
    if (!hasLat) errors.lat = 'Required when using geo search';
    if (!hasLng) errors.lng = 'Required when using geo search';
    if (!hasRadius) errors.radius = 'Required when using geo search';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors,
    });
  }

  res.locals.searchFilters = filters;
  return next();
}
