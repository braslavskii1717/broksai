import axios from 'axios';

interface YandexGeocoderResponse {
  response: {
    GeoObjectCollection: {
      featureMember: Array<{
        GeoObject: {
          Point: {
            pos: string;
          };
          metaDataProperty: {
            GeocoderMetaData: {
              Address: {
                formatted: string;
                Components?: Array<{ kind: string; name: string }>;
              };
            };
          };
          description?: string;
          name?: string;
        };
      }>;
    };
  };
}

export interface GeocodingResult {
  coordinates: [number, number];
  formattedAddress: string;
  components?: {
    country?: string;
    city?: string;
    district?: string;
    street?: string;
    house?: string;
    postalCode?: string;
  };
}

export class YandexMapsService {
  private apiKey: string;
  private readonly baseUrl = 'https://geocode-maps.yandex.ru/1.x/';

  constructor() {
    this.apiKey = process.env.YANDEX_MAPS_API_KEY ?? '';
    if (!this.apiKey) {
      console.warn('⚠️  Yandex Maps API key not configured. Geocoding disabled.');
    }
  }

  async geocode(address: string): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      console.warn('Geocoding skipped: no API key');
      return null;
    }
    try {
      const response = await axios.get<YandexGeocoderResponse>(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          geocode: address,
          format: 'json',
          results: 1,
        },
        timeout: 5000,
      });
      const geoObject = response.data.response.GeoObjectCollection.featureMember?.[0]?.GeoObject;
      if (!geoObject) return null;
      const [lng, lat] = geoObject.Point.pos.split(' ').map(Number);
      const addressData = geoObject.metaDataProperty.GeocoderMetaData.Address;
      const components = this.parseAddressComponents(addressData.Components ?? []);
      return {
        coordinates: [lng, lat],
        formattedAddress: addressData.formatted,
        components,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async reverseGeocode(lng: number, lat: number): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      console.warn('Reverse geocoding skipped: no API key');
      return null;
    }
    try {
      const response = await axios.get<YandexGeocoderResponse>(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          geocode: `${lng},${lat}`,
          format: 'json',
          results: 1,
        },
        timeout: 5000,
      });
      const geoObject = response.data.response.GeoObjectCollection.featureMember?.[0]?.GeoObject;
      if (!geoObject) return null;
      const addressData = geoObject.metaDataProperty.GeocoderMetaData.Address;
      const components = this.parseAddressComponents(addressData.Components ?? []);
      return {
        coordinates: [lng, lat],
        formattedAddress: addressData.formatted,
        components,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  private parseAddressComponents(components: Array<{ kind: string; name: string }>) {
    const result: GeocodingResult['components'] = {};
    for (const component of components) {
      switch (component.kind) {
        case 'country':
          result.country = component.name;
          break;
        case 'province':
        case 'locality':
          result.city ??= component.name;
          break;
        case 'district':
          result.district = component.name;
          break;
        case 'street':
          result.street = component.name;
          break;
        case 'house':
          result.house = component.name;
          break;
        case 'postal_code':
          result.postalCode = component.name;
          break;
        default:
          break;
      }
    }
    return result;
  }

  async enrichProperty(property: any): Promise<any> {
    if (property.location?.coordinates?.length === 2) {
      return property;
    }
    if (property.address) {
      const geocoded = await this.geocode(property.address);
      if (geocoded) {
        property.location = {
          type: 'Point',
          coordinates: geocoded.coordinates,
        };
        if (geocoded.components) {
          property.city ||= geocoded.components.city;
          property.district ||= geocoded.components.district;
        }
      }
    }
    return property;
  }

  async batchGeocode(addresses: string[], delayMs = 100): Promise<Array<GeocodingResult | null>> {
    const results: Array<GeocodingResult | null> = [];
    for (const address of addresses) {
      const result = await this.geocode(address);
      results.push(result);
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    return results;
  }
}

export const yandexMapsService = new YandexMapsService();
