/**
 * Tuple describing numeric boundaries, e.g. `[min, max]`.
 */
export type NumericRange = [number, number];

export type SortBy = 'price' | 'area' | 'rooms' | 'pricePerMeter' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

/**
 * All supported query parameters for the property search endpoint.
 * Every field is optional because users can combine filters in arbitrary ways.
 */
export interface SearchFilters {
  /** Полнотекстовый запрос по названию, адресу или описанию. */
  query?: string;

  // Price filters
  priceMin?: number;
  priceMax?: number;
  pricePerMeterMin?: number;
  pricePerMeterMax?: number;

  // Property characteristics
  rooms?: number;
  roomsMin?: number;
  roomsMax?: number;
  areaMin?: number;
  areaMax?: number;

  // Location filters
  city?: string;
  district?: string;

  // Categories
  propertyType?: string | string[];
  dealType?: string | string[];
  status?: string | string[];

  // Sorting & pagination
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  limit?: number;
  offset?: number;
}

/**
 * Shape of validation constraints that middleware can apply to numeric filters.
 */
export interface RangeValidationRule {
  min: number;
  max: number;
  /** Default value to apply when the filter is omitted. */
  default?: number;
}

export interface FilterValidationRules {
  priceMin?: RangeValidationRule;
  priceMax?: RangeValidationRule;
  pricePerMeterMin?: RangeValidationRule;
  pricePerMeterMax?: RangeValidationRule;
  rooms?: RangeValidationRule;
  roomsMin?: RangeValidationRule;
  roomsMax?: RangeValidationRule;
  areaMin?: RangeValidationRule;
  areaMax?: RangeValidationRule;
  limit?: RangeValidationRule;
  offset?: RangeValidationRule;
}

/**
 * Element stored in the "applied filters" section of the UI or API response.
 */
export interface AppliedFilter {
  name: string;
  value: string | number | NumericRange | string[];
  /** Human readable value, e.g. "от 10 до 15 млн ₽". */
  displayValue?: string;
}

/**
 * Aggregated list of values that the UI can render as filter options.
 */
export interface AvailableFilters {
  cities: string[];
  districts: string[];
  propertyTypes: string[];
  dealTypes: string[];
  statuses: string[];
  priceRange: NumericRange;
  roomsRange: NumericRange;
  areaRange: NumericRange;
  pricePerMeterRange?: NumericRange;
}

export interface SearchResponse<T = any> {
  results: T[];
  total: number;
  filteredTotal: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    appliedFilters: AppliedFilter[];
    availableOptions: AvailableFilters;
  };
  metadata: {
    query?: string;
    /** Время отклика API в миллисекундах. */
    responseTimeMs: number;
    /** RFC 3339 timestamp used for debugging кеша и релевантности данных. */
    generatedAt: string;
  };
}
