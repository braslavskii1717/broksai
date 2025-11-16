"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProperties = listProperties;
exports.getProperty = getProperty;
exports.createProperty = createProperty;
const zod_1 = require("zod");
const Property_1 = require("../models/Property");
const queryBuilder_1 = require("../services/queryBuilder");
const PROPERTY_IMAGE_PLACEHOLDER = '/images/placeholders/property-fallback.svg';
const normalizeProperty = (property) => {
    if (!property)
        return property;
    const plain = typeof property.toObject === 'function' ? property.toObject() : property;
    const images = Array.isArray(plain.images) && plain.images.length ? plain.images : [];
    const coverImage = plain.coverImage ?? images[0];
    const fallbackImage = coverImage ?? PROPERTY_IMAGE_PLACEHOLDER;
    return {
        ...plain,
        id: (plain.id ?? plain._id ?? '').toString() || plain.id,
        image: fallbackImage,
        images: images.length ? images : [fallbackImage],
    };
};
const createPropertySchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    address: zod_1.z.string().min(3),
    district: zod_1.z.string().min(2),
    city: zod_1.z.string().min(2),
    cityId: zod_1.z.number().int(),
    status: zod_1.z.string().min(2),
    price: zod_1.z.number().positive(),
    pricePerMeter: zod_1.z.number().positive(),
    roomsCount: zod_1.z.number().int().nonnegative().optional(),
    bedrooms: zod_1.z.number().int().nonnegative().optional(),
    bathrooms: zod_1.z.number().int().nonnegative().optional(),
    area: zod_1.z.number().positive().optional(),
    livingArea: zod_1.z.number().positive().optional(),
    kitchenArea: zod_1.z.number().positive().optional(),
    floorNumber: zod_1.z.number().int().optional(),
    totalFloors: zod_1.z.number().int().optional(),
    dealType: zod_1.z.enum(['buy', 'rent', 'daily']).default('buy'),
    propertyType: zod_1.z.string().min(2),
    houseType: zod_1.z.string().optional(),
    condition: zod_1.z.string().optional(),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
    images: zod_1.z.array(zod_1.z.string().min(5)).nonempty(),
    coverImage: zod_1.z.string().url().optional(),
    developer: zod_1.z.string().optional(),
    view: zod_1.z.string().optional(),
    parkingType: zod_1.z.string().optional(),
    petFriendly: zod_1.z.boolean().optional(),
    accessibilityFriendly: zod_1.z.boolean().optional(),
    metroDistance: zod_1.z.number().optional(),
    metroName: zod_1.z.string().optional(),
    metroLine: zod_1.z.string().optional(),
    coordinates: zod_1.z
        .object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
    })
        .optional(),
});
async function listProperties(request, response) {
    try {
        const { filters, limit } = (0, queryBuilder_1.buildPropertyQuery)(request.query);
        const data = await Property_1.Property.find(filters).limit(limit).lean();
        const normalized = data.map((item) => normalizeProperty(item));
        response.json({ data: normalized, meta: { total: normalized.length } });
    }
    catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Не удалось получить список объектов' });
    }
}
async function getProperty(request, response) {
    try {
        const property = await Property_1.Property.findById(request.params.id).lean();
        if (!property) {
            return response.status(404).json({ message: 'Объект не найден' });
        }
        return response.json({ data: normalizeProperty(property) });
    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Ошибка при получении объекта' });
    }
}
async function createProperty(request, response) {
    try {
        const parsed = createPropertySchema.safeParse(request.body);
        if (!parsed.success) {
            return response.status(400).json({ message: 'Некорректные данные', errors: parsed.error.flatten() });
        }
        const payload = parsed.data;
        const coverImage = payload.coverImage ?? payload.images[0];
        const created = await Property_1.Property.create({
            ...payload,
            coverImage,
            hasPhotos: true,
        });
        return response.status(201).json({ data: normalizeProperty(created) });
    }
    catch (error) {
        console.error('createProperty error', error);
        return response.status(500).json({ message: 'Не удалось создать объект' });
    }
}
