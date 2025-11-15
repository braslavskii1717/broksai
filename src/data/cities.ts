export type City = {
  id: number;
  name: string;
  region: string;
  population: number;
  coordinates: [number, number];
  image: string;
};

type CityBase = Omit<City, 'image'>;

const baseCities: CityBase[] = [
  { id: 1, name: "Москва", region: "Московская область", population: 12655000, coordinates: [55.7558, 37.6173] },
  { id: 2, name: "Санкт-Петербург", region: "Ленинградская область", population: 5384000, coordinates: [59.9311, 30.3609] },
  { id: 3, name: "Новосибирск", region: "Новосибирская область", population: 1625000, coordinates: [55.0084, 82.9357] },
  { id: 4, name: "Екатеринбург", region: "Свердловская область", population: 1493000, coordinates: [56.8389, 60.6057] },
  { id: 5, name: "Казань", region: "Татарстан", population: 1258000, coordinates: [55.8304, 49.0661] },
  { id: 6, name: "Нижний Новгород", region: "Нижегородская область", population: 1245000, coordinates: [56.2965, 43.9361] },
  { id: 7, name: "Челябинск", region: "Челябинская область", population: 1187000, coordinates: [55.1644, 61.4368] },
  { id: 8, name: "Самара", region: "Самарская область", population: 1144000, coordinates: [53.1952, 50.1069] },
  { id: 9, name: "Омск", region: "Омская область", population: 1140000, coordinates: [54.9885, 73.3242] },
  { id: 10, name: "Ростов-на-Дону", region: "Ростовская область", population: 1138000, coordinates: [47.2357, 39.7015] },
  { id: 11, name: "Уфа", region: "Башкортостан", population: 1128000, coordinates: [54.7388, 55.9721] },
  { id: 12, name: "Красноярск", region: "Красноярский край", population: 1093000, coordinates: [56.0153, 92.8932] },
  { id: 13, name: "Воронеж", region: "Воронежская область", population: 1058000, coordinates: [51.672, 39.1843] },
  { id: 14, name: "Пермь", region: "Пермский край", population: 1055000, coordinates: [58.0105, 56.2502] },
  { id: 15, name: "Волгоград", region: "Волгоградская область", population: 1008000, coordinates: [48.708, 44.5133] },
  { id: 16, name: "Краснодар", region: "Краснодарский край", population: 948000, coordinates: [45.0355, 38.9753] },
  { id: 17, name: "Саратов", region: "Саратовская область", population: 838000, coordinates: [51.5924, 46.0348] },
  { id: 18, name: "Тюмень", region: "Тюменская область", population: 816000, coordinates: [57.1531, 65.5343] },
  { id: 19, name: "Тольятти", region: "Самарская область", population: 699000, coordinates: [53.5303, 49.3461] },
  { id: 20, name: "Ижевск", region: "Удмуртия", population: 648000, coordinates: [56.8519, 53.2048] },
  { id: 21, name: "Барнаул", region: "Алтайский край", population: 631000, coordinates: [53.3606, 83.7636] },
  { id: 22, name: "Ульяновск", region: "Ульяновская область", population: 625000, coordinates: [54.3142, 48.4031] },
  { id: 23, name: "Иркутск", region: "Иркутская область", population: 617000, coordinates: [52.2869, 104.305] },
  { id: 24, name: "Хабаровск", region: "Хабаровский край", population: 616000, coordinates: [48.4827, 135.0838] },
  { id: 25, name: "Ярославль", region: "Ярославская область", population: 608000, coordinates: [57.6261, 39.8845] },
  { id: 26, name: "Владивосток", region: "Приморский край", population: 606000, coordinates: [43.1056, 131.8735] },
  { id: 27, name: "Махачкала", region: "Дагестан", population: 604000, coordinates: [42.9849, 47.5047] },
  { id: 28, name: "Томск", region: "Томская область", population: 576000, coordinates: [56.4977, 84.9744] },
  { id: 29, name: "Оренбург", region: "Оренбургская область", population: 572000, coordinates: [51.7727, 55.0988] },
  { id: 30, name: "Кемерово", region: "Кемеровская область", population: 558000, coordinates: [55.3547, 86.0867] },
];

export const russianCities: City[] = baseCities.map((city) => ({
  ...city,
  image: `https://picsum.photos/seed/broks-city-${city.id}/960/640`,
}));

export const popularCities = russianCities.slice(0, 8);
