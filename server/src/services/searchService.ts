import type { FilterQuery } from 'mongoose';
import { Property } from '../models/Property';
import { filterService } from './filterService';
import { geoFilterService } from './geoFilterService';
import type { AppliedFilter, SearchFilters, SearchResponse } from '../types/filters';

export class SearchService {
  /**
   * Main search method with advanced filters.
   *
   * Supports text search, price/rooms/area ranges, location, categories, sorting, pagination.
   */
  async search(filters: SearchFilters): Promise<SearchResponse> {
    const startTime = Date.now();

    const query = filterService.buildQuery(filters);
    const hasGeoFilter = filters.lat !== undefined && filters.lng !== undefined && filters.radius !== undefined;
    const effectiveSortBy = hasGeoFilter && !filters.sortBy ? 'distance' : filters.sortBy;
    const sort = filterService.buildSort(effectiveSortBy, filters.sortOrder);
    const total = await Property.countDocuments({}).exec();

    const countQuery: FilterQuery<Record<string, unknown>> = { ...query };
    if (hasGeoFilter && countQuery.location && '$near' in countQuery.location) {
      const nearClause = (countQuery.location as any).$near;
      if (nearClause?.$geometry?.coordinates && nearClause?.$maxDistance) {
        const [lng, lat] = nearClause.$geometry.coordinates as [number, number];
        const radiusKm = nearClause.$maxDistance / 1000;
        (countQuery.location as any) = {
          $geoWithin: {
            $centerSphere: [[lng, lat], radiusKm / 6371],
          },
        };
      }
    }

    const filteredTotal = await Property.countDocuments(countQuery).exec();

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    let findQuery = Property.find(query);
    if (Object.keys(sort).length > 0) {
      findQuery = findQuery.sort(sort);
    }

    const results = await findQuery.skip(offset).limit(limit).lean().exec();

    if (filters.lat !== undefined && filters.lng !== undefined) {
      geoFilterService.addDistanceToResults(results, filters.lat, filters.lng);
    }

    const availableOptions = await filterService.getAvailableFilters(Property);
    const appliedFilters = this.buildAppliedFilters(filters);
    const responseTimeMs = Date.now() - startTime;

    return {
      results,
      total,
      filteredTotal,
      pagination: {
        limit,
        offset,
        hasMore: offset + results.length < filteredTotal,
      },
      filters: {
        appliedFilters,
        availableOptions,
      },
      metadata: {
        query: filters.query,
        responseTimeMs,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Build list of applied filters for API response.
   *
   * Shows which filters user has selected.
   */
  private buildAppliedFilters(filters: SearchFilters): AppliedFilter[] {
    const applied: AppliedFilter[] = [];

    if (filters.query) {
      applied.push({ name: 'query', value: filters.query });
    }

    if (filters.lat !== undefined && filters.lng !== undefined && filters.radius !== undefined) {
      applied.push({
        name: 'geo',
        value: {
          lat: filters.lat,
          lng: filters.lng,
          radius: filters.radius,
        },
        displayValue: `Within ${filters.radius}km of [${filters.lat}, ${filters.lng}]`,
      });
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      applied.push({
        name: 'price',
        value: [filters.priceMin ?? 0, filters.priceMax ?? Infinity],
      });
    }

    if (filters.pricePerMeterMin !== undefined || filters.pricePerMeterMax !== undefined) {
      applied.push({
        name: 'pricePerMeter',
        value: [filters.pricePerMeterMin ?? 0, filters.pricePerMeterMax ?? Infinity],
      });
    }

    if (filters.rooms !== undefined) {
      applied.push({ name: 'rooms', value: filters.rooms });
    } else if (filters.roomsMin !== undefined || filters.roomsMax !== undefined) {
      applied.push({
        name: 'rooms',
        value: [filters.roomsMin ?? 0, filters.roomsMax ?? Infinity],
      });
    }

    if (filters.areaMin !== undefined || filters.areaMax !== undefined) {
      applied.push({
        name: 'area',
        value: [filters.areaMin ?? 0, filters.areaMax ?? Infinity],
      });
    }

    if (filters.city) {
      applied.push({ name: 'city', value: filters.city });
    }

    if (filters.district) {
      applied.push({ name: 'district', value: filters.district });
    }

    if (filters.propertyType) {
      applied.push({
        name: 'propertyType',
        value: Array.isArray(filters.propertyType) ? filters.propertyType : [filters.propertyType],
      });
    }

    if (filters.dealType) {
      applied.push({
        name: 'dealType',
        value: Array.isArray(filters.dealType) ? filters.dealType : [filters.dealType],
      });
    }

    if (filters.status) {
      applied.push({
        name: 'status',
        value: Array.isArray(filters.status) ? filters.status : [filters.status],
      });
    }

    return applied;
  }
}

export const searchService = new SearchService();
