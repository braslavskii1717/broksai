import { useMemo } from 'react';
import Supercluster, { type AnyProps, type ClusterProperties, type PointFeature } from 'supercluster';
import type { PropertyCardData } from '@/data/mockProperties';

export type BoundsTuple = [number, number, number, number];

type PropertyFeature = PointFeature<{ cluster: false; propertyId: string }>;

export type ClusterPoint =
  | {
      type: 'cluster';
      id: number | string;
      position: [number, number];
      count: number;
    }
  | {
      type: 'property';
      id: string;
      position: [number, number];
      property: PropertyCardData;
    };

export function usePropertyClusters(properties: PropertyCardData[], bounds: BoundsTuple | null, zoom: number) {
  const points: PropertyFeature[] = useMemo(() => {
    return properties
      .filter((property) => Boolean(property.coordinates))
      .map((property) => ({
        type: 'Feature',
        properties: {
          cluster: false,
          propertyId: property.id,
        },
        geometry: {
          type: 'Point',
          coordinates: [property.coordinates.lng, property.coordinates.lat],
        },
      }));
  }, [properties]);

  const index = useMemo(() => {
    const cluster = new Supercluster<{ propertyId: string }>({ radius: 60, maxZoom: 18, minZoom: 0 });
    cluster.load(points);
    return cluster;
  }, [points]);

  const isClusterProps = (props: AnyProps | undefined): props is ClusterProperties =>
    Boolean(props && 'cluster' in props && props.cluster);

  return useMemo<ClusterPoint[]>(() => {
    const queryBounds = bounds ?? [-180, -85, 180, 85];
    const currentZoom = Number.isFinite(zoom) ? zoom : 10;
    const rawClusters = index.getClusters(queryBounds, Math.round(currentZoom));
    return rawClusters.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      if (isClusterProps(feature.properties)) {
        return {
          type: 'cluster',
          id: feature.id ?? `${lat}-${lng}`,
          position: [lat, lng] as [number, number],
          count: feature.properties?.point_count ?? 0,
        };
      }
      const propertyId = (feature.properties as PropertyFeature['properties']).propertyId;
      const property = properties.find((item) => item.id === propertyId);
      if (!property) {
        return {
          type: 'cluster',
          id: feature.id ?? `${lat}-${lng}`,
          position: [lat, lng] as [number, number],
          count: 1,
        };
      }
      return {
        type: 'property',
        id: property.id,
        position: [lat, lng] as [number, number],
        property,
      };
    }) as ClusterPoint[];
  }, [bounds, index, properties, zoom]);
}
