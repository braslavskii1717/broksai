export type CityRecord = {
  id: number;
  name: string;
  region: string;
  coordinates: [number, number];
};

export const russianCities: CityRecord[] = [
  { id: 1, name: 'Москва', region: 'Московская область', coordinates: [55.7558, 37.6173] },
  { id: 2, name: 'Санкт-Петербург', region: 'Ленинградская область', coordinates: [59.9311, 30.3609] },
  { id: 3, name: 'Новосибирск', region: 'Новосибирская область', coordinates: [55.0084, 82.9357] },
  { id: 4, name: 'Екатеринбург', region: 'Свердловская область', coordinates: [56.8389, 60.6057] },
  { id: 5, name: 'Казань', region: 'Татарстан', coordinates: [55.8304, 49.0661] },
  { id: 6, name: 'Нижний Новгород', region: 'Нижегородская область', coordinates: [56.2965, 43.9361] },
];
