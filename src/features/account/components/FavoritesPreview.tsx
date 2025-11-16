'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { PropertyCardData } from '@/data/mockProperties';
import { Button } from '@/components/ui/Button';
import { useFavorites } from '@/features/favorites/context/FavoritesContext';
import { getPropertyById } from '@/services/propertyRepository';

export function FavoritesPreview() {
  const { favorites } = useFavorites();
  const router = useRouter();
  const items = useMemo(() => {
    const collected: PropertyCardData[] = [];
    favorites.forEach((id) => {
      const property = getPropertyById(id);
      if (property) {
        collected.push(property);
      }
    });
    return collected.slice(0, 3);
  }, [favorites]);

  if (favorites.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-200 bg-white/40 p-6 text-center">
        <p className="text-sm text-neutral-500">Здесь появятся сохранённые объекты.</p>
        <Button size="sm" className="mt-4" onClick={() => router.push('/search')}>
          Перейти к поиску
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((property) => (
        <Link
          key={property.id}
          href={`/property/${property.id}`}
          className="flex items-center gap-4 rounded-3xl border border-neutral-100 bg-white/70 p-4 transition hover:border-neutral-200"
        >
          <img
            src={property.image}
            alt={property.title}
            className="h-16 w-16 rounded-2xl object-cover"
          />
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-semibold text-neutral-900">{property.title}</span>
            <span className="text-xs text-neutral-500">{property.address}</span>
          </div>
          <div className="text-right text-sm font-semibold text-neutral-900">
            {property.price.toLocaleString('ru-RU')} ₽
          </div>
        </Link>
      ))}
      {favorites.length > items.length && (
        <p className="text-center text-xs text-neutral-500">
          Ещё {favorites.length - items.length} {favorites.length - items.length === 1 ? 'объект' : 'объекта'} в избранном
        </p>
      )}
    </div>
  );
}
