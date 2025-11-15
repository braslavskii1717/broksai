'use client';

import dynamic from 'next/dynamic';
import { usePropertyFeed } from '@/hooks/usePropertyFeed';

const ClientYandexMap = dynamic(() => import('@/components/map/YandexMap').then((mod) => mod.YandexMap), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-3xl bg-neutral-100" />,
});

export function PropertyMapPanel() {
  const { properties, isLoading, total } = usePropertyFeed();

  return (
    <section className="rounded-3xl bg-white/90 p-6 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">карта</p>
          <h2 className="text-xl font-semibold text-neutral-900">Кластеры объявлений</h2>
          <p className="text-sm text-neutral-500">{total} объектов с координатами</p>
        </div>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <div className="h-[420px] animate-pulse rounded-3xl bg-neutral-100" />
        ) : properties.length > 0 ? (
          <ClientYandexMap properties={properties} />
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 text-sm text-neutral-500">
            Нет объектов для выбранных фильтров
          </div>
        )}
      </div>
    </section>
  );
}
