import type { Metadata } from 'next';
import { AuthCard } from '@/features/auth/components/AuthCard';

export const metadata: Metadata = {
  title: 'BROKS · Вход и регистрация',
  description: 'Авторизуйтесь или создайте аккаунт, чтобы сохранять объекты, получать рекомендации и работать с агентами BROKS.',
};

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16">
        <p className="text-center text-sm uppercase tracking-[0.4em] text-neutral-400">BROKS ACCESS</p>
        <h1 className="text-center text-4xl font-semibold text-neutral-900">Вход и регистрация</h1>
        <p className="max-w-2xl text-center text-base text-neutral-600">
          Получайте доступ к подборкам, избранным объектам, сохранённым поискам и AI-ассистенту. Все данные синхронизируются между
          веб-версией и приложением.
        </p>
        <AuthCard />
      </div>
    </div>
  );
}
