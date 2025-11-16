# BROKS Platform · Sprint 4

Спринт фокусируется на связке с видом Express API, пользовательском опыте поиска и бэкенд-воркфлоу:

## Новое
- **Модуль аутентификации.** Страница `/auth` работает с Express (`/api/auth/register|login|me`), создаёт пользователей в MongoDB, выдаёт JWT на 7 дней и синхронизирует состояние в хедере/избранном.
- **Личный кабинет и размещение объявлений.** Раздел `/account` показывает профиль, избранное и черновики. Кнопка «Добавить объект» появляется только после авторизации и ведёт в личный кабинет, до входа отображается CTA «Регистрация».
- **Remote API toggle.** `apiFetch` автоматически проксирует запросы на `NEXT_PUBLIC_API_URL`. Детальная страница (`/property/[id]`) делает SSR-фетч внешнего API с безопасным фоллбеком на моковые данные.
- **Сохранённые поиски и улучшенный UX.** Панель SavedSearch хранит текущий запрос/фильтры в `localStorage`, выдача показывает город, режим, счетчик фильтров, пустые и error состояния.
- **Dev workflow.** Добавлены `.env.local.example`, скрипты `server:dev`, `server:seed`, `dev:full` (concurrently фронт+бэкенд) и расширенная документация.
- **Backend scaffold** (из Sprint 3) продолжает развиваться — генерация 100 объектов faker + Mongo модель остаются основой.

## Frontend структура
```
app/
  layout.tsx            # Root layout + AppProviders
  providers.tsx         # QueryClientProvider + контексты
  (site)/               # Главная, Поиск, Карточка, Агенты, etc.
  api/
    properties/         # Next route handlers (mock API)
components/
  home/, layout/, map/, property/, search/, ui/
context/               # CityContext, PropertyFeedContext
hooks/                 # usePropertyFeed, usePropertyClusters
lib/api/               # fetcher + property/city services (env-aware base URL)
services/              # propertyRepository (моковый источник данных)
data/                  # города, фильтр-опции, моковые объекты с координатами
styles/                # дизайн-токены и типографика
```

## Backend API (`server/`)
- `src/index.ts` — Express + CORS, healthcheck, маршруты `/api/properties`, `/api/cities`.
- `src/models/Property.ts` — Mongoose schema, индексы, поддержка ключевых фильтров.
- `src/services/queryBuilder.ts` — Zod-валидация query-параметров и преобразование в Mongo фильтры.
- `src/seeds/generateProperties.ts` & `seedDatabase.ts` — генерация 100 объектов (faker) и загрузка в Mongo.
- `src/routes/uploads.ts` + `uploadController` — безопасная загрузка фотографий (JPG/PNG, до 3 МБ) с оптимизацией через Sharp и автоматическим сохранением в `/uploads`.
- `src/routes/properties.ts` (POST) — создание объекта через API требует хотя бы одну фотографию (`images`), иначе запрос отклоняется.

### Auth API (`/api/auth`)
| Method | Path | Описание |
| ------ | ---- | -------- |
| `POST` | `/register` | Создаёт пользователя, ожидает `{ name, email, password, phone?, company?, role? }`. |
| `POST` | `/login` | Возвращает `{ data: { user, token } }` для действующих email/пароля. |
| `GET`  | `/me` | Читает `Authorization: Bearer <JWT>` и отдаёт профиль. |

Настройте `JWT_SECRET` и `MONGODB_URI` в `server/.env`. Пароли хэшируются `bcrypt`, токен действует 7 дней. Ошибки валидации (Zod) возвращают понятные сообщения и поля.

Запуск:
```bash
cd server
cp .env.example .env          # укажите MONGODB_URI, CLIENT_ORIGIN и JWT_SECRET (необязательно для dev)
npm install
npm run dev                   # Express API на http://localhost:4000
npm run seed                  # опционально заполнить БД
```
> Если `MONGODB_URI` не указан и `NODE_ENV !== production`, сервер применит in-memory MongoDB (mongodb-memory-server). Это удобно для локальных тестов — данные живут пока запущен процесс.

### Upload API
```bash
# Загрузка фото
curl -X POST http://localhost:4000/api/uploads/photo \
  -F "photo=@/path/to/flat.jpg"
# => { "url": "/uploads/property-...jpg" }

# Создание объекта (фото обязательно)
curl -X POST http://localhost:4000/api/properties \
  -H "Content-Type: application/json" \
  -d '{ "title":"Demo", "address":"ул. Тестовая, 1", "district":"Центр", "city":"Москва",
        "cityId":1, "status":"available", "price":10000000, "pricePerMeter":250000,
        "dealType":"buy", "propertyType":"apartment",
        "images":["/uploads/property-123.jpg"] }'
```

## Frontend запуск
```bash
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL уже указывает на http://localhost:4000
npm install
npm run dev                        # поднимет и Next.js, и Express сервер
open docs/admin-guide.md           # Инструкция для админа (PDF/MD)
```
`npm run dev` теперь запускает `next dev` и `server/src/index.ts` параллельно через `concurrently`, поэтому «Failed to fetch» исчезает — API автоматически готов вместе с фронтендом. Если хотите отделить процессы, используйте `npm run dev:web` (только Next) и `npm run server:dev`.

`NEXT_PUBLIC_API_URL` пустой → используется встроенный mock API (`app/api`). Если указан URL (локальный или прод), весь React Query слой и SSR детальной страницы обращаются к внешнему Express серверу.

Линтинг: `npm run lint`

### Аутентификация на фронте
- Страница `/auth` содержит объединённую форму входа/регистрации. После успешного запроса пользователь перенаправляется к поиску, профиль и токен сохраняются в `localStorage`.
- Хедер (`SiteHeader`) показывает имя, роль и кнопку «Выйти» при активной сессии. Все действия, использующие `useAuthGuard`, ожидают завершения авторизации.
- Убедитесь, что `NEXT_PUBLIC_API_URL` указывает на ваш Express (`http://localhost:4000`) и сервер запущен (`npm run server:dev` или `npm run dev:full`), чтобы запросы `/api/auth/*` доходили до Mongo.

## Roadmap
1. Переключить остальные страницы (Home, Recommend, Dashboard) на данные Express/Mongo и добавить SSR/ISR.
2. Подключить AI-агента, чат (Socket.io) и уведомления по сохранённым поискам.
3. Встроить Яндекс.Карты/Mapbox, split view + геокодер, а также интеграцию LangChain/OpenAI.
