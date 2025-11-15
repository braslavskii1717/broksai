'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { CityProvider } from '@/context/CityContext';
import { PropertyFeedProvider } from '@/context/PropertyFeedContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { CollectionsProvider } from '@/features/collections/context/CollectionsContext';
import { FavoritesProvider } from '@/features/favorites/context/FavoritesContext';
import { DownloadsProvider } from '@/features/downloads/context/DownloadsContext';

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <CollectionsProvider>
          <DownloadsProvider>
            <FavoritesProvider>
              <CityProvider>
                <PropertyFeedProvider>{children}</PropertyFeedProvider>
              </CityProvider>
            </FavoritesProvider>
          </DownloadsProvider>
        </CollectionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
