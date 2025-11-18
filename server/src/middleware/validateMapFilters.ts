import type { NextFunction, Request, Response } from 'express';
import type { MapFilters } from '../types/map';

declare module 'express-serve-static-core' {
  interface Locals {
    mapFilters: MapFilters;
  }
}

export function validateMapFilters(req: Request, res: Response, next: NextFunction): void {
  const errors: Record<string, string> = {};
  const filters: Partial<MapFilters> = {};

  const parseNumber = (name: string, value: unknown, min?: number, max?: number) => {
    if (value === undefined || value === '') return undefined;
    const num = Number(value);
    if (Number.isNaN(num)) {
      errors[name] = 'Must be a valid number';
      return undefined;
    }
    if (min !== undefined && num < min) {
      errors[name] = `Must be >= ${min}`;
      return undefined;
    }
    if (max !== undefined && num > max) {
      errors[name] = `Must be <= ${max}`;
      return undefined;
    }
    return num;
  };

  const south = parseNumber('south', req.query.south, -90, 90);
  const west = parseNumber('west', req.query.west, -180, 180);
  const north = parseNumber('north', req.query.north, -90, 90);
  const east = parseNumber('east', req.query.east, -180, 180);

  if (south !== undefined && north !== undefined && south >= north) {
    errors.bounds = 'south must be < north';
  }
  if (west !== undefined && east !== undefined && west >= east) {
    errors.bounds = 'west must be < east';
  }

  if (south === undefined || west === undefined || north === undefined || east === undefined) {
    if (!errors.south && !errors.west && !errors.north && !errors.east) {
      errors.bounds = 'All bounds required: south, west, north, east';
    }
  } else {
    filters.bounds = { south, west, north, east };
  }

  const zoom = parseNumber('zoom', req.query.zoom, 0, 22);
  if (zoom !== undefined) filters.zoom = zoom;

  if (req.query.cluster !== undefined) {
    const clusterValue = String(req.query.cluster).toLowerCase();
    if (clusterValue === 'true' || clusterValue === '1') {
      filters.cluster = true;
    } else if (clusterValue === 'false' || clusterValue === '0') {
      filters.cluster = false;
    }
  }

  const clusterRadius = parseNumber('clusterRadius', req.query.clusterRadius, 10, 200);
  if (clusterRadius !== undefined) filters.clusterRadius = clusterRadius;

  const limit = parseNumber('limit', req.query.limit, 1, 5000);
  if (limit !== undefined) filters.limit = limit;

  const priceMin = parseNumber('priceMin', req.query.priceMin, 0);
  if (priceMin !== undefined) filters.priceMin = priceMin;

  const priceMax = parseNumber('priceMax', req.query.priceMax, 0);
  if (priceMax !== undefined) filters.priceMax = priceMax;

  const rooms = parseNumber('rooms', req.query.rooms, 0, 10);
  if (rooms !== undefined) filters.rooms = rooms;

  const parseStringList = (value: unknown) => {
    const list = String(value)
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    return list.length <= 1 ? list[0] : list;
  };

  if (req.query.propertyType) {
    filters.propertyType = parseStringList(req.query.propertyType);
  }

  if (req.query.dealType) {
    filters.dealType = parseStringList(req.query.dealType);
  }

  if (req.query.status) {
    filters.status = parseStringList(req.query.status);
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({
      error: 'Validation Error',
      details: errors,
    });
    return;
  }

  res.locals.mapFilters = filters as MapFilters;
  next();
}
