# BroksAI Search API

Документация по публичному поисковому API платформы BroksAI.

## Getting Started

1. Установите зависимости сервера и запустите backend:
   ```bash
   cd server
   npm install
   npm run dev
   ```
2. Swagger UI доступен по адресу [http://localhost:4000/api-docs](http://localhost:4000/api-docs).
3. Сырые спецификации находятся в `server/src/docs/openapi.yaml` (также доступны по `GET /api-docs/openapi.yaml`).

## Authentication

- Авторизация через Bearer токен (`Authorization: Bearer <token>`).
- Токен можно получить, вызвав endpoint аутентификации сервера (см. основной README).
- Срок жизни токена: 7 дней. Для обновления выполните повторную аутентификацию.
- Analytics endpoints доступны только пользователям с ролью `admin`.

## Endpoints Overview

| Endpoint | Метод | Описание |
| --- | --- | --- |
| `/api/search` | GET | Текстовый поиск по объектам недвижимости с fuzzy fallback |
| `/api/search/autocomplete` | GET | Подсказки на основе title/address с LRU-кэшем |
| `/api/analytics/search/popular` | GET | Топ-20 популярных запросов за 30 дней (admin) |
| `/api/analytics/search/failed` | GET | Запросы с нулевым результатом за 7 дней (admin) |
| `/api/analytics/search/slow` | GET | Запросы >500ms за 7 дней (admin) |
| `/api/analytics/search/stats` | GET | Общая статистика (admin) |

Подробные схемы и примеры находятся в Swagger UI.

## Rate Limiting

- `/api/search`: до 60 запросов в минуту на IP.
- `/api/search/autocomplete`: до 120 запросов в минуту на IP.
- `/api/analytics/search/*`: до 10 запросов в минуту на IP.

При превышении лимита возвращается `429 RATE_LIMITED`.

## Error Handling

Все ответы об ошибках следуют схеме:

```json
{
  "error": "ERROR_CODE",
  "message": "Человекочитаемое описание"
}
```

Коды ошибок: `INVALID_QUERY`, `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`, `SERVER_ERROR`.

## Code Examples

### cURL

```bash
curl -X GET "http://localhost:4000/api/search" \
  -H "Accept: application/json" \
  --data-urlencode "q=квартира" \
  --data-urlencode "limit=10"
```

### JavaScript (fetch)

```js
const response = await fetch('http://localhost:4000/api/search?q=квартира&limit=10');
const data = await response.json();
console.log(data.results);
```

### TypeScript (axios)

```ts
import axios from 'axios';

type SearchResponse = {
  results: Array<{ _id: string; title: string }>;
  total: number;
  metadata: { responseTime: number };
};

const { data } = await axios.get<SearchResponse>('http://localhost:4000/api/search', {
  params: { q: 'квартира', limit: 10 },
});
```

### Python (requests)

```python
import requests

response = requests.get(
    'http://localhost:4000/api/search',
    params={'q': 'квартира', 'limit': 10}
)
print(response.json())
```

Дополнительные примеры см. в `server/src/docs/examples/requests.md`.

## Swagger UI

- UI: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)
- OpenAPI spec: [http://localhost:4000/api-docs/openapi.yaml](http://localhost:4000/api-docs/openapi.yaml)

## Support

Вопросы и пожелания отправляйте команде BroksAI по адресу [api@broksai.com](mailto:api@broksai.com).
