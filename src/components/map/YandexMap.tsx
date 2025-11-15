'use client';

import { useMemo } from 'react';
import { Map, Placemark, YMaps, ZoomControl } from '@pbe/react-yandex-maps';
import type { PropertyCardData } from '@/data/mockProperties';

type Props = {
  properties: PropertyCardData[];
};

const FALLBACK_CENTER: [number, number] = [55.7558, 37.6173];

export function YandexMap({ properties }: Props) {
  const center = useMemo<[number, number]>(() => {
    if (!properties.length) return FALLBACK_CENTER;
    const lat = properties.reduce((sum, property) => sum + property.coordinates.lat, 0) / properties.length;
    const lng = properties.reduce((sum, property) => sum + property.coordinates.lng, 0) / properties.length;
    return [Number(lat.toFixed(5)), Number(lng.toFixed(5))];
  }, [properties]);

  const zoom = properties.length > 1 ? 10 : 12;
  const query =
    process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY !== undefined && process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY !== ''
      ? { apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY, lang: 'ru_RU' as const }
      : { lang: 'ru_RU' as const };

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-neutral-100 shadow-inner">
      <YMaps query={query}>
        <Map
          width="100%"
          height="100%"
          defaultState={{ center, zoom, controls: [] }}
          modules={['control.ZoomControl']}
        >
          <ZoomControl options={{ position: { right: 16, top: 16 } }} />
          {properties.map((property) => (
            <Placemark
              key={property.id}
              geometry={[property.coordinates.lat, property.coordinates.lng]}
              properties={{
                balloonContent: `<strong>${property.title}</strong><br/>${property.city}`,
                hintContent: property.title,
              }}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  );
}
