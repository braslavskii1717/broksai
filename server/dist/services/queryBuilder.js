"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPropertyQuery = buildPropertyQuery;
const zod_1 = require("zod");
const querySchema = zod_1.z.object({
    cityId: zod_1.z.string().optional(),
    dealType: zod_1.z.enum(['buy', 'rent', 'daily']).optional(),
    propertyType: zod_1.z.string().optional(),
    priceMin: zod_1.z.string().optional(),
    priceMax: zod_1.z.string().optional(),
    amenities: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
});
function buildPropertyQuery(query) {
    const parsed = querySchema.safeParse(query);
    if (!parsed.success) {
        return { filters: {}, limit: 24 };
    }
    const { cityId, dealType, propertyType, priceMin, priceMax, amenities, search, limit } = parsed.data;
    const filters = {};
    if (cityId)
        filters.cityId = Number(cityId);
    if (dealType)
        filters.dealType = dealType;
    if (propertyType)
        filters.propertyType = { $in: propertyType.split(',') };
    if (priceMin || priceMax) {
        filters.price = {};
        if (priceMin)
            filters.price.$gte = Number(priceMin);
        if (priceMax)
            filters.price.$lte = Number(priceMax);
    }
    if (amenities) {
        filters.amenities = { $all: amenities.split(',') };
    }
    if (search) {
        filters.$or = [
            { title: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } },
            { district: { $regex: search, $options: 'i' } },
        ];
    }
    return { filters, limit: limit ? Number(limit) : 24 };
}
