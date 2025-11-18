import type { Model } from 'mongoose';
import type { MapBounds, MapProperty, MapCluster, MapFilters, MapDataResponse } from '../types/map';

/**
 * Service for map-related queries and data transformations.
 */
export class MapService {
  /**
   * Get properties within map bounds.
   * Returns minimal property data optimized for map markers.
   */
  async getMapData(PropertyModel: Model<any>, filters: MapFilters): Promise<MapDataResponse> {
    const startTime = Date.now();
    const query = this.buildBoundsQuery(filters);
    const properties = await PropertyModel.find(query)
      .select('_id title price pricePerMeter roomsCount area location propertyType dealType status imageUrl')
      .lean()
      .limit(filters.limit ?? 1000)
      .exec();

    const mapProperties: MapProperty[] = properties.map((property: any) => ({
      _id: property._id.toString(),
      title: property.title,
      price: property.price,
      pricePerMeter: property.pricePerMeter,
      rooms: property.roomsCount,
      area: property.area,
      location: property.location,
      propertyType: property.propertyType,
      dealType: property.dealType,
      status: property.status,
      imageUrl: property.imageUrl,
    }));

    const shouldCluster = this.shouldCluster(filters);
    const items = shouldCluster ? this.clusterProperties(mapProperties, filters) : mapProperties;

    return {
      items,
      total: mapProperties.length,
      clustered: shouldCluster,
      metadata: {
        bounds: filters.bounds,
        zoom: filters.zoom,
        responseTimeMs: Date.now() - startTime,
      },
    };
  }

  private buildBoundsQuery(filters: MapFilters): Record<string, unknown> {
    const { bounds } = filters;
    const query: Record<string, any> = {};

    query.location = {
      $geoWithin: {
        $box: [
          [bounds.west, bounds.south],
          [bounds.east, bounds.north],
        ],
      },
    };

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      query.price = {};
      if (filters.priceMin !== undefined) query.price.$gte = filters.priceMin;
      if (filters.priceMax !== undefined) query.price.$lte = filters.priceMax;
    }

    if (filters.rooms !== undefined) {
      query.roomsCount = filters.rooms;
    }

    if (filters.propertyType) {
      query.propertyType = Array.isArray(filters.propertyType) ? { $in: filters.propertyType } : filters.propertyType;
    }

    if (filters.dealType) {
      query.dealType = Array.isArray(filters.dealType) ? { $in: filters.dealType } : filters.dealType;
    }

    if (filters.status) {
      query.status = Array.isArray(filters.status) ? { $in: filters.status } : filters.status;
    }

    return query;
  }

  private shouldCluster(filters: MapFilters): boolean {
    if (filters.cluster === false) return false;
    if (filters.cluster === true) return true;
    const zoom = filters.zoom ?? 12;
    return zoom < 15;
  }

  private clusterProperties(properties: MapProperty[], filters: MapFilters): Array<MapProperty | MapCluster> {
    const clusterRadius = filters.clusterRadius ?? 50;
    const zoom = filters.zoom ?? 12;
    const degreeRadius = (clusterRadius * 0.01) / Math.pow(2, zoom - 12);

    const clusters: MapCluster[] = [];
    const clustered = new Set<string>();

    properties.forEach((property, index) => {
      if (clustered.has(property._id)) return;
      const [lng, lat] = property.location.coordinates;

      const nearby = properties.filter((candidate, candidateIndex) => {
        if (candidateIndex <= index || clustered.has(candidate._id)) return false;
        const [cLng, cLat] = candidate.location.coordinates;
        const distance = Math.sqrt((cLng - lng) ** 2 + (cLat - lat) ** 2);
        return distance < degreeRadius;
      });

      if (nearby.length > 0) {
        const all = [property, ...nearby];
        all.forEach((item) => clustered.add(item._id));
        const avgLng = all.reduce((sum, item) => sum + item.location.coordinates[0], 0) / all.length;
        const avgLat = all.reduce((sum, item) => sum + item.location.coordinates[1], 0) / all.length;
        const prices = all.map((item) => item.price);
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        clusters.push({
          id: `cluster_${clusters.length}`,
          coordinates: [avgLng, avgLat],
          count: all.length,
          averagePrice: Math.round(avgPrice),
          priceRange: [minPrice, maxPrice],
          propertyIds: all.map((item) => item._id),
        });
      }
    });

    const unclusteredProperties = properties.filter((property) => !clustered.has(property._id));
    return [...clusters, ...unclusteredProperties];
  }
}

export const mapService = new MapService();
