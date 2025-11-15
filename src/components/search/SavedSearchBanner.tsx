'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCity } from '@/context/CityContext';
import { usePropertyFeedContext } from '@/context/PropertyFeedContext';
import { countActiveFilters } from '@/lib/filterUtils';
import { Button } from '@/components/ui/Button';
import { SavedSearchSkeleton } from '@/components/skeletons/SavedSearchSkeleton';

const storageKey = 'broks:saved-searches';

type SavedSearch = {
  id: string;
  name: string;
  createdAt: string;
  cityId: number;
  payload: {
    query: string;
    dealType: string;
    filters: unknown;
  };
};

export function SavedSearchBanner() {
  const { city } = useCity();
  const { state } = usePropertyFeedContext();
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const activeFiltersCount = useMemo(() => countActiveFilters(state.filters), [state.filters]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        setItems([]);
      }
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <SavedSearchSkeleton />;
  }

  const saveSearch = () => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
    const name = `${city.name} — ${state.dealType === 'buy' ? 'покупка' : 'аренда'}${state.query ? ` · ${state.query}` : ''}`;
    const next: SavedSearch = {
      id,
      name,
      createdAt: new Date().toISOString(),
      cityId: city.id,
      payload: { query: state.query, dealType: state.dealType, filters: state.filters },
    };
    const updated = [next, ...items].slice(0, 5);
    setItems(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
    setStatus('Подборка сохранена');
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <section className="rounded-3xl bg-white/90 p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Сохранённые поиски</p>
          <h2 className="text-xl font-semibold text-neutral-900">{city.name}: {state.dealType === 'buy' ? 'Покупка' : 'Аренда'}</h2>
          <p className="text-sm text-neutral-500">{items.length} подборок · {activeFiltersCount} активных фильтров</p>
        </div>
        <Button onClick={saveSearch}>Сохранить подборку</Button>
      </div>
      {items.length ? (
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-600">
          {items.slice(0, 3).map((item) => (
            <span key={item.id} className="rounded-full bg-neutral-100 px-4 py-1">
              {item.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">Здесь появятся сохранённые сценарии поиска и уведомления.</p>
      )}
      {status ? <p className="mt-3 text-sm text-green-600">{status}</p> : null}
    </section>
  );
}
