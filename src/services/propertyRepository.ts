import type { DealMode } from '@/context/PropertyFeedContext';
import type { PropertyCardData } from '@/data/mockProperties';
import { mockProperties } from '@/data/mockProperties';
import type { PropertyFilters } from '@/domain/filters';
import type { MapBounds } from '@/domain/map';

export type PropertyQuery = {
  cityId?: number;
  dealType?: DealMode;
  limit?: number;
  search?: string;
  filters?: PropertyFilters;
  mapBounds?: MapBounds;
};

function matchSearch(property: PropertyCardData, search?: string) {
  if (!search) return true;
  const value = search.trim().toLowerCase();
  if (!value) return true;
  return (
    property.title.toLowerCase().includes(value) ||
    property.address.toLowerCase().includes(value) ||
    property.city.toLowerCase().includes(value)
  );
}

const matchesRange = (value: number, min: number | null, max: number | null) => {
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
};

const matchesArray = (value: string, arr?: string[]) => {
  if (!arr || arr.length === 0) return true;
  return arr.includes(value);
};

const matchesRooms = (roomsCount: number, filters: PropertyFilters) => {
  if (!filters.rooms.length) return true;
  return filters.rooms.some((room) => {
    if (room === 'studio') return roomsCount === 0;
    if (room === '5+') return roomsCount >= 5;
    const parsed = Number(room);
    return roomsCount === parsed;
  });
};

const matchesBathrooms = (bathrooms: number, filters: PropertyFilters) => {
  if (!filters.bathrooms.length) return true;
  return filters.bathrooms.some((value) => {
    if (value === '3+') return bathrooms >= 3;
    return bathrooms === Number(value);
  });
};

const matchesAmenities = (property: PropertyCardData, filters: PropertyFilters) => {
  if (!filters.amenities.length) return true;
  return filters.amenities.every((amenity) => property.amenities.includes(amenity));
};

const matchesBounds = (property: PropertyCardData, bounds?: MapBounds) => {
  if (!bounds) return true;
  const { lat, lng } = property.coordinates;
  return (
    lat >= bounds.southWest.lat &&
    lat <= bounds.northEast.lat &&
    lng >= bounds.southWest.lng &&
    lng <= bounds.northEast.lng
  );
};

const matchesPublishedDate = (property: PropertyCardData, filters: PropertyFilters) => {
  if (!filters.publishedDate) return true;
  const published = new Date(property.publishedAt).getTime();
  const now = Date.now();
  const diffDays = (now - published) / (1000 * 60 * 60 * 24);
  switch (filters.publishedDate) {
    case 'today':
      return diffDays <= 1;
    case 'week':
      return diffDays <= 7;
    case 'month':
      return diffDays <= 30;
    default:
      return true;
  }
};

function matchesFilters(property: PropertyCardData, filters?: PropertyFilters) {
  if (!filters) return true;
  if (!matchesRange(property.price, filters.priceMin, filters.priceMax)) return false;
  if (!matchesRange(property.pricePerMeter, filters.pricePerMeterMin, filters.pricePerMeterMax)) return false;
  if (!matchesRange(property.area, filters.totalAreaMin, filters.totalAreaMax)) return false;
  if (!matchesRange(property.livingArea, filters.livingAreaMin, filters.livingAreaMax)) return false;
  if (!matchesRange(property.kitchenArea, filters.kitchenAreaMin, filters.kitchenAreaMax)) return false;
  if (!matchesRooms(property.roomsCount, filters)) return false;
  if (!matchesBathrooms(property.bathrooms, filters)) return false;
  if (!matchesArray(property.propertyType, filters.propertyTypes)) return false;
  if (!matchesArray(property.houseType, filters.houseTypes)) return false;
  if (!matchesArray(property.condition, filters.conditions)) return false;
  if (!matchesAmenities(property, filters)) return false;
  if (filters.floorMin !== null && property.floorNumber < filters.floorMin) return false;
  if (filters.floorMax !== null && property.floorNumber > filters.floorMax) return false;
  if (filters.excludeFirstFloor && property.floorNumber === 1) return false;
  if (filters.excludeTopFloor && property.floorNumber === property.totalFloors) return false;
  if (!matchesRange(property.buildYear, filters.buildYearMin, filters.buildYearMax)) return false;
  if (filters.hasPhotos && !property.hasPhotos) return false;
  if (filters.hasVideo && !property.hasVideo) return false;
  if (filters.hasVirtualTour && !property.hasVirtualTour) return false;
  if (filters.onlineShowing && !property.onlineShowing) return false;
  if (filters.mortgage && !property.mortgage) return false;
  if (filters.installment && !property.installment) return false;
  if (filters.newBuilding && !property.newBuilding) return false;
  if (filters.developers.length && !filters.developers.includes(property.developer)) return false;
  if (!matchesPublishedDate(property, filters)) return false;
  if (filters.petFriendly && !property.petFriendly) return false;
  if (filters.accessibilityFriendly && !property.accessibilityFriendly) return false;
  if (filters.views.length && !filters.views.includes(property.view)) return false;
  if (filters.parking.length && !filters.parking.includes(property.parkingType)) return false;
  if (filters.metroDistanceMax !== null && property.metroDistance > filters.metroDistanceMax) return false;
  return true;
}

export function queryProperties({ cityId, dealType, limit, search, filters, mapBounds }: PropertyQuery) {
  let items = mockProperties;
  if (cityId) {
    items = items.filter((property) => property.cityId === cityId);
  }
  if (dealType) {
    items = items.filter((property) => property.dealType === dealType);
  }
  items = items.filter(
    (property) => matchSearch(property, search) && matchesFilters(property, filters) && matchesBounds(property, mapBounds),
  );
  const total = items.length;
  if (limit) {
    items = items.slice(0, limit);
  }
  return { data: items, total };
}

export function getPropertyById(id: string) {
  return mockProperties.find((property) => property.id === id) ?? null;
}
