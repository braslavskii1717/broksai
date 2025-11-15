'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';

type FormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export function ContactSection() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
      return;
    }
    setStatus('success');
    setFormState(initialState);
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <section className="mt-16 rounded-[32px] bg-white p-8 shadow-xl lg:p-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Связь</p>
          <h2 className="mt-3 text-3xl font-heading font-semibold text-neutral-900">Нужна помощь с подбором?</h2>
          <p className="mt-3 text-neutral-600">
            Оставьте контакты, и команда BROKS подберёт варианты, отправит презентации и организует просмотр. Ответ в течение
            одного рабочего дня.
          </p>
          <div className="mt-6 space-y-2 text-sm text-neutral-600">
            <p>📞 +7 (800) 550-20-24</p>
            <p>✉️ support@broks.ru</p>
            <p>🕘 Пн–Пт · 09:00–21:00 (МСК)</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-neutral-600">
            Имя
            <input
              type="text"
              value={formState.name}
              onChange={handleChange('name')}
              className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
              required
            />
          </label>
          <label className="block text-sm text-neutral-600">
            Email
            <input
              type="email"
              value={formState.email}
              onChange={handleChange('email')}
              className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
              required
            />
          </label>
          <label className="block text-sm text-neutral-600">
            Телефон
            <input
              type="tel"
              value={formState.phone}
              onChange={handleChange('phone')}
              className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
              placeholder="+7 (___) ___-__-__"
            />
          </label>
          <label className="block text-sm text-neutral-600">
            Чем можем помочь?
            <textarea
              value={formState.message}
              onChange={handleChange('message')}
              className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
              rows={4}
              required
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" className="w-full sm:w-auto">
              Отправить запрос
            </Button>
            {status === 'success' && <p className="text-sm text-green-600">Спасибо! Мы ответим в течение дня.</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
