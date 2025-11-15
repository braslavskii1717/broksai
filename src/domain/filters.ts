export type PropertyFilters = {
  priceMin: number | null;
  priceMax: number | null;
  pricePerMeterMin: number | null;
  pricePerMeterMax: number | null;
  totalAreaMin: number | null;
  totalAreaMax: number | null;
  livingAreaMin: number | null;
  livingAreaMax: number | null;
  kitchenAreaMin: number | null;
  kitchenAreaMax: number | null;
  rooms: string[];
  bathrooms: string[];
  propertyTypes: string[];
  houseTypes: string[];
  conditions: string[];
  amenities: string[];
  floorMin: number | null;
  floorMax: number | null;
  excludeFirstFloor: boolean;
  excludeTopFloor: boolean;
  buildYearMin: number | null;
  buildYearMax: number | null;
  hasPhotos: boolean;
  hasVideo: boolean;
  hasVirtualTour: boolean;
  onlineShowing: boolean;
  mortgage: boolean;
  installment: boolean;
  newBuilding: boolean;
  developers: string[];
  publishedDate: 'today' | 'week' | 'month' | null;
  petFriendly: boolean;
  accessibilityFriendly: boolean;
  views: string[];
  parking: string[];
  metroDistanceMax: number | null;
};

export function createDefaultFilters(): PropertyFilters {
  return {
    priceMin: null,
    priceMax: null,
    pricePerMeterMin: null,
    pricePerMeterMax: null,
    totalAreaMin: null,
    totalAreaMax: null,
    livingAreaMin: null,
    livingAreaMax: null,
    kitchenAreaMin: null,
    kitchenAreaMax: null,
    rooms: [],
    bathrooms: [],
    propertyTypes: [],
    houseTypes: [],
    conditions: [],
    amenities: [],
    floorMin: null,
    floorMax: null,
    excludeFirstFloor: false,
    excludeTopFloor: false,
    buildYearMin: null,
    buildYearMax: null,
    hasPhotos: false,
    hasVideo: false,
    hasVirtualTour: false,
    onlineShowing: false,
    mortgage: false,
    installment: false,
    newBuilding: false,
    developers: [],
    publishedDate: null,
    petFriendly: false,
    accessibilityFriendly: false,
    views: [],
    parking: [],
    metroDistanceMax: null,
  };
}
