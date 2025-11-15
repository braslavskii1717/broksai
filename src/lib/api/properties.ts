import type { DealMode } from '@/context/PropertyFeedContext';
import type { PropertyCardData } from '@/data/mockProperties';
import type { PropertyFilters } from '@/domain/filters';
import type { MapBounds } from '@/domain/map';
import { propertyImagePlaceholder } from '@/lib/imagePlaceholders';
import { queryProperties } from '@/services/propertyRepository';
import { apiFetch } from './client';

export type PropertyListResponse = {
  data: PropertyCardData[];
  meta: {
    total: number;
    cityId: number | null;
  };
};

export type PropertyListParams = {
  cityId?: number;
  dealType?: DealMode;
  limit?: number;
  search?: string;
  filters?: PropertyFilters;
  mapBounds?: MapBounds;
};

type PropertyApiPayload = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  address?: string;
  district?: string;
  city?: string;
  cityId?: number;
  status?: string;
  price?: number;
  pricePerMeter?: number;
  rooms?: string;
  roomsCount?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  livingArea?: number;
  kitchenArea?: number;
  floor?: string;
  floorNumber?: number;
  totalFloors?: number;
  dealType?: string;
  propertyType?: string;
  images?: string[];
  image?: string;
  coverImage?: string;
  amenities?: string[];
  houseType?: string;
  condition?: string;
  hasPhotos?: boolean;
  hasVideo?: boolean;
  hasVirtualTour?: boolean;
  onlineShowing?: boolean;
  mortgage?: boolean;
  installment?: boolean;
  newBuilding?: boolean;
  developer?: string;
  view?: string;
  parkingType?: string;
  petFriendly?: boolean;
  accessibilityFriendly?: boolean;
  metroDistance?: number;
  metroName?: string;
  metroLine?: string;
  coordinates?: { lat?: number; lng?: number };
  publishedAt?: string | Date;
  highlights?: string[];
  tags?: string[];
  state?: string;
  buildYear?: number;
  ceilingHeight?: number;
  hasParking?: boolean;
};

type PropertyListApiResponse = {
  data: PropertyApiPayload[];
  meta: {
    total: number;
    cityId: number | null;
  };
};

const SAFE_COORDINATES = { lat: 55.751244, lng: 37.618423 };
const propertyTypeOptions: PropertyCardData['propertyType'][] = ['apartment', 'house', 'penthouse', 'loft', 'townhouse'];
const houseTypeOptions: PropertyCardData['houseType'][] = ['brick', 'panel', 'monolith', 'timber'];
const conditionOptions: PropertyCardData['condition'][] = ['shell', 'cosmetic', 'euro', 'designer'];
const parkingOptions: PropertyCardData['parkingType'][] = ['underground', 'yard', 'covered', 'guest'];
const viewOptions: PropertyCardData['view'][] = ['park', 'river', 'city', 'courtyard', 'forest'];

const pickFrom = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

function pickPrimaryImage(payload: PropertyApiPayload) {
  const candidate = [payload.image, payload.coverImage, payload.images?.[0]].find(
    (src) => typeof src === 'string' && src.trim().length > 0,
  );
  return candidate ?? propertyImagePlaceholder;
}

