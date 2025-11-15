import type { City } from '@/data/cities';
import { apiFetch } from './client';

export function fetchCities() {
  return apiFetch<{ data: City[] }>('/api/cities');
}
