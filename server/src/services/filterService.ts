import type { FilterQuery } from 'mongoose';
import type { AvailableFilters, SearchFilters, SortBy, SortOrder } from '../types/filters';

type MongoSort = Record<string, 1 | -1>;

export class FilterService {
  /**
   * Build MongoDB query from validated filters.
   * Handles text search, ranges, exact matches, and arrays.
   */
  buildQuery(filters: SearchFilters): FilterQuery<Record<string, unknown>> {
    const query: FilterQuery<Record<string, unknown>> = {};

    if (filters.query) {
      query.$text = { $search: filters.query };
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      query.price = {};
      if (filters.priceMin !== undefined) query.price.$gte = filters.priceMin;
      if (filters.priceMax !== undefined) query.price.$lte = filters.priceMax;
    }

    if (filters.pricePerMeterMin !== undefined || filters.pricePerMeterMax !== undefined) {
      query.pricePerMeter = {};
      if (filters.pricePerMeterMin !== undefined) query.pricePerMeter.$gte = filters.pricePerMeterMin;
      if (filters.pricePerMeterMax !== undefined) query.pricePerMeter.$lte = filters.pricePerMeterMax;
    }

    if (filters.rooms !== undefined) {
      query.roomsCount = filters.rooms;
    } else if (filters.roomsMin !== undefined || filters.roomsMax !== undefined) {
      query.roomsCount = {};
      if (filters.roomsMin !== undefined) query.roomsCount.$gte = filters.roomsMin;
      if (filters.roomsMax !== undefined) query.roomsCount.$lte = filters.roomsMax;
    }

    if (filters.areaMin !== undefined || filters.areaMax !== undefined) {
      query.area = {};
      if (filters.areaMin !== undefined) query.area.$gte = filters.areaMin;
      if (filters.areaMax !== undefined) query.area.$lte = filters.areaMax;
    }

    if (filters.city) {
      query.city = filters.city;
    }

    if (filters.district) {
      query.district = filters.district;
    }

    if (filters.propertyType) {
      if (Array.isArray(filters.propertyType)) {
        query.propertyType = { $in: filters.propertyType };
      } else {
        query.propertyType = filters.propertyType;
      }
    }

    if (filters.dealType) {
      if (Array.isArray(filters.dealType)) {
        query.dealType = { $in: filters.dealType };
      } else {
        query.dealType = filters.dealType;
      }
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else {
        query.status = filters.status;
      }
    }

    return query;
  }

  /**
   * Build MongoDB sort object.
   * Default: createdAt desc (newest first)
   */
  buildSort(sortBy?: SortBy, sortOrder?: SortOrder): MongoSort {
    if (!sortBy) {
      return { createdAt: -1 };
    }
    const order = sortOrder === 'desc' ? -1 : 1;
    return { [sortBy]: order };
  }

  /**
   * Get available filter options from database.
   * Uses distinct() for categories and aggregation for ranges.
   */
  async getAvailableFilters(PropertyModel: any): Promise<AvailableFilters> {
    const [
      cities,
      districts,
      propertyTypes,
      dealTypes,
      statuses,
      priceStats,
      roomsStats,
      areaStats,
      pricePerMeterStats,
    ] = await Promise.all([
      PropertyModel.distinct('city').exec(),
      PropertyModel.distinct('district').exec(),
      PropertyModel.distinct('propertyType').exec(),
      PropertyModel.distinct('dealType').exec(),
      PropertyModel.distinct('status').exec(),
      PropertyModel.aggregate([
        {
          $group: {
            _id: null,
            min: { $min: '$price' },
            max: { $max: '$price' },
          },
        },
      ])
        .exec()
        .then((res: Array<{ min: number; max: number }>) => res[0] ?? { min: 0, max: 0 }),
      PropertyModel.aggregate([
        {
          $group: {
            _id: null,
            min: { $min: '$roomsCount' },
            max: { $max: '$roomsCount' },
          },
        },
      ])
        .exec()
        .then((res: Array<{ min: number; max: number }>) => res[0] ?? { min: 0, max: 0 }),
      PropertyModel.aggregate([
        {
          $group: {
            _id: null,
            min: { $min: '$area' },
            max: { $max: '$area' },
          },
        },
      ])
        .exec()
        .then((res: Array<{ min: number; max: number }>) => res[0] ?? { min: 0, max: 0 }),
      PropertyModel.aggregate([
        {
          $group: {
            _id: null,
            min: { $min: '$pricePerMeter' },
            max: { $max: '$pricePerMeter' },
          },
        },
      ])
        .exec()
        .then((res: Array<{ min: number; max: number }>) => res[0] ?? { min: 0, max: 0 }),
    ]);

    return {
      cities: cities.filter(Boolean),
      districts: districts.filter(Boolean),
      propertyTypes: propertyTypes.filter(Boolean),
      dealTypes: dealTypes.filter(Boolean),
      statuses: statuses.filter(Boolean),
      priceRange: [priceStats.min ?? 0, priceStats.max ?? 0],
      roomsRange: [roomsStats.min ?? 0, roomsStats.max ?? 0],
      areaRange: [areaStats.min ?? 0, areaStats.max ?? 0],
      pricePerMeterRange: [pricePerMeterStats.min ?? 0, pricePerMeterStats.max ?? 0],
    };
  }
}

export const filterService = new FilterService();
