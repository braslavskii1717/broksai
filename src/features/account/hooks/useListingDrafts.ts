'use client';

import { useCallback, useEffect, useState } from 'react';

export type ListingDraft = {
  id: string;
  title: string;
  city: string;
  price: number;
  area: number;
  createdAt: string;
};

const STORAGE_KEY = 'broks.listingDrafts';

export type ListingDraftInput = {
  title: string;
  city: string;
  price: number;
  area: number;
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `draft-${Math.random().toString(36).slice(2, 10)}`;
};

export function useListingDrafts() {
  const [drafts, setDrafts] = useState<ListingDraft[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ListingDraft[];
      setDrafts(Array.isArray(parsed) ? parsed : []);
    } catch {
      setDrafts([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts]);

  const addDraft = useCallback((input: ListingDraftInput) => {
    setDrafts((prev) => [
      {
        id: generateId(),
        title: input.title.trim(),
        city: input.city.trim(),
        price: input.price,
        area: input.area,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const removeDraft = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  }, []);

  return { drafts, addDraft, removeDraft };
}
