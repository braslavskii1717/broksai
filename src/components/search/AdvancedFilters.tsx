'use client';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { usePropertyFeedContext } from '@/context/PropertyFeedContext';
import type { PropertyFilters } from '@/domain/filters';
import {
  amenityOptions,
  bathroomOptions,
  conditionOptions,
  developerOptions,
  houseTypeOptions,
  metroDistanceOptions,
  parkingOptions,
  propertyTypeOptions,
  publishedDateOptions,
  roomOptions,
  viewOptions,
} from '@/data/filterOptions';
import { FiltersSkeleton } from '@/components/skeletons/FiltersSkeleton';
import { usePropertyFeed } from '@/hooks/usePropertyFeed';

type BooleanField =
  | 'hasPhotos'
  | 'hasVideo'
  | 'hasVirtualTour'
  | 'onlineShowing'
  | 'mortgage'
  | 'installment'
  | 'newBuilding'
  | 'petFriendly'
  | 'accessibilityFriendly'
  | 'excludeFirstFloor'
  | 'excludeTopFloor';

const quickToggleKeys: { key: BooleanField; label: string }[] = [
  { key: 'hasPhotos', label: 'Только с фото' },
  { key: 'hasVideo', label: 'С видео' },
  { key: 'hasVirtualTour', label: '3D-тур' },
  { key: 'onlineShowing', label: 'Онлайн-показ' },
  { key: 'mortgage', label: 'Ипотека' },
  { key: 'installment', label: 'Рассрочка' },
  { key: 'newBuilding', label: 'Новостройки' },
  { key: 'petFriendly', label: 'Можно с питомцами' },
  { key: 'accessibilityFriendly', label: 'Безбарьерная среда' },
];

type NumericField =
  | 'priceMin'
  | 'priceMax'
  | 'pricePerMeterMin'
  | 'pricePerMeterMax'
  | 'totalAreaMin'
  | 'totalAreaMax'
  | 'livingAreaMin'
  | 'livingAreaMax'
  | 'kitchenAreaMin'
  | 'kitchenAreaMax'
  | 'floorMin'
  | 'floorMax'
  | 'buildYearMin'
  | 'buildYearMax'
  | 'metroDistanceMax';

type ArrayField =
  | 'rooms'
  | 'bathrooms'
  | 'propertyTypes'
  | 'houseTypes'
  | 'conditions'
  | 'amenities'
  | 'developers'
  | 'views'
  | 'parking';

