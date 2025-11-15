import { NextResponse } from 'next/server';
import type { DealMode } from '@/context/PropertyFeedContext';
import type { PropertyFilters } from '@/domain/filters';
import { queryProperties } from '@/services/propertyRepository';
import type { MapBounds } from '@/domain/map';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityIdParam = searchParams.get('cityId');
  const dealTypeParam = searchParams.get('dealType');
  const limitParam = searchParams.get('limit');
  const search = searchParams.get('search') ?? undefined;
  const filtersParam = searchParams.get('filters');

  const cityId = cityIdParam ? Number(cityIdParam) : undefined;
  const limit = limitParam ? Number(limitParam) : undefined;
  const dealType = (dealTypeParam as DealMode | null) ?? undefined;
  let filters: PropertyFilters | undefined;
  let mapBounds: MapBounds | undefined;
  if (filtersParam) {
    try {
      filters = JSON.parse(filtersParam) as PropertyFilters;
    } catch {
      filters = undefined;
    }
  }
  const searchInMapParam = searchParams.get('searchInMap');
  const mapBoundsParam = searchParams.get('mapBounds');
  if (searchInMapParam === 'true' && mapBoundsParam) {
    try {
      mapBounds = JSON.parse(mapBoundsParam) as MapBounds;
    } catch {
      mapBounds = undefined;
    }
  }

  const payload = queryProperties({ cityId, dealType, limit, search, filters, mapBounds });

  return NextResponse.json({
    data: payload.data,
    meta: {
      total: payload.total,
      cityId: cityId ?? null,
    },
  });
}
