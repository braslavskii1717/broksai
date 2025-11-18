import { Schema, model, type Document } from 'mongoose';

type Coordinates = {
  lat: number;
  lng: number;
};

export interface PropertyDocument extends Document {
  title: string;
  address: string;
  description: string;
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
  dealType: 'buy' | 'rent' | 'daily';
  propertyType: string;
  images: string[];
  coverImage: string;
  amenities: string[];
  houseType: string;
  condition: string;
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
  coordinates: Coordinates;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  publishedAt: Date;
}

const PropertySchema = new Schema<PropertyDocument>(
  {
    title: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator(coords: number[]) {
            if (!Array.isArray(coords) || coords.length !== 2) return false;
            const [lng, lat] = coords;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges',
        },
      },
    },
    description: { type: String, default: '' },
    district: { type: String, required: true },
    city: { type: String, required: true },
    cityId: { type: Number, required: true, index: true },
    status: { type: String, required: true, default: 'available' },
    price: { type: Number, required: true },
    pricePerMeter: { type: Number, required: true },
    roomsCount: Number,
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    livingArea: Number,
    kitchenArea: Number,
    floorNumber: Number,
    totalFloors: Number,
    dealType: { type: String, enum: ['buy', 'rent', 'daily'], default: 'buy', index: true },
    propertyType: { type: String, index: true, required: true },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: 'Необходимо минимум одно фото',
      },
    },
    coverImage: { type: String, required: true },
    amenities: { type: [String], default: [] },
    houseType: String,
    condition: String,
    hasPhotos: Boolean,
    hasVideo: Boolean,
    hasVirtualTour: Boolean,
    onlineShowing: Boolean,
    mortgage: Boolean,
    installment: Boolean,
    newBuilding: Boolean,
    developer: { type: String, index: true },
    view: String,
    parkingType: String,
    petFriendly: Boolean,
    accessibilityFriendly: Boolean,
    metroDistance: Number,
    metroName: String,
    metroLine: String,
    coordinates: { lat: Number, lng: Number },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const PROPERTY_TEXT_INDEX = {
  spec: { title: 'text', address: 'text', description: 'text' } as const,
  options: {
    name: 'property_text_search',
    weights: {
      title: 10,
      address: 7,
      description: 3,
    },
    default_language: 'russian',
  },
};

PropertySchema.index(PROPERTY_TEXT_INDEX.spec, PROPERTY_TEXT_INDEX.options);

PropertySchema.index({ title: 1 });

PropertySchema.index({ coordinates: '2dsphere' });
PropertySchema.index({ location: '2dsphere' });

export const Property = model<PropertyDocument>('Property', PropertySchema);
