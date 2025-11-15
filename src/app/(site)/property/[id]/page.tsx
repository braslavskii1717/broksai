import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MortgageCalculator } from '@/components/finance/MortgageCalculator';
import { DescriptionGenerator } from '@/components/property/DescriptionGenerator';
import { fetchProperty } from '@/lib/api/properties';
import { getPropertyById } from '@/services/propertyRepository';
import { defaultBlurDataURL, propertyImagePlaceholder } from '@/lib/imagePlaceholders';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const property = await loadProperty(params.id);
  if (!property) {
    return {
      title: 'Объявление не найдено · BROKS',
    };
  }
  const shortDescription = property.description.length > 150 ? `${property.description.slice(0, 150)}...` : property.description;
  return {
    title: `${property.title} · ${new Intl.NumberFormat('ru-RU').format(property.price)} ₽ · BROKS`,
    description: `${shortDescription} ${property.rooms}-комн., ${property.area} м², ${property.address}`,
    keywords: [`${property.city}`, `${property.district}`, `${property.rooms}-комнатная квартира`, 'BROKS'],
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 200),
      images: property.images?.length ? property.images : undefined,
      type: 'article',
    },
  };
}

export default async function PropertyDetail({ params }: { params: { id: string } }) {
  const property = await loadProperty(params.id);
  if (!property) {
    notFound();
  }

  const heroImage = property.image || property.images?.[0] || propertyImagePlaceholder;
  const galleryImages = property.images?.length ? property.images : [heroImage];

  const propertySchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    price: property.price,
    priceCurrency: 'RUB',
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      streetAddress: property.address,
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'MTK',
    },
    numberOfRooms: property.rooms,
    image: galleryImages,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }} />
      <div className="space-y-8">
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="relative h-96 w-full overflow-hidden rounded-3xl">
              <Image
                src={heroImage}
                alt={property.title}
                width={1200}
                height={800}
                loading="lazy"
                quality={90}
                placeholder="blur"
                blurDataURL={defaultBlurDataURL}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 60vw"
                className="h-full w-full object-cover"
              />
            </div>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm uppercase text-neutral-500">{property.city}</p>
              <h1 className="text-3xl font-semibold text-neutral-900">{property.title}</h1>
              <p className="text-neutral-500">{property.address}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-600">
                <Badge tone="info">{property.rooms}‑комн.</Badge>
                <Badge tone="info">{property.area} м²</Badge>
                <Badge tone="info">{property.floor}</Badge>
                <Badge tone="info">{property.propertyType}</Badge>
              </div>
            </section>
          </div>
          <aside className="space-y-4 rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-sm text-neutral-500">Стоимость</p>
            <p className="text-4xl font-semibold text-neutral-900">
              {new Intl.NumberFormat('ru-RU').format(property.price)} ₽
            </p>
            <p className="text-sm text-neutral-500">
              {new Intl.NumberFormat('ru-RU').format(property.pricePerMeter)} ₽/м²
            </p>
            <Button fullWidth>Запросить показ</Button>
            <Button variant="secondary" fullWidth>
              Связаться с агентом
            </Button>
          </aside>
        </div>
        <section className="rounded-3xl bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Описание</h2>
            <DescriptionGenerator
              id={property.id}
              title={property.title}
              city={property.city}
              district={property.district}
              address={property.address}
              price={property.price}
              area={property.area}
              rooms={property.rooms}
              propertyType={property.propertyType}
              highlights={property.highlights}
              amenities={property.amenities}
              initialDescription={property.description}
            />
            <div className="mt-6 space-y-2">
              <p className="text-sm uppercase text-neutral-500">Ключевые преимущества</p>
              <ul className="grid list-disc gap-2 pl-5 text-neutral-700 md:grid-cols-2">
                {property.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
          <MortgageCalculator price={property.price} />
        </section>
      </div>
    </>
  );
}

async function loadProperty(id: string) {
  try {
    const { data } = await fetchProperty(id);
    return data;
  } catch (error) {
    console.warn('[property-detail] falling back to mock data', error);
    return getPropertyById(id.toLowerCase());
  }
}
