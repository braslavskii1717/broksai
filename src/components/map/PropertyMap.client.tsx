'use client';

import { useMemo, useState } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { PropertyCardData } from '@/data/mockProperties';
import type { BoundsTuple } from '@/hooks/usePropertyClusters';
import { usePropertyClusters } from '@/hooks/usePropertyClusters';

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173];

export default function PropertyMapClient({ properties }: { properties: PropertyCardData[] }) {
  const [bounds, setBounds] = useState<BoundsTuple | null>(null);
  const [zoom, setZoom] = useState(11);
  const hasProperties = properties.length > 0;
  const center = useMemo(() => {
    if (!properties.length) return DEFAULT_CENTER;
    const avgLat = properties.reduce((sum, property) => sum + property.coordinates.lat, 0) / properties.length;
    const avgLng = properties.reduce((sum, property) => sum + property.coordinates.lng, 0) / properties.length;
    return [avgLat, avgLng] as [number, number];
  }, [properties]);

  const clusters = usePropertyClusters(properties, bounds, zoom);

  return (
    <MapContainer
      center={center}
      zoom={hasProperties ? 11 : 4}
      className="h-[420px] w-full overflow-hidden rounded-3xl"
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapEventBridge onChange={(bbox, level) => { setBounds(bbox); setZoom(level); }} />
      {clusters.map((cluster) => {
        if (cluster.type === 'cluster') {
          return (
            <CircleMarker
              key={`cluster-${cluster.id}`}
              center={cluster.position}
              pathOptions={{ color: '#0066ff', fillColor: '#0066ff', fillOpacity: 0.7 }}
              radius={20}
            >
              <Tooltip direction="center" offset={[0, 0]} opacity={1} permanent className="!bg-transparent !border-none !text-white">
                <span className="font-semibold">{cluster.count}</span>
              </Tooltip>
            </CircleMarker>
          );
        }
        return (
          <CircleMarker
            key={cluster.id}
            center={cluster.position}
            radius={10}
            pathOptions={{ color: '#ffffff', fillColor: '#00d4aa', weight: 2 }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <div className="text-sm">
                <p className="font-semibold">{cluster.property.title}</p>
                <p className="text-neutral-500">{cluster.property.district}</p>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

function MapEventBridge({ onChange }: { onChange: (bounds: BoundsTuple, zoom: number) => void }) {
  useMapEvents({
    load: (event) => {
      const map = event.target;
      const b = map.getBounds();
      onChange([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], map.getZoom());
    },
    moveend: (event) => {
      const map = event.target;
      const b = map.getBounds();
      onChange([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], map.getZoom());
    },
  });
  return null;
}
