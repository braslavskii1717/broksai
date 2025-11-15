'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CitySelector } from './CitySelector';

type NavItem = {
  href: Route;
  label: string;
  disabled?: boolean;
  isActive?: (path: string) => boolean;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Главная' },
  { href: '/search', label: 'Поиск' },
  {
    href: '/property/prop-0001' as Route,
    label: 'Объект',
    isActive: (path) => path.startsWith('/property/'),
  },
  { href: '/agents', label: 'Агенты', disabled: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-heading font-semibold text-neutral-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-white">B</span>
          BROKS
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-4 text-sm font-medium text-neutral-600 lg:flex">
          {navItems.map((item) => {
            const isActive = item.isActive ? item.isActive(pathname) : pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={
                  item.disabled
                    ? 'cursor-not-allowed opacity-50'
                    : isActive
                      ? 'text-neutral-900'
                      : 'hover:text-neutral-900'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <CitySelector />
          <Button variant="secondary" size="sm" className="hidden md:flex">
            Войти
          </Button>
          <Button size="sm">Разместить</Button>
        </div>
      </div>
    </header>
  );
}
