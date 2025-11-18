/**
 * Geographic bounds (viewport) for map queries.
 * Standard [south, west, north, east] format.
 */
export interface MapBounds {
  /** Southern latitude boundary */
  south: number;
  /** Western longitude boundary */
  west: number;
  /** Northern latitude boundary */
  north: number;
  /** Eastern longitude boundary */
  east: number;
}

/**
 * Minimal property data for map markers.
 * Only essential fields to reduce payload size.
 */
export interface MapProperty {
  _id: string;
  title: string;
  price: number;
  pricePerMeter?: number;
  rooms?: number;
  area?: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  propertyType?: string;
  dealType?: string;
  status?: string;
  /** Image URL for marker popup */
  imageUrl?: string;
}

/**
 * Cluster of properties for map visualization.
 * Used when many properties are close together.
 */
export interface MapCluster {
  /** Cluster ID */
  id: string;
  /** Center coordinates [lng, lat] */
  coordinates: [number, number];
  /** Number of properties in cluster */
  count: number;
  /** Average price of properties in cluster */
  averagePrice?: number;
  /** Price range [min, max] */
  priceRange?: [number, number];
  /** Property IDs in this cluster */
  propertyIds: string[];
}

/**
 * Filters specific to map queries.
 */
export interface MapFilters {
  /** Geographic bounds (required for map queries) */
  bounds: MapBounds;
  /** Map zoom level (0-22, higher = more zoomed in) */
  zoom?: number;
  /** Enable clustering (default: true for zoom < 15) */
  cluster?: boolean;
  /** Cluster distance threshold in pixels (default: 50) */
  clusterRadius?: number;
  /** Maximum results to return (default: 1000) */
  limit?: number;
  /** Additional filters */
  priceMin?: number;
  priceMax?: number;
  rooms?: number;
  propertyType?: string | string[];
  dealType?: string | string[];
  status?: string | string[];
}

/**
 * Response format for map data queries.
 */
export interface MapDataResponse {
  /** Property markers or clusters */
  items: Array<MapProperty | MapCluster>;
  /** Total count of properties in bounds (before clustering) */
  total: number;
  /** Whether clustering was applied */
  clustered: boolean;
  /** Metadata */
  metadata: {
    bounds: MapBounds;
    zoom?: number;
    responseTimeMs: number;
  };
}

/** Type guard to check if item is a cluster. */
export function isMapCluster(item: MapProperty | MapCluster): item is MapCluster {
  return 'count' in item && 'propertyIds' in item;
}

/** Type guard to check if item is a property. */
export function isMapProperty(item: MapProperty | MapCluster): item is MapProperty {
  return 'location' in item && !('count' in item);
}
