import dotenv from 'dotenv';
import { connectDB } from '../lib/connect';
import { Property } from '../models/Property';
import { manualProperties } from './manualProperties';

dotenv.config();

const fallbackAmenities = ['elevator', 'parking', 'security'];

function toPropertyPayload(seed: (typeof manualProperties)[number], index: number) {
  const pricePerMeter = Math.round(seed.price / seed.area);
  const bedrooms = seed.bedrooms ?? Math.max(seed.roomsCount - 1, 1);
  const bathrooms = seed.bathrooms ?? (seed.roomsCount > 2 ? 2 : 1);
  const images = seed.images ?? [];

  if (images.length === 0) {
    throw new Error(`Property "${seed.title}" не содержит фото`);
  }

  return {
    title: seed.title,
    address: seed.address,
    district: seed.district,
    city: seed.city,
    cityId: seed.cityId,
    status: seed.status ?? 'available',
    price: seed.price,
    pricePerMeter,
    roomsCount: seed.roomsCount,
    bedrooms,
    bathrooms,
    area: seed.area,
    livingArea: Math.round(seed.area * 0.7),
    kitchenArea: Math.max(12, Math.round(seed.area * 0.22)),
    floorNumber: seed.floorNumber,
    totalFloors: seed.totalFloors,
    dealType: seed.dealType ?? 'buy',
    propertyType: seed.propertyType ?? 'apartment',
    images,
    coverImage: images[0],
    amenities: seed.amenities ?? fallbackAmenities,
    houseType: seed.houseType ?? 'monolith',
    condition: seed.condition ?? 'euro',
    hasPhotos: true,
    hasVideo: false,
    hasVirtualTour: false,
    onlineShowing: false,
    mortgage: true,
    installment: true,
    newBuilding: seed.propertyType === 'penthouse' ? true : false,
    developer: seed.developer ?? 'BROKS Development',
    view: seed.district.includes('залив') ? 'river' : 'city',
    parkingType: seed.propertyType === 'house' || seed.propertyType === 'townhouse' ? 'yard' : 'underground',
    petFriendly: true,
    accessibilityFriendly: true,
    metroDistance: seed.metroDistance ?? 600,
    metroName: seed.metroName ?? '',
    metroLine: seed.metroLine ?? '',
    coordinates: seed.coordinates,
    publishedAt: new Date(Date.now() - index * 3600 * 1000),
  };
}

async function seedDatabase() {
  try {
    await connectDB();
    console.log('🌱 Начинаем заполнение БД...');
    await Property.deleteMany({});
    const payload = manualProperties.map(toPropertyPayload);
    await Property.insertMany(payload);
    console.log(`✅ Добавлено ${payload.length} объектов`);

    const summary = await Property.aggregate([
      { $group: { _id: '$city', total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    summary.forEach((row) => {
      console.log(`📍 ${row._id}: ${row.total}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при заполнении БД', error);
    process.exit(1);
  }
}

seedDatabase();
