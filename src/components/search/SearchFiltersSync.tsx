'use client';

import { usePropertySearchParamsSync } from '@/hooks/usePropertySearchParamsSync';

export function SearchFiltersSync() {
  usePropertySearchParamsSync();
  return null;
}
