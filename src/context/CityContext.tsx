'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { City } from '@/data/cities';
import { russianCities } from '@/data/cities';

type CityContextValue = {
  city: City;
  setCity: (next: City) => void;
};

const CityContext = createContext<CityContextValue | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCity] = useState<City>(russianCities[0]);
  const value = useMemo(() => ({ city, setCity }), [city]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within CityProvider');
  }
  return context;
}
