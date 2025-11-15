import { russianCities } from '@/data/cities';
import type { NaturalLanguageSearchResult } from '@/domain/nlp';

const pricePatterns = [
  { regex: /(\d+[\.,]?\d*)\s*(млн|миллион)/i, multiplier: 1_000_000 },
  { regex: /(\d+[\.,]?\d*)\s*(тыс|тис|к)/i, multiplier: 1_000 },
  { regex: /(\d+[\.,]?\d*)\s*(руб|₽)/i, multiplier: 1 },
];

const propertyKeywords: Record<string, string[]> = {
  apartment: ['квартира', 'квартиру', 'апартам', 'апартаменты', 'апартамент'],
  house: ['дом', 'коттедж', 'таунхаус'],
  penthouse: ['пентхаус'],
  loft: ['лофт'],
};

const dealKeywords = {
  buy: ['купить', 'покупка', 'хочу купить', 'продажа', 'продать'],
  rent: ['снять', 'аренда', 'съём', 'снять квартиру'],
} as const;

const roomRegex = /(\d+)(\s|-)комн|студия|1ком|2ком|3ком|4ком/gi;

export function parseNaturalLanguage(query: string): NaturalLanguageSearchResult {
  const normalized = query.toLowerCase();
  const result: NaturalLanguageSearchResult = { query };

  const matchedCity = russianCities.find((city) => normalized.includes(city.name.toLowerCase()));
  if (matchedCity) {
    result.cityId = matchedCity.id;
    result.cityName = matchedCity.name;
  }

  for (const [deal, words] of Object.entries(dealKeywords)) {
    if (words.some((word) => normalized.includes(word))) {
      result.dealType = deal as NaturalLanguageSearchResult['dealType'];
      break;
    }
  }

  const propertyTypes = Object.entries(propertyKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([type]) => type);
  if (propertyTypes.length) {
    result.propertyTypes = propertyTypes;
  }

  for (const pattern of pricePatterns) {
    const match = normalized.match(pattern.regex);
    if (match && match[1]) {
      const value = parseFloat(match[1].replace(',', '.')) * pattern.multiplier;
      if (!result.priceMax || value < result.priceMax) {
        result.priceMax = Math.round(value);
      }
    }
  }

  const rooms: string[] = [];
  let roomMatch;
  while ((roomMatch = roomRegex.exec(normalized)) !== null) {
    if (roomMatch[0].includes('студ')) {
      rooms.push('studio');
    } else if (roomMatch[1]) {
      rooms.push(roomMatch[1]);
    }
  }
  if (rooms.length) {
    result.rooms = Array.from(new Set(rooms));
  }

  const floorMatch = normalized.match(/(не\s+)?перв(ый|ом)|высок(ий|ом)|средн(ий|ем)/i);
  if (floorMatch) {
    if (floorMatch[0].includes('не')) {
      result.floorMin = 2;
    } else if (floorMatch[0].includes('высок')) {
      result.floorMin = 10;
    }
  }

  return result;
}
