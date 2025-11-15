import { faker } from '@faker-js/faker/locale/ru';
import { russianCities } from '../constants/cities';

const propertyTypes = ['apartment', 'penthouse', 'loft', 'house', 'townhouse'] as const;
const dealTypes = ['buy', 'rent'] as const;
const houseTypes = ['brick', 'panel', 'monolith', 'timber'] as const;
const conditions = ['shell', 'cosmetic', 'euro', 'designer'] as const;
const amenitiesPool = [
  'parking',
  'underground_parking',
  'elevator',
  'cargo_elevator',
  'security',
  'concierge',
  'video',
  'storage',
  'balcony',
  'terrace',
  'conditioner',
  'smart_home',
  'floor_heating',
  'electric_vehicle',
];

export type SeedProperty = {
  title: string;
  address: string;
  district: string;
  city: string;
  cityId: number;
  status: string;
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
  dealType: 'buy' | 'rent';
  propertyType: typeof propertyTypes[number];
  images: string[];
  coverImage: string;
  amenities: string[];
  houseType: typeof houseTypes[number];
  condition: typeof conditions[number];
  hasPhotos: boolean;
  hasVideo: boolean;
  hasVirtualTour: boolean;
  onlineShowing: boolean;
  mortgage: boolean;
  installment: boolean;
  newBuilding: boolean;
  developer: string;
  view: string;
  parkingType: string;
  petFriendly: boolean;
  accessibilityFriendly: boolean;
  metroDistance: number;
  metroName: string;
  metroLine: string;
  coordinates: { lat: number; lng: number };
  publishedAt: Date;
};

export function generateProperties(count = 100): SeedProperty[] {
  return Array.from({ length: count }).map(() => {
    const city = faker.helpers.arrayElement(russianCities);
    const dealType = faker.helpers.arrayElement(dealTypes);
    const propertyType = faker.helpers.arrayElement(propertyTypes);
    const roomsCount = propertyType === 'loft' ? faker.number.int({ min: 1, max: 2 }) : faker.number.int({ min: 1, max: 5 });
    const area = propertyType === 'house' ? faker.number.int({ min: 120, max: 400 }) : faker.number.int({ min: 40, max: 220 });
    const pricePerMeter = dealType === 'buy' ? faker.number.int({ min: 180000, max: 700000 }) : faker.number.int({ min: 1000, max: 4000 });
    const price = pricePerMeter * area;
    const coordinates = {
      lat: city.coordinates[0] + faker.number.float({ min: -0.1, max: 0.1, precision: 0.0001 }),
      lng: city.coordinates[1] + faker.number.float({ min: -0.1, max: 0.1, precision: 0.0001 }),
    };
    const floorNumber = propertyType === 'house' ? 1 : faker.number.int({ min: 2, max: 45 });
    const totalFloors = propertyType === 'house' ? faker.number.int({ min: 1, max: 3 }) : faker.number.int({ min: floorNumber, max: 60 });

    const images = Array.from({ length: faker.number.int({ min: 4, max: 8 }) }).map(() =>
      faker.image.urlPicsumPhotos({ width: 1600, height: 900 }),
    );

    return {
      title: `${faker.company.buzzAdjective()} ${faker.word.noun()} ${city.name}`,
      address: `${faker.location.streetAddress()}`,
      district: faker.location.county(),
      city: city.name,
      cityId: city.id,
      status: faker.helpers.arrayElement(['available', 'reserved', 'sold']),
      price,
      pricePerMeter,
      roomsCount,
      bedrooms: Math.max(roomsCount - 1, 1),
      bathrooms: faker.number.int({ min: 1, max: 3 }),
      area,
      livingArea: Math.round(area * 0.65),
      kitchenArea: faker.number.int({ min: 10, max: 30 }),
      floorNumber,
      totalFloors,
      dealType,
      propertyType,
      images,
      coverImage: images[0],
      amenities: faker.helpers.arrayElements(amenitiesPool, { min: 4, max: 8 }),
      houseType: faker.helpers.arrayElement(houseTypes),
      condition: faker.helpers.arrayElement(conditions),
      hasPhotos: true,
      hasVideo: faker.datatype.boolean(0.5),
      hasVirtualTour: faker.datatype.boolean(0.3),
      onlineShowing: faker.datatype.boolean(0.4),
      mortgage: faker.datatype.boolean(0.7),
      installment: faker.datatype.boolean(0.4),
      newBuilding: faker.datatype.boolean(0.5),
      developer: faker.helpers.arrayElement(['pik', 'samolyot', 'etalons', 'fsq', 'level']),
      view: faker.helpers.arrayElement(['park', 'river', 'city', 'courtyard', 'forest']),
      parkingType: faker.helpers.arrayElement(['underground', 'yard', 'covered', 'guest']),
      petFriendly: faker.datatype.boolean(0.6),
      accessibilityFriendly: faker.datatype.boolean(0.5),
      metroDistance: faker.number.int({ min: 200, max: 5000 }),
      metroName: faker.location.streetName(),
      metroLine: faker.color.human(),
      coordinates,
      publishedAt: faker.date.recent({ days: 60 }),
    } satisfies SeedProperty;
  });
}
