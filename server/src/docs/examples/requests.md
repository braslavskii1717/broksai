# BroksAI API Request Examples

## Search (`GET /api/search`)

**cURL**
```bash
curl -X GET "http://localhost:4000/api/search" \
  -H "Accept: application/json" \
  --data-urlencode "q=квартира" \
  --data-urlencode "limit=10"
```

**JavaScript (fetch)**
```js
const response = await fetch('http://localhost:4000/api/search?q=квартира&limit=10');
const data = await response.json();
console.log(data.results);
```

**TypeScript (axios)**
```ts
import axios from 'axios';

type SearchResponse = {
  results: Array<{ _id: string; title: string }>;
  total: number;
  metadata: { query: string; responseTime: number };
};

const { data } = await axios.get<SearchResponse>('http://localhost:4000/api/search', {
  params: { q: 'квартира', limit: 10 },
});
```

**Python (requests)**
```python
import requests

response = requests.get(
    'http://localhost:4000/api/search',
    params={'q': 'квартира', 'limit': 10}
)
data = response.json()
print(data['metadata']['responseTime'])
```

**Response**
```json
{
  "results": [
    { "_id": "65f934f082ecad7ebce1f111", "title": "2-комнатная квартира на Арбате" }
  ],
  "total": 42,
  "metadata": {
    "query": "квартира",
    "limit": 10,
    "offset": 0,
    "fuzzyUsed": false,
    "responseTime": 187
  }
}
```

## Autocomplete (`GET /api/search/autocomplete`)

**cURL**
```bash
curl -G "http://localhost:4000/api/search/autocomplete" \
  --data-urlencode "q=пан"
```

**JavaScript (fetch)**
```js
const response = await fetch('http://localhost:4000/api/search/autocomplete?q=пан');
const data = await response.json();
console.log(data.suggestions.map((s) => s.text));
```

**Python (requests)**
```python
import requests

response = requests.get('http://localhost:4000/api/search/autocomplete', params={'q': 'пан'})
print(response.json())
```

**Response**
```json
{
  "suggestions": [
    { "text": "панорамная квартира", "frequency": 120, "type": "title" }
  ],
  "metadata": {
    "query": "пан",
    "count": 1,
    "responseTime": 38,
    "cached": true
  }
}
```

## Analytics (`/api/analytics/search/*`)

Все запросы требуют **Bearer** токен администратора.

### Популярные запросы

**cURL**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/analytics/search/popular"
```

**JavaScript (fetch)**
```js
const response = await fetch('http://localhost:4000/api/analytics/search/popular', {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await response.json();
```

### Неудачные запросы

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/analytics/search/failed"
```

### Медленные запросы

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/analytics/search/slow"
```

### Общая статистика

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/analytics/search/stats"
```

**Response Example (stats)**
```json
{
  "totalSearches": 15234,
  "uniqueQueries": 3421,
  "avgResponseTime": 198,
  "fuzzyUsageRate": 0.05,
  "zeroResultsRate": 0.12,
  "period": "last_7_days"
}
```
