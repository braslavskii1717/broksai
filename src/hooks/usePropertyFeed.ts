'use client';

import { useQuery } from '@tanstack/react-query';
import { useCity } from '@/context/CityContext';
import { usePropertyFeedContext } from '@/context/PropertyFeedContext';
import { fetchProperties } from '@/lib/api/properties';

export function usePropertyFeed() {
  const { city } = useCity();
  const { state } = usePropertyFeedContext();
  const filtersKey = JSON.stringify(state.filters);
  const boundsKey = state.mapBounds ? JSON.stringify(state.mapBounds) : 'null';

  const query = useQuery({
    queryKey: ['properties', city.id, state.dealType, state.query, state.limit, filtersKey, boundsKey, state.searchInMap],
    queryFn: () =>
      fetchProperties({
        cityId: city.id,
        dealType: state.dealType,
        search: state.query,
        limit: state.limit,
        filters: state.filters,
        mapBounds: state.searchInMap ? state.mapBounds ?? undefined : undefined,
      }),
  });

  return {
    ...query,
    properties: query.data?.data ?? [],
    total: query.data?.meta.total ?? 0,
  };
}
