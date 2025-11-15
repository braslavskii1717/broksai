'use client';

import { createContext, useCallback, useContext } from 'react';
import type { Collection } from '@/domain/listings';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type CollectionsContextValue = {
  collections: Collection[];
  createCollection: (name: string, ownerId: string) => void;
  deleteCollection: (id: string) => void;
  addListingToCollection: (collectionId: string, listingId: string) => void;
  removeListingFromCollection: (collectionId: string, listingId: string) => void;
  getUserCollections: (userId: string) => Collection[];
};

const CollectionsContext = createContext<CollectionsContextValue | null>(null);

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useLocalStorage<Collection[]>('broks:collections', []);

  const createCollection = useCallback((name: string, ownerId: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCollections((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ownerId,
        name: trimmed,
        listings: [],
        createdAt: new Date().toISOString(),
      },
    ]);
  }, [setCollections]);

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => prev.filter((collection) => collection.id !== id));
  }, [setCollections]);

  const addListingToCollection = useCallback((collectionId: string, listingId: string) => {
    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.id !== collectionId) return collection;
        if (collection.listings.includes(listingId)) return collection;
        return { ...collection, listings: [...collection.listings, listingId] };
      }),
    );
  }, [setCollections]);

  const removeListingFromCollection = useCallback((collectionId: string, listingId: string) => {
    setCollections((prev) =>
      prev.map((collection) =>
        collection.id === collectionId
          ? { ...collection, listings: collection.listings.filter((id) => id !== listingId) }
          : collection,
      ),
    );
  }, [setCollections]);

  const getUserCollections = useCallback(
    (userId: string) => collections.filter((collection) => collection.ownerId === userId),
    [collections],
  );

  return (
    <CollectionsContext.Provider
      value={{ collections, createCollection, deleteCollection, addListingToCollection, removeListingFromCollection, getUserCollections }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollections must be used within CollectionsProvider');
  }
  return context;
}
