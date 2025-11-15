'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { memo, useCallback } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { PropertyCardData } from '@/data/mockProperties';
import { defaultBlurDataURL, propertyImagePlaceholder } from '@/lib/imagePlaceholders';

const formatter = new Intl.NumberFormat('ru-RU');

type Props = {
  property: PropertyCardData;
};

function PropertyCardComponent({ property }: Props) {
  const router = useRouter();

  const handleNavigate = useCallback(() => {
    router.push(`/property/${property.id}`);
  }, [property.id, router]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate();
    }
  };
  const imageSrc = property.image || property.images?.[0] || propertyImagePlaceholder;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="relative h-56 w-full">
        const imageSrc = property.image || property.images?.[0] || propertyImagePlaceholder;
?
        <Image
          src={imageSrc}
          alt={property.title}
          width={400}
          height={300}
          loading="lazy"
          quality={85}
          placeholder="blur"
          blurDataURL={defaultBlurDataURL}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="h-full w-full object-cover"
        />
        {property.badges ? (
          <div className="absolute left-4 top-4 flex gap-2">
            {property.badges.map((badge) => (
              <Badge key={badge} tone="info">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <div>
          <p className="text-sm uppercase text-neutral-500">{property.city}</p>
          <h3 className="text-lg font-semibold text-neutral-900">{property.title}</h3>
          <p className="text-sm text-neutral-500">{property.address}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <span>{property.rooms}‑комн.</span>
          <span>{property.area} м²</span>
          <span>{property.floor}</span>
        </div>
        <div>
          <p className="text-2xl font-semibold text-neutral-900">{formatter.format(property.price)} ₽</p>
          <p className="text-sm text-neutral-500">{formatter.format(property.pricePerMeter)} ₽·м²</p>
        </div>
        <div className="mt-auto">
          <Button
            type="button"
            fullWidth
            onClick={(event) => {
              event.stopPropagation();
              handleNavigate();
            }}
          >
            Подробнее
          </Button>
        </div>
      </div>
    </article>
  );
}

export const PropertyCard = memo(PropertyCardComponent, (prev, next) => {
  return (
    prev.property.id === next.property.id &&
    prev.property.price === next.property.price &&
    prev.property.pricePerMeter === next.property.pricePerMeter &&
    prev.property.rooms === next.property.rooms &&
    prev.property.image === next.property.image
  );
});
