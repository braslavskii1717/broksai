'use client';

import dynamic from 'next/dynamic';
import { Chip } from '@/components/ui/Chip';
import { quickFilters } from '@/data/quickFilters';
import { useCity } from '@/context/CityContext';
import { usePropertyFeed } from '@/hooks/usePropertyFeed';

const SearchBar = dynamic(() => import('@/components/search/SearchBar').then((mod) => mod.SearchBar), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-3xl bg-white/20 p-6 text-sm text-white/80 shadow-xl backdrop-blur">
      AI поиск загружается…
    </div>
  ),
});

export function HeroSection() {
  const { city } = useCity();
  const { total, isLoading } = usePropertyFeed();

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary to-accent-purple px-6 py-16 text-white">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">BROKS · {city.name}</p>
        <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
          Платформа №1 по подбору недвижимости в России
        </h1>
        <p className="max-w-3xl text-lg text-white/80">
          AI‑агент, карты, фильтры и аналитика в единой экосистеме. Новые объекты каждый день, топовые агенты и прозрачные сделки.
        </p>
        <p className="text-sm uppercase text-white/70">
          {isLoading ? 'Обновляем подборку...' : `${total} проверенных объектов в ${city.name}`}
        </p>
        <SearchBar />
        <div className="flex flex-wrap gap-3">
          {quickFilters.map((filter) => (
            <Chip key={filter} active={filter === 'Квартиры'}>
              {filter}
            </Chip>
          ))}
        </div>
      </div>
      <div className="absolute -right-16 top-10 hidden h-64 w-64 rounded-full bg-white/10 blur-3xl md:block" />
      <div className="absolute -bottom-10 left-10 hidden h-64 w-64 rounded-full bg-accent-mint/40 blur-3xl md:block" />
    </section>
  );
}
