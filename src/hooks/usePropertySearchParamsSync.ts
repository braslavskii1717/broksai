'use client';

import type { Route } from 'next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { usePropertyFeedContext, type DealMode } from '@/context/PropertyFeedContext';
import { createDefaultFilters, type PropertyFilters } from '@/domain/filters';
import type { MapBounds } from '@/domain/map';
import { useCity } from '@/context/CityContext';
import { russianCities } from '@/data/cities';

const numericFilterKeys: Array<
  | 'priceMin'
  | 'priceMax'
  | 'pricePerMeterMin'
  | 'pricePerMeterMax'
  | 'totalAreaMin'
  | 'totalAreaMax'
  | 'livingAreaMin'
  | 'livingAreaMax'
  | 'kitchenAreaMin'
  | 'kitchenAreaMax'
  | 'floorMin'
  | 'floorMax'
  | 'buildYearMin'
  | 'buildYearMax'
  | 'metroDistanceMax'
> = [
  'priceMin',
  'priceMax',
  'pricePerMeterMin',
  'pricePerMeterMax',
  'totalAreaMin',
  'totalAreaMax',
  'livingAreaMin',
  'livingAreaMax',
  'kitchenAreaMin',
  'kitchenAreaMax',
  'floorMin',
  'floorMax',
  'buildYearMin',
  'buildYearMax',
  'metroDistanceMax',
];

const booleanFilterKeys: Array<
  | 'hasPhotos'
  | 'hasVideo'
  | 'hasVirtualTour'
  | 'onlineShowing'
  | 'mortgage'
  | 'installment'
  | 'newBuilding'
  | 'petFriendly'
  | 'accessibilityFriendly'
  | 'excludeFirstFloor'
  | 'excludeTopFloor'
> = [
  'hasPhotos',
  'hasVideo',
  'hasVirtualTour',
  'onlineShowing',
  'mortgage',
  'installment',
  'newBuilding',
  'petFriendly',
  'accessibilityFriendly',
  'excludeFirstFloor',
  'excludeTopFloor',
];

const arrayFilterKeys: Array<
  | 'rooms'
  | 'bathrooms'
  | 'propertyTypes'
  | 'houseTypes'
  | 'conditions'
  | 'amenities'
  | 'developers'
  | 'views'
  | 'parking'
> = [
  'rooms',
  'bathrooms',
  'propertyTypes',
  'houseTypes',
  'conditions',
  'amenities',
  'developers',
  'views',
  'parking',
];

const publishedDateKey: keyof PropertyFilters = 'publishedDate';

const BOOLEAN_ALIASES: Record<string, (typeof booleanFilterKeys)[number]> = {
  hasPhoto: 'hasPhotos',
};

const SERIALIZED_KEY_OVERRIDES: Partial<Record<keyof PropertyFilters, string>> = {
  hasPhotos: 'hasPhoto',
};
const DEBOUNCE_DELAY = 300;

type ParsedSearchParams = {
  query: string;
  dealType?: DealMode;
  cityId?: number;
  filters: PropertyFilters;
  searchInMap: boolean;
  mapBounds: MapBounds | null;
};

const defaultFiltersSnapshot = createDefaultFilters();

const isValidPublishedDate = (value: string | null): value is NonNullable<PropertyFilters['publishedDate']> => {
  return value === 'today' || value === 'week' || value === 'month';
};

