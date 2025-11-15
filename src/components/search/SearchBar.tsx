'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCity } from '@/context/CityContext';
import { usePropertyFeedContext } from '@/context/PropertyFeedContext';
import type { NaturalLanguageSearchResult } from '@/domain/nlp';
import { russianCities } from '@/data/cities';

const dealModes = [
  { id: 'buy', label: 'Купить' },
  { id: 'rent', label: 'Снять' },
];

export function SearchBar() {
  const { city, setCity } = useCity();
  const { state, setDealType, setQuery, updateFilters, setSearchInMap, setMapBounds } = usePropertyFeedContext();
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aiFeedback, setAiFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAiSearch = async () => {
    console.log('AI click test', state.query);
    if (!state.query.trim()) {
      setAiFeedback({ type: 'error', message: 'Введите запрос для AI поиска' });
      setTimeout(() => setAiFeedback(null), 2500);
      return;
    }
    console.log('AI поиск стартует', state.query);
    try {
      setAiStatus('loading');
      const response = await fetch('/api/nlp-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: state.query.trim() }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const payload = (await response.json()) as { result: NaturalLanguageSearchResult };
      applyAiResult(payload.result);
      setAiStatus('success');
      setAiFeedback({ type: 'success', message: 'AI подобрал фильтры' });
      setTimeout(() => {
        setAiStatus('idle');
        setAiFeedback(null);
      }, 2000);
    } catch (error) {
      console.warn('AI search error', error);
      setAiStatus('error');
      setAiFeedback({ type: 'error', message: 'AI временно недоступен' });
      setTimeout(() => {
        setAiStatus('idle');
        setAiFeedback(null);
      }, 2500);
    }
  };

  const applyAiResult = (result: NaturalLanguageSearchResult) => {
    if (result.dealType) {
      setDealType(result.dealType);
    }
    if (result.cityId || result.cityName) {
      const nextCity =
        russianCities.find((entry) => entry.id === result.cityId) ??
        (result.cityName
          ? russianCities.find((entry) => entry.name.toLowerCase() === result.cityName?.toLowerCase())
          : undefined);
      if (nextCity) setCity(nextCity);
    }
    const patch: Parameters<typeof updateFilters>[0] = {};
    if (result.propertyTypes?.length) patch.propertyTypes = result.propertyTypes;
    if (result.priceMax) patch.priceMax = result.priceMax;
    if (result.priceMin) patch.priceMin = result.priceMin;
    if (result.rooms?.length) patch.rooms = result.rooms;
    if (typeof result.floorMin === 'number') patch.floorMin = result.floorMin;
    if (typeof result.floorMax === 'number') patch.floorMax = result.floorMax;
    if (Object.keys(patch).length) {
      updateFilters(patch);
    }
  };

  const handleSearchInMapToggle = () => {
    if (state.searchInMap) {
      setSearchInMap(false);
      setMapBounds(null);
    } else {
      setSearchInMap(true);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
      <div className="mb-3 flex gap-2">
        {dealModes.map((item) => (
          <button
            key={item.id}
            onClick={() => setDealType(item.id as typeof state.dealType)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              state.dealType === item.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="text"
          value={state.query}
          placeholder={`${city.name}, метро, ЖК...`}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1 rounded-2xl border border-transparent bg-neutral-100/70 px-4 py-3 text-base text-neutral-700 focus:border-primary focus:outline-none"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="secondary" className="w-full sm:w-auto" type="button">
            Фильтры
          </Button>
          <Button className="w-full sm:w-auto" type="button">
            Найти
          </Button>
          <Button
            variant="accent"
            className="w-full sm:w-auto"
            type="button"
            onClick={handleAiSearch}
            disabled={aiStatus === 'loading'}
          >
            {aiStatus === 'loading' ? 'AI ищет…' : 'AI поиск'}
          </Button>
        </div>
        {aiFeedback && (
          <p className={`text-sm ${aiFeedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{aiFeedback.message}</p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleSearchInMapToggle}
          className="group inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-[#0066FF] hover:text-[#0066FF]"
        >
          <span
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              state.searchInMap ? 'bg-[#0066FF]' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                state.searchInMap ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </span>
          Искать в этой области
        </button>
      </div>
    </div>
  );
}
