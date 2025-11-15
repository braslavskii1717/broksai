'use client';

import { createContext, useContext, useMemo, useReducer } from 'react';
import { createDefaultFilters, type PropertyFilters } from '@/domain/filters';
import type { MapBounds } from '@/domain/map';

export type DealMode = 'buy' | 'rent';

export type PropertyFeedState = {
  query: string;
  dealType: DealMode;
  limit: number;
  filters: PropertyFilters;
  searchInMap: boolean;
  mapBounds: MapBounds | null;
};

type Action =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_DEAL_TYPE'; payload: DealMode }
  | { type: 'SET_LIMIT'; payload: number }
  | { type: 'UPDATE_FILTERS'; payload: Partial<PropertyFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_SEARCH_IN_MAP'; payload: boolean }
  | { type: 'SET_MAP_BOUNDS'; payload: MapBounds | null };

const createInitialState = (): PropertyFeedState => ({
  query: '',
  dealType: 'buy',
  limit: 6,
  filters: createDefaultFilters(),
  searchInMap: false,
  mapBounds: null,
});

function reducer(state: PropertyFeedState, action: Action): PropertyFeedState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_DEAL_TYPE':
      return { ...state, dealType: action.payload };
    case 'SET_LIMIT':
      return { ...state, limit: action.payload };
    case 'UPDATE_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: createDefaultFilters(), searchInMap: false, mapBounds: null };
    case 'SET_SEARCH_IN_MAP':
      return {
        ...state,
        searchInMap: action.payload,
        mapBounds: action.payload ? state.mapBounds : null,
      };
    case 'SET_MAP_BOUNDS':
      return { ...state, mapBounds: action.payload };
    default:
      return state;
  }
}

const PropertyFeedContext = createContext<{
  state: PropertyFeedState;
  setQuery: (value: string) => void;
  setDealType: (value: DealMode) => void;
  setLimit: (value: number) => void;
  updateFilters: (patch: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
  setSearchInMap: (value: boolean) => void;
  setMapBounds: (bounds: MapBounds | null) => void;
} | null>(null);

export function PropertyFeedProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const value = useMemo(
    () => ({
      state,
      setQuery: (value: string) => dispatch({ type: 'SET_QUERY', payload: value }),
      setDealType: (value: DealMode) => dispatch({ type: 'SET_DEAL_TYPE', payload: value }),
      setLimit: (value: number) => dispatch({ type: 'SET_LIMIT', payload: value }),
      updateFilters: (patch: Partial<PropertyFilters>) => dispatch({ type: 'UPDATE_FILTERS', payload: patch }),
      resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
      setSearchInMap: (value: boolean) => dispatch({ type: 'SET_SEARCH_IN_MAP', payload: value }),
      setMapBounds: (bounds: MapBounds | null) => dispatch({ type: 'SET_MAP_BOUNDS', payload: bounds }),
    }),
    [state],
  );

  return <PropertyFeedContext.Provider value={value}>{children}</PropertyFeedContext.Provider>;
}

export function usePropertyFeedContext() {
  const context = useContext(PropertyFeedContext);
  if (!context) {
    throw new Error('usePropertyFeedContext must be used within PropertyFeedProvider');
  }
  return context;
}
