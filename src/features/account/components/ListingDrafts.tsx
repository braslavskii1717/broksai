'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { ListingDraft, ListingDraftInput } from '@/features/account/hooks/useListingDrafts';

const initialForm: ListingDraftInput = {
  title: '',
  city: '',
  price: 0,
  area: 0,
};

type Props = {
  drafts: ListingDraft[];
  onCreate: (input: ListingDraftInput) => void;
  onDelete: (id: string) => void;
};

export function ListingDrafts({ drafts, onCreate, onDelete }: Props) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => form.title.trim().length >= 3 && form.city.trim().length >= 2 && form.price > 0 && form.area > 0, [form]);

  const handleChange = (field: keyof ListingDraftInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'title' || field === 'city' ? event.target.value : Number(event.target.value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setError('Заполните все поля корректно.');
      return;
    }
    setError(null);
    onCreate(form);
    setForm(initialForm);
  };

  return (
    <section id="new-listing" className="rounded-3xl bg-white p-6 shadow-xl">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Разместить объект</p>
          <h2 className="text-2xl font-semibold text-neutral-900">Добавить новый объект</h2>
        </div>
      </header>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-neutral-700">
          Название объекта
          <input
            type="text"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="Квартира в ЖК BROKS"
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label className="text-sm font-medium text-neutral-700">
          Город
          <input
            type="text"
            value={form.city}
            onChange={handleChange('city')}
            placeholder="Москва"
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </label>
        <label className="text-sm font-medium text-neutral-700">
          Цена, ₽
          <input
            type="number"
            value={form.price === 0 ? '' : form.price}
            onChange={handleChange('price')}
            placeholder="22000000"
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
            min={0}
          />
        </label>
        <label className="text-sm font-medium text-neutral-700">
          Площадь, м²
          <input
            type="number"
            value={form.area === 0 ? '' : form.area}
            onChange={handleChange('area')}
            placeholder="78"
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none"
            min={0}
          />
        </label>
        {error && <p className="text-sm text-red-500 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <Button type="submit" disabled={!isValid}>
            Сохранить черновик
          </Button>
        </div>
      </form>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-neutral-900">Черновики ({drafts.length})</h3>
        {drafts.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Добавьте первый объект, чтобы начать работу.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-100 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{draft.title}</p>
                  <p className="text-xs text-neutral-500">{draft.city} · {draft.area} м² · {draft.price.toLocaleString('ru-RU')} ₽</p>
                  <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                    Создан {new Date(draft.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })}
                  </p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => onDelete(draft.id)}>
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
