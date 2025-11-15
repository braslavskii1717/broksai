import { SiteHeader } from '@/components/layout/SiteHeader';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />
      <main className="px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">{children}</div>
      </main>
    </div>
  );
}
