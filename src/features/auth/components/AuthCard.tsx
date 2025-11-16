'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/context/AuthContext';

type FormMode = 'login' | 'register';

type FormState = {
  name: string;
  email: string;
  password: string;
  phone: string;
  company: string;
};

const initialState: FormState = {
  name: '',
  email: '',
  password: '',
  phone: '',
  company: '',
};

export function AuthCard() {
  const router = useRouter();
  const { signIn, signUp, isAuthenticated, user, logout, loading } = useAuth();
  const [mode, setMode] = useState<FormMode>('login');
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const updateField = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const canSubmit = useMemo(() => {
    if (mode === 'login') {
      return Boolean(form.email && form.password.length >= 6);
    }
    return Boolean(form.name && form.email && form.password.length >= 6);
  }, [form.email, form.password.length, form.name, mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signIn({ email: form.email, password: form.password });
      } else {
        await signUp({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          company: form.company || undefined,
        });
      }
      router.push('/search');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось выполнить запрос';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-2xl">
        <p className="text-sm text-neutral-500">Загружаем профиль...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Вы вошли в систему</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-900">{user.name}</h2>
        <p className="mt-1 text-sm text-neutral-500">{user.email}</p>
        {user.phone && <p className="text-sm text-neutral-500">{user.phone}</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button fullWidth onClick={() => router.push('/search')}>
            Перейти к поиску
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            {mode === 'login' ? 'Добро пожаловать обратно' : 'Создайте аккаунт BROKS'}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
            {mode === 'login' ? 'Войти в платформу' : 'Регистрация'}
          </h2>
        </div>
        <button
          type="button"
          onClick={toggleMode}
          className="text-sm font-semibold text-primary transition hover:text-primary-dark"
        >
          {mode === 'login' ? 'Создать аккаунт' : 'У меня уже есть аккаунт'}
        </button>
      </div>
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <label className="block text-sm font-medium text-neutral-700">
              Имя и фамилия
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={updateField('name')}
                required={mode === 'register'}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:border-neutral-900 focus:outline-none"
                placeholder="Анна Брокер"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Телефон
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={updateField('phone')}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:border-neutral-900 focus:outline-none"
                placeholder="+7 999 123-45-67"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Компания
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={updateField('company')}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:border-neutral-900 focus:outline-none"
                placeholder="BROKS Agency"
              />
            </label>
          </>
        )}
        <label className="block text-sm font-medium text-neutral-700">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField('email')}
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:border-neutral-900 focus:outline-none"
            placeholder="agent@broks.ru"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          Пароль
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={updateField('password')}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:border-neutral-900 focus:outline-none"
            placeholder="Минимум 6 символов"
          />
        </label>
        <Button type="submit" fullWidth disabled={!canSubmit || submitting}>
          {submitting ? 'Отправка...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-500">
        Нажимая на кнопку, вы соглашаетесь с политикой обработки персональных данных BROKS.
      </p>
    </div>
  );
}
