'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuthGuard } from '@/features/auth/hooks/useAuthGuard';

type FavoritesContextValue = {
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { requireAuth, isAuthenticated } = useAuthGuard();

  const baseToggle = useCallback((listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [listingId, ...prev],
    );
  }, []);

  const toggleFavorite = useMemo(
    () =>
      requireAuth(baseToggle, () => {
        alert('Пожалуйста, авторизуйтесь, чтобы сохранять объекты в избранное');
      }),
    [requireAuth, baseToggle],
  );

  const isFavorite = useCallback((listingId: string) => favorites.includes(listingId), [favorites]);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
