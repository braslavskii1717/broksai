import Image from 'next/image';
import { russianCities } from '@/data/cities';
import { SectionHeader } from '@/components/common/SectionHeader';
import { defaultBlurDataURL } from '@/lib/imagePlaceholders';

export function PopularCities() {
  return (
    <section className="mt-16">
      <SectionHeader title="Популярные города" subtitle="Топ-8 направлений" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {russianCities.slice(0, 8).map((city) => (
          <article key={city.id} className="group overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
            <div className="relative h-40 w-full overflow-hidden">
              <Image
                src={`${city.image}?auto=format&fit=crop&w=600&q=80`}
                alt={city.name}
                width={600}
                height={400}
                loading="lazy"
                quality={85}
                placeholder="blur"
                blurDataURL={defaultBlurDataURL}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="space-y-1 p-4">
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>{city.region}</span>
                <span>{(city.population / 1000000).toFixed(1)} млн</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">{city.name}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
