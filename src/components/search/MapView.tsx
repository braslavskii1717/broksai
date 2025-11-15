/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Clusterer, GeolocationControl, Map, Placemark, YMaps, ZoomControl } from '@pbe/react-yandex-maps';
import { usePropertyFeed } from '@/hooks/usePropertyFeed';
import type { PropertyCardData } from '@/data/mockProperties';
import { usePropertyFeedContext } from '@/context/PropertyFeedContext';
import type { MapBounds } from '@/domain/map';
import { MapSkeleton } from '@/components/skeletons/MapSkeleton';
import { propertyImagePlaceholder } from '@/lib/imagePlaceholders';

const MOSCOW_CENTER: [number, number] = [55.7558, 37.6173];
const MAP_ZOOM = 11;

const formatCompactPrice = (value: number) => {
  const million = value / 1_000_000;
  if (million >= 100) {
    return `${Math.round(million)} млн ₽`;
  }
  return `${million.toFixed(1)} млн ₽`;
};

const buildBadgeContent = (property: PropertyCardData) => {
  return renderToStaticMarkup(
    <div className="inline-flex h-8 min-w-[92px] -translate-x-1/2 -translate-y-full transform-gpu items-center justify-center rounded-full bg-[#0066FF] px-3 text-center text-sm font-semibold text-white shadow-lg transition-transform duration-150 hover:scale-110 hover:shadow-xl">
      {formatCompactPrice(property.price)}
    </div>,
  );
};

const resolvePropertyImage = (property: PropertyCardData) =>
  property.image || property.images?.[0] || propertyImagePlaceholder;

