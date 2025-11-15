import type { PropertyFilters } from '@/domain/filters';

export function countActiveFilters(filters: PropertyFilters) {
  return Object.entries(filters).reduce((total, [, value]) => {
    if (Array.isArray(value)) {
      return value.length ? total + 1 : total;
    }
    if (typeof value === 'boolean') {
      return value ? total + 1 : total;
    }
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        return value.trim() ? total + 1 : total;
      }
      return total + 1;
    }
    return total;
  }, 0);
}
