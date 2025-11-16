import { faker } from '@faker-js/faker';

faker.seed(42);

export type PropertySeed = {
  title: string;
  address: string;
  description: string;
  district: string;
  city: string;
  cityId: number;
  price: number;
  pricePerMeter: number;
  roomsCount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  livingArea: number;
  kitchenArea: number;
  floorNumber: number;
  totalFloors: number;
  dealType: 'buy' | 'rent' | 'daily';
  propertyType: string;
  images: string[];
  coverImage: string;
  amenities: string[];
  coordinates: { lat: number; lng: number };
  publishedAt: Date;
};

const DEAL_TYPES: Array<PropertySeed['dealType']> = ['buy', 'rent', 'daily'];
const PROPERTY_TYPES = ['apartment', 'loft', 'penthouse', 'house'];

export function buildPropertySeed(index: number, overrides: Partial<PropertySeed> = {}): PropertySeed {
  const area = overrides.area ?? faker.number.int({ min: 35, max: 180 });
  const pricePerMeter = overrides.pricePerMeter ?? faker.number.int({ min: 150_000, max: 450_000 });
  const price = overrides.price ?? area * pricePerMeter;

  return {
    title: overrides.title ?? `Квартира №${index + 1}`,
    address: overrides.address ?? `${faker.location.city()}, ${faker.location.streetAddress()}`,
    description:
      overrides.description ??
      `Современная ${faker.commerce.productAdjective()} квартира с видом на ${faker.location.nearbyGPSCoordinate()}.`,
    district: overrides.district ?? faker.location.city(),
    city: overrides.city ?? 'Москва',
    cityId: overrides.cityId ?? 77,
    price,
    pricePerMeter,
    roomsCount: overrides.roomsCount ?? faker.number.int({ min: 1, max: 5 }),
    bedrooms: overrides.bedrooms ?? faker.number.int({ min: 1, max: 4 }),
    bathrooms: overrides.bathrooms ?? faker.number.int({ min: 1, max: 3 }),
    area,
    livingArea: overrides.livingArea ?? Math.round(area * 0.7),
    kitchenArea: overrides.kitchenArea ?? Math.round(area * 0.2),
    floorNumber: overrides.floorNumber ?? faker.number.int({ min: 1, max: 45 }),
    totalFloors: overrides.totalFloors ?? faker.number.int({ min: 5, max: 50 }),
    dealType: overrides.dealType ?? faker.helpers.arrayElement(DEAL_TYPES),
    propertyType: overrides.propertyType ?? faker.helpers.arrayElement(PROPERTY_TYPES),
    images: overrides.images ?? [`https://picsum.photos/seed/${index}/800/600`],
    coverImage: overrides.coverImage ?? `https://picsum.photos/seed/${index}-cover/800/600`,
    amenities:
      overrides.amenities ??
      faker.helpers.arrayElements(['лифт', 'терраса', 'камин', 'консьерж', 'сауна'], faker.number.int({ min: 1, max: 3 })),
    coordinates:
      overrides.coordinates ??
      {
        lat: faker.number.float({ min: 55.3, max: 55.9, fractionDigits: 6 }),
        lng: faker.number.float({ min: 37.3, max: 37.9, fractionDigits: 6 }),
      },
    publishedAt: overrides.publishedAt ?? new Date(Date.now() - index * 1_000),
  } satisfies PropertySeed;
}

export function generatePropertyBatch(
  count: number,
  overridesFn?: (index: number) => Partial<PropertySeed>,
): PropertySeed[] {
  return Array.from({ length: count }).map((_, index) => buildPropertySeed(index, overridesFn?.(index)));
}