const buildBalloonContent = (property: PropertyCardData) => {
  const previewSrc = resolvePropertyImage(property);
  return renderToStaticMarkup(
    <div className="w-[260px] rounded-2xl bg-white text-left shadow-xl">
      <div className="flex gap-3 p-3">
        <div className="h-[90px] w-[120px] overflow-hidden rounded-2xl bg-neutral-100">
          <img src={previewSrc} alt={property.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="flex flex-1 flex-col">
          <p className="text-xs uppercase text-[#0066FF]">{property.city}</p>
          <p className="text-sm font-semibold text-neutral-900">{property.title}</p>
          <p className="text-xs text-neutral-500">{property.address}</p>
        </div>
      </div>
      <div className="space-y-2 border-t border-neutral-100 px-3 py-3">
        <p className="text-lg font-semibold text-neutral-900">{new Intl.NumberFormat('ru-RU').format(property.price)} ₽</p>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
          <span>{property.area} м²</span>
          <span>·</span>
          <span>{property.rooms} комн.</span>
        </div>
        <a
          href={`/property/${property.id}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#0066FF] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0053d6]"
        >
          Подробнее
        </a>
      </div>
    </div>,
  );
};

export function MapView() {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;
  const { properties, isLoading } = usePropertyFeed();
  const { state, setMapBounds, setSearchInMap } = usePropertyFeedContext();
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreActionRef = useRef(false);

  const query = useMemo(() => ({ lang: 'ru_RU' as const, apikey: apiKey || undefined }), [apiKey]);
  const mapProperties = properties.filter((property) => Boolean(property.coordinates?.lat && property.coordinates?.lng));

  const center = useMemo<[number, number]>(() => {
    if (state.searchInMap && state.mapBounds) {
      const lat = (state.mapBounds.northEast.lat + state.mapBounds.southWest.lat) / 2;
      const lng = (state.mapBounds.northEast.lng + state.mapBounds.southWest.lng) / 2;
      return [Number(lat.toFixed(5)), Number(lng.toFixed(5))];
    }
    if (mapProperties.length) {
      const lat = mapProperties.reduce((sum, property) => sum + property.coordinates.lat, 0) / mapProperties.length;
      const lng = mapProperties.reduce((sum, property) => sum + property.coordinates.lng, 0) / mapProperties.length;
      return [Number(lat.toFixed(5)), Number(lng.toFixed(5))];
    }
    return MOSCOW_CENTER;
  }, [mapProperties, state.mapBounds, state.searchInMap]);

  const renderPlacemark = (property: PropertyCardData) => {
    const badgeContent = buildBadgeContent(property);
    const balloon = buildBalloonContent(property);
    return (
      <Placemark
        key={property.id}
        geometry={[property.coordinates.lat, property.coordinates.lng]}
        properties={{
          iconContent: badgeContent,
          balloonContent: balloon,
          hintContent: `${property.title} — ${formatCompactPrice(property.price)}`,
        }}
        options={{
          iconLayout: 'default#imageWithContent',
          hideIconOnBalloonOpen: false,
          balloonPanelMaxMapArea: 0,
        }}
        modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
      />
    );
  };

  const syncBoundsFromMap = useCallback(
    (bounds: number[][] | null | undefined, { shouldToggleSearch }: { shouldToggleSearch: boolean }) => {
      if (!bounds || bounds.length !== 2) return;
      const [[southLat, westLng], [northLat, eastLng]] = bounds;
      const normalized: MapBounds = {
        southWest: { lat: southLat, lng: westLng },
        northEast: { lat: northLat, lng: eastLng },
      };
      setMapBounds(normalized);
      if (shouldToggleSearch) {
        setSearchInMap(true);
      }
    },
    [setMapBounds, setSearchInMap],
  );

  const handleActionEnd = useCallback(
    (event?: any) => {
      const actionType = event?.get?.('type');
      if (actionType && actionType !== 'drag') {
        return;
      }
      if (!mapRef.current) return;
      if (ignoreActionRef.current) {
        ignoreActionRef.current = false;
        return;
      }
      const bounds = mapRef.current.getBounds();
      if (!bounds) return;
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
      actionTimeoutRef.current = setTimeout(() => {
        syncBoundsFromMap(bounds, { shouldToggleSearch: true });
      }, 500);
    },
    [syncBoundsFromMap],
  );

  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!state.searchInMap) {
      ignoreActionRef.current = true;
      mapRef.current.setCenter(MOSCOW_CENTER, MAP_ZOOM, { duration: 300 });
      setTimeout(() => {
        const bounds = mapRef.current?.getBounds();
        if (bounds) {
          syncBoundsFromMap(bounds, { shouldToggleSearch: false });
        }
      }, 350);
    }
  }, [state.searchInMap, syncBoundsFromMap]);

  const showApiKeyWarning = !apiKey;

  if (showApiKeyWarning) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white/80 p-6 text-center text-sm text-neutral-600 lg:h-[calc(100vh-140px)]">
        <p className="font-semibold text-neutral-800">Требуется API-ключ Яндекс.Карт</p>
        <p className="mt-2 max-w-sm">
          Добавьте значение переменной <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_YANDEX_MAPS_KEY</code> в файле
          <code className="rounded bg-neutral-100 px-1">.env.local</code>, чтобы отобразить карту.
        </p>
      </div>
    );
  }

  const containerBorder = state.searchInMap ? 'border-2 border-[#0066FF]' : 'border border-neutral-100';
  const showSkeleton = !isMapReady;
  const isDataLoading = isLoading && mapProperties.length === 0;
  const shouldShowEmptyState = !isDataLoading && mapProperties.length === 0;
  const overlaySkeleton = showSkeleton && !isDataLoading && !shouldShowEmptyState;

  return (
    <div className="rounded-3xl bg-white/90 p-4 shadow-xl">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Карта</p>
        <h2 className="text-xl font-semibold text-neutral-900">Объекты BROKS</h2>
        <p className="text-sm text-neutral-500">
          {state.searchInMap ? 'Фильтр по текущей области карты' : 'Исследуйте предложения на карте Москвы'}
        </p>
      </div>
      <div
        className={`relative h-[400px] w-full overflow-hidden rounded-2xl bg-white lg:h-[calc(100vh-140px)] ${containerBorder}`}
        aria-busy={overlaySkeleton || isDataLoading}
      >
        {overlaySkeleton && <MapSkeleton className="absolute inset-0 z-10" />}
        {isDataLoading ? (
          <MapSkeleton />
        ) : shouldShowEmptyState ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-neutral-500">
            <p>Нет объектов с координатами для текущих фильтров</p>
          </div>
        ) : (
          <YMaps query={query}>
            <div className={`h-full w-full ${overlaySkeleton ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
              <Map
                width="100%"
                height="100%"
                defaultState={{
                  center,
                  zoom: MAP_ZOOM,
                  controls: [],
                }}
                onLoad={() => setIsMapReady(true)}
                options={{ suppressMapOpenBlock: true }}
                modules={['control.ZoomControl', 'control.GeolocationControl']}
                instanceRef={(ref) => {
                  if (!ref) return;
                  mapRef.current = ref;
                  setIsMapReady(true);
                  const bounds = ref.getBounds();
                  if (bounds) {
                    syncBoundsFromMap(bounds, { shouldToggleSearch: false });
                  }
                }}
                onActionEnd={handleActionEnd}
              >
                <ZoomControl options={{ position: { right: 16, top: 16 } }} />
                <GeolocationControl options={{ position: { right: 16, top: 72 } }} />
                {mapProperties.length > 50 ? (
                  <Clusterer
                    options={{
                      preset: 'islands#invertedBlueClusterIcons',
                      groupByCoordinates: false,
                      clusterDisableClickZoom: false,
                    }}
                  >
                    {mapProperties.map((property) => renderPlacemark(property))}
                  </Clusterer>
                ) : (
                  mapProperties.map((property) => renderPlacemark(property))
                )}
              </Map>
            </div>
          </YMaps>
        )}
      </div>
    </div>
  );
}
