'use client';

import { useMemo, useState } from 'react';
import { russianCities } from '@/data/cities';
import { cn } from '@/lib/utils';
import { useCity } from '@/context/CityContext';

export function CitySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { city, setCity } = useCity();

  const filtered = useMemo(() => {
    return russianCities.filter((entry) => entry.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="relative text-left">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="text-primary">{city.name}</span>
        <svg className="h-4 w-4 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
          <input
            type="text"
            placeholder="Поиск города"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1 text-sm">
            {filtered.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  setCity(entry);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors',
                  entry.id === city.id ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-50',
                )}
              >
                <div>
                  <p className="font-medium">{entry.name}</p>
                  <p className="text-xs text-neutral-500">{entry.region}</p>
                </div>
                <span className="text-xs text-neutral-500">{new Intl.NumberFormat('ru-RU').format(entry.population)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
