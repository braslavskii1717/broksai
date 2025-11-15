import type { DealMode } from '@/context/PropertyFeedContext';

export type NaturalLanguageSearchResult = {
  query?: string;
  cityName?: string;
  cityId?: number;
  dealType?: DealMode;
  propertyTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  rooms?: string[];
  tags?: string[];
  floorMin?: number | null;
  floorMax?: number | null;
};
