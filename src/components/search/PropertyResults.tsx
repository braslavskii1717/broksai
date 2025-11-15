'use client';

import { useEffect } from 'react';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePropertyFeed } from '@/hooks/usePropertyFeed';
import { usePropertyFeedContext } from '@/context/PropertyFeedContext';
import { useCity } from '@/context/CityContext';
import { countActiveFilters } from '@/lib/filterUtils';
import { PropertyCardSkeleton } from '@/components/skeletons/PropertyCardSkeleton';
const SEARCH_PAGE_LIMIT = 20;
const DEFAULT_FEED_LIMIT = 6;

export function PropertyResults() {
  const { city } = useCity();
  const { properties, isLoading, isFetching, total, error } = usePropertyFeed();
  const { state, setLimit, resetFilters, setSearchInMap, setMapBounds } = usePropertyFeedContext();
  const activeFiltersCount = countActiveFilters(state.filters);
  const isBusy = isLoading || isFetching;
  const showSkeletons = isBusy && properties.length === 0;

  useEffect(() => {
    setLimit(SEARCH_PAGE_LIMIT);
    return () => setLimit(DEFAULT_FEED_LIMIT);
  }, [setLimit]);

  const handleResetFilters = () => {
    resetFilters();
    setSearchInMap(false);
    setMapBounds(null);
    setLimit(SEARCH_PAGE_LIMIT);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase text-neutral-500">Результаты</p>
          <h2 className="text-2xl font-semibold text-neutral-900">
            {isBusy ? 'Загружаем объекты...' : `${total} объявлений`}
          </h2>
          <p className="text-sm text-neutral-500">
            {city.name} · {state.dealType === 'buy' ? 'Покупка' : 'Аренда'}
            {state.query ? ` · ${state.query}` : ''} · активных фильтров: {activeFiltersCount}
          </p>
          {state.searchInMap ? (
            <div className="mt-2 inline-flex items-center gap-2">
              <Badge tone="info">Область · {total}</Badge>
              <p className="text-xs text-[#0066FF]">Показываем объекты внутри текущей области карты</p>
            </div>
          ) : null}
        </div>
      </div>
      {error ? (
        <ErrorState message="Не удалось загрузить выдачу. Попробуйте обновить страницу или проверить backend API." />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-busy={showSkeletons}>
            {showSkeletons
              ? Array.from({ length: 6 }).map((_, idx) => <PropertyCardSkeleton key={`search-skel-${idx}`} />)
              : properties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
          {isFetching && properties.length > 0 ? (
            <p className="text-sm text-neutral-500">Обновляем подборку согласно новым фильтрам…</p>
          ) : null}
          {!isBusy && !properties.length ? (
            <EmptyState onResetFilters={handleResetFilters} />
          ) : !isBusy && total > state.limit ? (
            <div className="text-center">
              <Button variant="secondary" onClick={() => setLimit(state.limit + 6)}>
                Показать еще
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function EmptyState({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-200 bg-white/70 p-10 text-center">
      <p className="text-lg font-semibold text-neutral-900">Нет объектов по текущим критериям</p>
      <p className="mt-2 text-sm text-neutral-500">
        Попробуйте изменить фильтры или выбрать другой город. Сохраните поиск, чтобы получить рекомендации от AI позже.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" onClick={onResetFilters}>
          Сбросить фильтры
        </Button>
        <Button onClick={onResetFilters}>Показать все объекты</Button>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
      <p className="font-semibold">Ошибка загрузки</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
