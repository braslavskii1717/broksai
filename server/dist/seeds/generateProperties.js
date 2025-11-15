"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProperties = generateProperties;
const ru_1 = require("@faker-js/faker/locale/ru");
const cities_1 = require("../constants/cities");
const propertyTypes = ['apartment', 'penthouse', 'loft', 'house', 'townhouse'];
const dealTypes = ['buy', 'rent'];
const houseTypes = ['brick', 'panel', 'monolith', 'timber'];
const conditions = ['shell', 'cosmetic', 'euro', 'designer'];
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
function generateProperties(count = 100) {
    return Array.from({ length: count }).map(() => {
        const city = ru_1.faker.helpers.arrayElement(cities_1.russianCities);
        const dealType = ru_1.faker.helpers.arrayElement(dealTypes);
        const propertyType = ru_1.faker.helpers.arrayElement(propertyTypes);
        const roomsCount = propertyType === 'loft' ? ru_1.faker.number.int({ min: 1, max: 2 }) : ru_1.faker.number.int({ min: 1, max: 5 });
        const area = propertyType === 'house' ? ru_1.faker.number.int({ min: 120, max: 400 }) : ru_1.faker.number.int({ min: 40, max: 220 });
        const pricePerMeter = dealType === 'buy' ? ru_1.faker.number.int({ min: 180000, max: 700000 }) : ru_1.faker.number.int({ min: 1000, max: 4000 });
        const price = pricePerMeter * area;
        const coordinates = {
            lat: city.coordinates[0] + ru_1.faker.number.float({ min: -0.1, max: 0.1, precision: 0.0001 }),
            lng: city.coordinates[1] + ru_1.faker.number.float({ min: -0.1, max: 0.1, precision: 0.0001 }),
        };
        const floorNumber = propertyType === 'house' ? 1 : ru_1.faker.number.int({ min: 2, max: 45 });
        const totalFloors = propertyType === 'house' ? ru_1.faker.number.int({ min: 1, max: 3 }) : ru_1.faker.number.int({ min: floorNumber, max: 60 });
        const images = Array.from({ length: ru_1.faker.number.int({ min: 4, max: 8 }) }).map(() => ru_1.faker.image.urlPicsumPhotos({ width: 1600, height: 900 }));
        return {
            title: `${ru_1.faker.company.buzzAdjective()} ${ru_1.faker.word.noun()} ${city.name}`,
            address: `${ru_1.faker.location.streetAddress()}`,
            district: ru_1.faker.location.county(),
            city: city.name,
            cityId: city.id,
            status: ru_1.faker.helpers.arrayElement(['available', 'reserved', 'sold']),
            price,
            pricePerMeter,
            roomsCount,
            bedrooms: Math.max(roomsCount - 1, 1),
            bathrooms: ru_1.faker.number.int({ min: 1, max: 3 }),
            area,
            livingArea: Math.round(area * 0.65),
            kitchenArea: ru_1.faker.number.int({ min: 10, max: 30 }),
            floorNumber,
            totalFloors,
            dealType,
            propertyType,
            images,
            coverImage: images[0],
            amenities: ru_1.faker.helpers.arrayElements(amenitiesPool, { min: 4, max: 8 }),
            houseType: ru_1.faker.helpers.arrayElement(houseTypes),
            condition: ru_1.faker.helpers.arrayElement(conditions),
            hasPhotos: true,
            hasVideo: ru_1.faker.datatype.boolean(0.5),
            hasVirtualTour: ru_1.faker.datatype.boolean(0.3),
            onlineShowing: ru_1.faker.datatype.boolean(0.4),
            mortgage: ru_1.faker.datatype.boolean(0.7),
            installment: ru_1.faker.datatype.boolean(0.4),
            newBuilding: ru_1.faker.datatype.boolean(0.5),
            developer: ru_1.faker.helpers.arrayElement(['pik', 'samolyot', 'etalons', 'fsq', 'level']),
            view: ru_1.faker.helpers.arrayElement(['park', 'river', 'city', 'courtyard', 'forest']),
            parkingType: ru_1.faker.helpers.arrayElement(['underground', 'yard', 'covered', 'guest']),
            petFriendly: ru_1.faker.datatype.boolean(0.6),
            accessibilityFriendly: ru_1.faker.datatype.boolean(0.5),
            metroDistance: ru_1.faker.number.int({ min: 200, max: 5000 }),
            metroName: ru_1.faker.location.streetName(),
            metroLine: ru_1.faker.color.human(),
            coordinates,
            publishedAt: ru_1.faker.date.recent({ days: 60 }),
        };
    });
}