const parseNumberParam = (value: string | null) => {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseBooleanParam = (value: string | null) => value === 'true' || value === '1';

const parseArrayParam = (value: string | null) => {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const parseSearchParams = (params: URLSearchParams): ParsedSearchParams => {
  const filters = createDefaultFilters();

  numericFilterKeys.forEach((key) => {
    filters[key] = parseNumberParam(params.get(key));
  });

  arrayFilterKeys.forEach((key) => {
    filters[key] = parseArrayParam(params.get(key));
  });

  booleanFilterKeys.forEach((key) => {
    const value = params.get(key);
    filters[key] = value ? parseBooleanParam(value) : false;
  });

  Object.entries(BOOLEAN_ALIASES).forEach(([alias, original]) => {
    const value = params.get(alias);
    if (value) {
      filters[original] = parseBooleanParam(value);
    }
  });

  const publishedDate = params.get(publishedDateKey as string);
  filters[publishedDateKey] = isValidPublishedDate(publishedDate) ? publishedDate : null;

  const query = params.get('q') ?? '';
  const dealType = params.get('dealType');
  const cityParam = params.get('city');

  let cityId: number | undefined;
  if (cityParam) {
    const numericId = Number(cityParam);
    if (Number.isFinite(numericId)) {
      cityId = numericId;
    } else {
      const normalized = decodeURIComponent(cityParam).toLowerCase();
      const match = russianCities.find((entry) => entry.name.toLowerCase() === normalized);
      cityId = match?.id;
    }
  }

  const searchInMap = params.get('searchInMap') === 'true';
  let mapBounds: MapBounds | null = null;
  const mapBoundsParam = params.get('mapBounds');
  if (searchInMap && mapBoundsParam) {
    try {
      mapBounds = JSON.parse(mapBoundsParam) as MapBounds;
    } catch {
      mapBounds = null;
    }
  }

  return {
    query,
    dealType: dealType === 'buy' || dealType === 'rent' ? (dealType as DealMode) : undefined,
    cityId,
    filters,
    searchInMap: searchInMap && Boolean(mapBounds),
    mapBounds,
  };
};

const serializeArray = (value: string[]) => value.join(',');

const serializeFilters = (filters: PropertyFilters, params: URLSearchParams) => {
  numericFilterKeys.forEach((key) => {
    const value = filters[key];
    if (value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });

  arrayFilterKeys.forEach((key) => {
    const value = filters[key];
    if (value.length) {
      params.set(key, serializeArray(value));
    }
  });

  booleanFilterKeys.forEach((key) => {
    if (filters[key]) {
      const paramKey = SERIALIZED_KEY_OVERRIDES[key] ?? key;
      params.set(paramKey, 'true');
    }
  });

  if (filters[publishedDateKey]) {
    params.set(publishedDateKey as string, String(filters[publishedDateKey]));
  }
};

const buildSearchParamsFromState = (
  state: { query: string; dealType: DealMode; filters: PropertyFilters; searchInMap: boolean; mapBounds: MapBounds | null },
  cityName: string,
) => {
  const params = new URLSearchParams();
  if (state.query.trim()) {
    params.set('q', state.query.trim());
  }
  params.set('dealType', state.dealType);
  params.set('city', cityName.toLowerCase());

  serializeFilters(state.filters, params);
  if (state.searchInMap && state.mapBounds) {
    params.set('searchInMap', 'true');
    params.set('mapBounds', JSON.stringify(state.mapBounds));
  }
  return params;
};

const isEqualArray = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

const isDefaultFilters = (filters: PropertyFilters) => {
  return (
    numericFilterKeys.every((key) => filters[key] === defaultFiltersSnapshot[key]) &&
    arrayFilterKeys.every((key) => isEqualArray(filters[key], defaultFiltersSnapshot[key])) &&
    booleanFilterKeys.every((key) => filters[key] === defaultFiltersSnapshot[key]) &&
    filters[publishedDateKey] === defaultFiltersSnapshot[publishedDateKey]
  );
};

export function usePropertySearchParamsSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const { state, setQuery, setDealType, updateFilters, setSearchInMap, setMapBounds } = usePropertyFeedContext();
  const { city, setCity } = useCity();
  const [isReady, setIsReady] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const parsed = parseSearchParams(new URLSearchParams(searchParamsString));

    if (parsed.dealType && parsed.dealType !== state.dealType) {
      setDealType(parsed.dealType);
    }
    if (parsed.query !== state.query) {
      setQuery(parsed.query);
    }

    if (typeof parsed.cityId === 'number' && parsed.cityId !== city.id) {
      const match = russianCities.find((entry) => entry.id === parsed.cityId);
      if (match) {
        setCity(match);
      }
    }

    const filtersPatch: Partial<PropertyFilters> = {};
    (Object.keys(parsed.filters) as Array<keyof PropertyFilters>).forEach((key) => {
      const nextValue = parsed.filters[key];
      const currentValue = state.filters[key];
      if (Array.isArray(nextValue) && Array.isArray(currentValue)) {
        if (!isEqualArray(nextValue, currentValue)) {
          (filtersPatch as Record<string, unknown>)[key] = nextValue;
        }
      } else if (nextValue !== currentValue) {
        (filtersPatch as Record<string, unknown>)[key] = nextValue;
      }
    });

    if (Object.keys(filtersPatch).length) {
      updateFilters(filtersPatch);
    }

    if (parsed.searchInMap !== state.searchInMap) {
      setSearchInMap(parsed.searchInMap);
    }
    if (parsed.mapBounds && JSON.stringify(parsed.mapBounds) !== JSON.stringify(state.mapBounds)) {
      setMapBounds(parsed.mapBounds);
    } else if (!parsed.mapBounds && state.mapBounds) {
      setMapBounds(null);
    }
    setIsReady(true);
  }, [
    city.id,
    searchParamsString,
    setCity,
    setDealType,
    setMapBounds,
    setQuery,
    setSearchInMap,
    state.dealType,
    state.filters,
    state.mapBounds,
    state.query,
    state.searchInMap,
    updateFilters,
  ]);

  const serializedParams = useMemo(() => {
    const params = buildSearchParamsFromState(
      {
        query: state.query,
        dealType: state.dealType,
        filters: state.filters,
        searchInMap: state.searchInMap,
        mapBounds: state.mapBounds,
      },
      city.name,
    );
    if (state.query.trim() === '' && isDefaultFilters(state.filters)) {
      params.delete('q');
    }
    return params.toString();
  }, [city.name, state]);

  useEffect(() => {
    if (!isReady) return;
    if (serializedParams === searchParamsString) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const nextUrl = serializedParams ? `${pathname}?${serializedParams}` : pathname;
      router.push(nextUrl as Route, { scroll: false });
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isReady, pathname, router, searchParamsString, serializedParams]);
}
