import type { FilterQuery } from 'mongoose';

/**
 * Service for geospatial queries and distance calculations.
 */
export class GeoFilterService {
  /**
   * Build MongoDB query for radius search using $near operator.
   * @param latitude Center point latitude (-90 to 90)
   * @param longitude Center point longitude (-180 to 180)
   * @param radiusKm Radius in kilometers
   */
  buildGeoQuery(latitude: number, longitude: number, radiusKm: number): FilterQuery<Record<string, unknown>> {
    const radiusMeters = radiusKm * 1000;
    return {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusMeters,
        },
      },
    };
  }

  /**
   * Calculate distance between two points using Haversine formula (km).
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Adds distanceKm field to property results relative to user point.
   */
  addDistanceToResults(results: Array<Record<string, any>>, userLat: number, userLng: number): void {
    results.forEach((property) => {
      const coords = property.location?.coordinates;
      if (Array.isArray(coords) && coords.length === 2) {
        const [lng, lat] = coords as [number, number];
        property.distanceKm = this.calculateDistance(userLat, userLng, lat, lng);
      }
    });
  }

  /**
   * Build polygon query for map selection.
   */
  buildPolygonQuery(coordinates: number[][]): FilterQuery<Record<string, unknown>> {
    return {
      location: {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
        },
      },
    };
  }
}

export const geoFilterService = new GeoFilterService();
