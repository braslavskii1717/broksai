'use client';

import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/Button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { usePropertyFeed } from '@/hooks/usePropertyFeed';
import { PropertyCardSkeleton } from '@/components/skeletons/PropertyCardSkeleton';

export function FeaturedProperties() {
  const { properties, isLoading } = usePropertyFeed();

  return (
    <section className="mt-16">
      <SectionHeader
        title="Рекомендуем"
        subtitle="Подборка объектов от AI"
        action={<Button variant="secondary">Смотреть все</Button>}
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-busy={isLoading}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, idx) => <PropertyCardSkeleton key={`featured-skel-${idx}`} />)
          : properties.map((property) => <PropertyCard key={property.id} property={property} />)}
      </div>
    </section>
  );
}