export function AdvancedFilters() {
  const { state, updateFilters, resetFilters } = usePropertyFeedContext();
  const filters = state.filters;
  const { isLoading, properties } = usePropertyFeed();
  const shouldShowSkeleton = isLoading && properties.length === 0;

  if (shouldShowSkeleton) {
    return <FiltersSkeleton />;
  }

  const handleNumericChange = (field: NumericField, value: string) => {
    updateFilters({ [field]: value === '' ? null : Number(value) } as Partial<PropertyFilters>);
  };

  const toggleBoolean = (field: BooleanField) => {
    updateFilters({ [field]: !filters[field] } as Partial<PropertyFilters>);
  };

  const toggleValue = (field: ArrayField, value: string) => {
    const current = filters[field];
    const exists = current.includes(value);
    const next = exists ? current.filter((item) => item !== value) : [...current, value];
    updateFilters({ [field]: next } as Partial<PropertyFilters>);
  };

  return (
    <section className="rounded-3xl bg-white/90 p-6 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Фильтры</p>
          <h2 className="text-xl font-semibold text-neutral-900">Подбор по 30+ параметрам</h2>
        </div>
        <Button variant="secondary" size="sm" onClick={resetFilters}>
          Сбросить
        </Button>
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <p className="text-xs uppercase text-neutral-500">Быстрые фильтры</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickToggleKeys.map((toggle) => (
              <Chip key={toggle.key} active={filters[toggle.key]} onClick={() => toggleBoolean(toggle.key)}>
                {toggle.label}
              </Chip>
            ))}
          </div>
        </section>

        <FilterSection title="Цена">
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Мин." value={filters.priceMin} onChange={(value) => handleNumericChange('priceMin', value)} />
            <NumberInput label="Макс." value={filters.priceMax} onChange={(value) => handleNumericChange('priceMax', value)} />
            <NumberInput label="Цена за м² от" value={filters.pricePerMeterMin} onChange={(value) => handleNumericChange('pricePerMeterMin', value)} />
            <NumberInput label="до" value={filters.pricePerMeterMax} onChange={(value) => handleNumericChange('pricePerMeterMax', value)} />
          </div>
        </FilterSection>

        <FilterSection title="Площадь и планировка">
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Общая от" value={filters.totalAreaMin} onChange={(value) => handleNumericChange('totalAreaMin', value)} />
            <NumberInput label="Общая до" value={filters.totalAreaMax} onChange={(value) => handleNumericChange('totalAreaMax', value)} />
            <NumberInput label="Жилая от" value={filters.livingAreaMin} onChange={(value) => handleNumericChange('livingAreaMin', value)} />
            <NumberInput label="Жилая до" value={filters.livingAreaMax} onChange={(value) => handleNumericChange('livingAreaMax', value)} />
            <NumberInput label="Кухня от" value={filters.kitchenAreaMin} onChange={(value) => handleNumericChange('kitchenAreaMin', value)} />
            <NumberInput label="Кухня до" value={filters.kitchenAreaMax} onChange={(value) => handleNumericChange('kitchenAreaMax', value)} />
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-xs uppercase text-neutral-500">Комнаты</p>
              <div className="flex flex-wrap gap-2">
                {roomOptions.map((option) => (
                  <Chip key={option.value} active={filters.rooms.includes(option.value)} onClick={() => toggleValue('rooms', option.value)}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase text-neutral-500">Санузлы</p>
              <div className="flex flex-wrap gap-2">
                {bathroomOptions.map((option) => (
                  <Chip key={option.value} active={filters.bathrooms.includes(option.value)} onClick={() => toggleValue('bathrooms', option.value)}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Тип и состояние">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-neutral-500">Тип недвижимости</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {propertyTypeOptions.map((option) => (
                  <Chip key={option.value} active={filters.propertyTypes.includes(option.value)} onClick={() => toggleValue('propertyTypes', option.value)}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-500">Тип дома</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {houseTypeOptions.map((option) => (
                  <Chip key={option.value} active={filters.houseTypes.includes(option.value)} onClick={() => toggleValue('houseTypes', option.value)}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-500">Состояние</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {conditionOptions.map((option) => (
                  <Chip key={option.value} active={filters.conditions.includes(option.value)} onClick={() => toggleValue('conditions', option.value)}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Этаж и год">
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Этаж от" value={filters.floorMin} onChange={(value) => handleNumericChange('floorMin', value)} />
            <NumberInput label="Этаж до" value={filters.floorMax} onChange={(value) => handleNumericChange('floorMax', value)} />
            <NumberInput label="Год постройки от" value={filters.buildYearMin} onChange={(value) => handleNumericChange('buildYearMin', value)} />
            <NumberInput label="до" value={filters.buildYearMax} onChange={(value) => handleNumericChange('buildYearMax', value)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={filters.excludeFirstFloor} onChange={() => toggleBoolean('excludeFirstFloor')} />
              Не первый этаж
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={filters.excludeTopFloor} onChange={() => toggleBoolean('excludeTopFloor')} />
              Не последний этаж
            </label>
          </div>
        </FilterSection>

        <FilterSection title="Удобства и сервисы">
          <div className="grid grid-cols-2 gap-3">
            {amenityOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(option.value)}
                  onChange={() => toggleValue('amenities', option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Локация и карта">
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase text-neutral-500">Расстояние до метро</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip active={filters.metroDistanceMax === null} onClick={() => updateFilters({ metroDistanceMax: null })}>
                  Любое
                </Chip>
                {metroDistanceOptions.map((distance) => (
                  <Chip
                    key={distance}
                    active={filters.metroDistanceMax === distance}
                    onClick={() => updateFilters({ metroDistanceMax: distance })}
                  >
                    до {distance / 1000} км
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-500">Вид из окон</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {viewOptions.map((option) => (
                  <Chip key={option.value} active={filters.views.includes(option.value)} onClick={() => toggleValue('views', option.value)}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-500">Парковка</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {parkingOptions.map((option) => (
                  <Chip key={option.value} active={filters.parking.includes(option.value)} onClick={() => toggleValue('parking', option.value)}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Застройщики и дата публикации">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-neutral-500">Застройщик</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {developerOptions.map((option) => (
                  <Chip key={option.value} active={filters.developers.includes(option.value)} onClick={() => toggleValue('developers', option.value)}>
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-500">Дата публикации</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {publishedDateOptions.map((option) => (
                  <Chip
                    key={option.value}
                    active={filters.publishedDate === option.value}
                    onClick={() => updateFilters({ publishedDate: filters.publishedDate === option.value ? null : option.value })}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>
      </div>
    </section>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
      <div className="mt-3 rounded-2xl border border-neutral-100 bg-white/60 p-4">{children}</div>
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number | null; onChange: (value: string) => void }) {
  return (
    <label className="text-sm text-neutral-600">
      <span className="mb-1 block text-xs uppercase text-neutral-400">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
