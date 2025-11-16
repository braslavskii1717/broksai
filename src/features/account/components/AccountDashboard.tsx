'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useFavorites } from '@/features/favorites/context/FavoritesContext';
import { FavoritesPreview } from './FavoritesPreview';
import { ListingDrafts } from './ListingDrafts';
import { useListingDrafts } from '../hooks/useListingDrafts';

export function AccountDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { favorites } = useFavorites();
  const { drafts, addDraft, removeDraft } = useListingDrafts();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] rounded-3xl bg-white p-10 shadow-xl">
        <p className="text-sm text-neutral-500">Загружаем личный кабинет...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Мой профиль</p>
            <h1 className="text-3xl font-semibold text-neutral-900">{user.name}</h1>
            <p className="text-sm text-neutral-500">{user.email}</p>
            {user.phone && <p className="text-sm text-neutral-500">{user.phone}</p>}
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <Button size="sm" variant="secondary" onClick={logout}>
              Выйти из аккаунта
            </Button>
            <Button size="sm" asChild>
              <Link href="/search">Перейти к поиску</Link>
            </Button>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-100 p-4">
            <p className="text-xs text-neutral-500">Избранные объекты</p>
            <p className="text-3xl font-semibold text-neutral-900">{favorites.length}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-4">
            <p className="text-xs text-neutral-500">Черновики объектов</p>
            <p className="text-3xl font-semibold text-neutral-900">{drafts.length}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-4">
            <p className="text-xs text-neutral-500">Статус</p>
            <p className="text-3xl font-semibold text-neutral-900">
              {user.role === 'broker' ? 'Брокер' : user.role === 'admin' ? 'Админ' : 'Покупатель'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Избранное</p>
              <h2 className="text-xl font-semibold text-neutral-900">Последние объекты</h2>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/search">Открыть поиск</Link>
            </Button>
          </header>
          <FavoritesPreview />
        </div>
        <ListingDrafts drafts={drafts} onCreate={addDraft} onDelete={removeDraft} />
      </section>
    </div>
  );
}
