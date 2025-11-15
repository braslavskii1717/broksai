import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SectionHeader } from '@/components/common/SectionHeader';
import { SearchBar } from '@/components/search/SearchBar';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { PropertyResults } from '@/components/search/PropertyResults';
import { SavedSearchBanner } from '@/components/search/SavedSearchBanner';
import { SearchFiltersSync } from '@/components/search/SearchFiltersSync';
import { MapView } from '@/components/search/MapView';

export const metadata: Metadata = {
  title: 'Поиск недвижимости в Москве · BROKS',
  description: 'Найдите идеальную квартиру с AI-помощником. Фильтры по цене, площади, району. Интерактивная карта с маркерами объявлений.',
  keywords: ['поиск квартир москва', 'фильтр недвижимости', 'карта квартир', 'BROKS'],
};

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <SearchFiltersSync />
      </Suspense>
      <SectionHeader title="Поиск с картой" subtitle="AI плюс 30+ фильтров" />
      <SearchBar />
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="space-y-8">
          <AdvancedFilters />
          <SavedSearchBanner />
          <PropertyResults />
        </div>
        <div className="hidden lg:block lg:sticky lg:top-24 lg:h-[calc(100vh-140px)]">
          <MapView />
        </div>
      </div>
      <div className="lg:hidden">
        <MapView />
      </div>
    </div>
  );
}
