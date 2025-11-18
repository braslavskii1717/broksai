import { Property } from '../models/Property';
import { filterService } from './filterService';
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
    const sort = filterService.buildSort(filters.sortBy, filters.sortOrder);
    const total = await Property.countDocuments({}).exec();
    const filteredTotal = await Property.countDocuments(query).exec();

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const results = await Property.find(query)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

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