function normalizePropertyData(payload: PropertyApiPayload): PropertyCardData {
  const id = (payload.id ?? payload._id ?? '').toString() || `property-${Math.random().toString(36).slice(2, 10)}`;
  const primaryImage = pickPrimaryImage(payload);
  const gallery = payload.images && payload.images.length ? payload.images : [primaryImage];
  const parsedRooms = payload.rooms ? Number(payload.rooms) : undefined;
  const roomsCount = payload.roomsCount ?? (Number.isFinite(parsedRooms) ? Number(parsedRooms) : undefined) ?? 0;
  const fallbackRoomsLabel = roomsCount === 0 ? 'Студия' : Number.isFinite(roomsCount) ? String(roomsCount) : '—';
  const roomsLabel = payload.rooms ?? fallbackRoomsLabel;
  const rawFloor = payload.floor ?? '';
  const floorSegments = rawFloor.includes('/') ? rawFloor.split('/') : null;
  const parsedFloorNumber = floorSegments ? Number(floorSegments[0]) : Number(rawFloor);
  const parsedTotalFloors = floorSegments ? Number(floorSegments[1]) : undefined;
  const derivedFloorNumber =
    payload.floorNumber ?? (Number.isFinite(parsedFloorNumber) ? parsedFloorNumber : undefined);
  const derivedTotalFloors =
    payload.totalFloors ?? (Number.isFinite(parsedTotalFloors) ? parsedTotalFloors : undefined);
  const floorLabel =
    rawFloor ||
    (derivedTotalFloors ? `${derivedFloorNumber ?? 0}/${derivedTotalFloors}` : derivedFloorNumber?.toString() ?? '—');
  const area = payload.area ?? 0;
  const price = payload.price ?? 0;
  const pricePerMeter = payload.pricePerMeter ?? (area ? Math.round(price / area) : 0);
  const description =
    payload.description ??
    `Объект «${payload.title ?? 'Без названия'}» готов к показу. Уточните детали у консультанта BROKS.`;
  const amenities = Array.isArray(payload.amenities) ? payload.amenities : [];
  const highlights = Array.isArray(payload.highlights) ? payload.highlights : [];
  const tags = Array.isArray(payload.tags) ? payload.tags : [];
  const publishedAt =
    typeof payload.publishedAt === 'string'
      ? payload.publishedAt
      : payload.publishedAt instanceof Date
        ? payload.publishedAt.toISOString()
        : new Date().toISOString();
  const coordinates =
    payload.coordinates && typeof payload.coordinates.lat === 'number' && typeof payload.coordinates.lng === 'number'
      ? { lat: payload.coordinates.lat, lng: payload.coordinates.lng }
      : SAFE_COORDINATES;
  const dealType: DealMode = payload.dealType === 'rent' ? 'rent' : 'buy';
  const propertyType = pickFrom(payload.propertyType, propertyTypeOptions, 'apartment');
  const houseType = pickFrom(payload.houseType, houseTypeOptions, 'monolith');
  const condition = pickFrom(payload.condition, conditionOptions, 'euro');
  const parkingType = pickFrom(payload.parkingType, parkingOptions, 'guest');
  const view = pickFrom(payload.view, viewOptions, 'city');
  const buildYear =
    payload.buildYear ??
    (() => {
      const date = new Date(publishedAt);
      return Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
    })();
  const ceilingHeight = payload.ceilingHeight ?? 3;
  const hasParking = payload.hasParking ?? parkingType !== 'guest';
  const badges: string[] = [];
  if (payload.newBuilding) badges.push('Новостройка');
  if (payload.hasVirtualTour) badges.push('3D-тур');
  if (payload.hasVideo) badges.push('Видео');

  return {
    id,
    title: payload.title ?? 'Объект BROKS',
    address: payload.address ?? 'Адрес уточняется',
    district: payload.district ?? 'Центральный',
    city: payload.city ?? 'Москва',
    cityId: payload.cityId ?? 1,
    price,
    pricePerMeter,
    rooms: roomsLabel,
    roomsCount,
    bedrooms: payload.bedrooms ?? Math.max(roomsCount - 1, 1),
    bathrooms: payload.bathrooms ?? Math.max(1, Math.min(roomsCount || 1, 3)),
    area,
    livingArea: payload.livingArea ?? Math.round(area * 0.7),
    kitchenArea: payload.kitchenArea ?? Math.round(area * 0.2),
    floor: floorLabel,
    floorNumber: derivedFloorNumber ?? 0,
    totalFloors: derivedTotalFloors ?? derivedFloorNumber ?? 0,
    image: primaryImage,
    images: gallery,
    badges: badges.length ? badges : undefined,
    tags,
    dealType,
    propertyType,
    description,
    highlights,
    amenities,
    hasPhotos: payload.hasPhotos ?? gallery.length > 0,
    hasVideo: payload.hasVideo ?? false,
    hasVirtualTour: payload.hasVirtualTour ?? false,
    onlineShowing: payload.onlineShowing ?? false,
    mortgage: payload.mortgage ?? false,
    installment: payload.installment ?? false,
    newBuilding: payload.newBuilding ?? false,
    developer: payload.developer ?? 'BROKS',
    condition,
    state: payload.state ?? 'Готов к показу',
    houseType,
    buildYear,
    ceilingHeight,
    hasParking,
    parkingType,
    view,
    petFriendly: payload.petFriendly ?? true,
    accessibilityFriendly: payload.accessibilityFriendly ?? false,
    metroDistance: payload.metroDistance ?? 0,
    metroLine: payload.metroLine ?? '',
    metroName: payload.metroName ?? '',
    coordinates,
    publishedAt,
  };
}

export async function fetchProperties(params: PropertyListParams) {
  const searchParams = new URLSearchParams();
  if (params.cityId) searchParams.set('cityId', String(params.cityId));
  if (params.dealType) searchParams.set('dealType', params.dealType);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.filters) {
    searchParams.set('filters', JSON.stringify(params.filters));
  }
  if (params.mapBounds) {
    searchParams.set('searchInMap', 'true');
    searchParams.set('mapBounds', JSON.stringify(params.mapBounds));
  }
  const qs = searchParams.toString();
  const url = qs ? `/api/properties?${qs}` : '/api/properties';
  try {
    const response = await apiFetch<PropertyListApiResponse>(url);
    return {
      data: response.data.map(normalizePropertyData),
      meta: response.meta,
    };
  } catch (error) {
    console.warn('[api] fetchProperties fallback to mock data', error);
    const fallback = queryProperties({
      cityId: params.cityId,
      dealType: params.dealType,
        limit: params.limit,
        search: params.search,
        filters: params.filters,
        mapBounds: params.mapBounds,
      });
    return {
      data: fallback.data,
      meta: {
        total: fallback.total,
        cityId: params.cityId ?? null,
      },
    };
  }
}

export function fetchProperty(id: string) {
  return apiFetch<{ data: PropertyApiPayload }>(`/api/properties/${id}`).then((response) => ({
    data: normalizePropertyData(response.data),
  }));
}
