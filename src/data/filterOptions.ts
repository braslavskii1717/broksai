export type Option<T extends string = string> = { value: T; label: string };

export const propertyTypeOptions: Option[] = [
  { value: 'apartment', label: 'Квартиры' },
  { value: 'penthouse', label: 'Пентхаусы' },
  { value: 'loft', label: 'Лофты' },
  { value: 'house', label: 'Дома/коттеджи' },
  { value: 'townhouse', label: 'Таунхаусы' },
];

export const roomOptions: Option[] = [
  { value: 'studio', label: 'Студия' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5+', label: '5+' },
];

export const bathroomOptions: Option[] = [
  { value: '1', label: '1 санузел' },
  { value: '2', label: '2 санузла' },
  { value: '3+', label: '3+ санузла' },
];

export const houseTypeOptions: Option[] = [
  { value: 'brick', label: 'Кирпичный' },
  { value: 'panel', label: 'Панельный' },
  { value: 'monolith', label: 'Монолитный' },
  { value: 'timber', label: 'Деревянный' },
];

export const conditionOptions: Option[] = [
  { value: 'shell', label: 'Без отделки' },
  { value: 'cosmetic', label: 'Косметический' },
  { value: 'euro', label: 'Евроремонт' },
  { value: 'designer', label: 'Дизайнерский' },
];

export const amenityOptions: Option[] = [
  { value: 'parking', label: 'Парковка' },
  { value: 'underground_parking', label: 'Подземная парковка' },
  { value: 'elevator', label: 'Лифт' },
  { value: 'cargo_elevator', label: 'Грузовой лифт' },
  { value: 'security', label: 'Охрана' },
  { value: 'concierge', label: 'Консьерж' },
  { value: 'video', label: 'Видеонаблюдение' },
  { value: 'storage', label: 'Кладовая' },
  { value: 'balcony', label: 'Балкон/лоджия' },
  { value: 'terrace', label: 'Терраса' },
  { value: 'conditioner', label: 'Кондиционер' },
  { value: 'smart_home', label: 'Умный дом' },
  { value: 'floor_heating', label: 'Тёплый пол' },
  { value: 'electric_vehicle', label: 'Зарядка для EV' },
];

export const developerOptions: Option[] = [
  { value: 'pik', label: 'ПИК' },
  { value: 'samolyot', label: 'Самолет' },
  { value: 'etalons', label: 'Эталон' },
  { value: 'fsq', label: 'ФСК' },
  { value: 'level', label: 'Level Group' },
];

export const viewOptions: Option[] = [
  { value: 'park', label: 'На парк' },
  { value: 'river', label: 'На реку' },
  { value: 'city', label: 'На город' },
  { value: 'courtyard', label: 'Во двор' },
  { value: 'forest', label: 'На лес' },
];

export const parkingOptions: Option[] = [
  { value: 'underground', label: 'Подземная' },
  { value: 'yard', label: 'Дворовая' },
  { value: 'covered', label: 'Навес' },
  { value: 'guest', label: 'Гостевая' },
];

export const publishedDateOptions: Option<'today' | 'week' | 'month'>[] = [
  { value: 'today', label: 'За сегодня' },
  { value: 'week', label: 'За неделю' },
  { value: 'month', label: 'За месяц' },
];

export const metroDistanceOptions = [500, 1000, 2000, 3000, 5000];
