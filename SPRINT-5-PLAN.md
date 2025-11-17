# Sprint 5 Plan — Interactive Map (Owner: Пётр)

## Goals & Scope
1. **Интерактивная карта объектов** с реальными координатами.
2. **Кластеризация маркеров** для тысяч предложений.
3. **Popup окна** с ключевой информацией и CTA.

## Timeline (7 дней)
| Day | Focus |
| --- | --- |
| 1 | Настройка Mapbox/Google Maps SDK, токены, базовый слой |
| 2 | Рендер маркеров, загрузка данных из API |
| 3 | Кластеризация (supercluster / mapbox cluster) |
| 4 | Popup UX, навигация, deep links |
| 5 | Тестирование задачи 10 (map functionality) |
| 6 | Тестирование задачи 11 (marker clustering) |
| 7 | Тестирование задачи 12 (popup windows), багфиксы |

## Deliverables
- Интерактивная карта с фильтрами.
- Автотесты для карты (Jest + Playwright).
- Документация: Map SDK setup, performance guidelines.

## Dependencies
- Map provider key (Google Maps или Mapbox).
- API endpoint: `/api/properties?bounds=...` (готов).
- Дизайн UX для popup (Figma ссылку предоставить дизайнер).

## Risks & Mitigation
- **Quota limits** → включить tile caching и environment-specific ключи.
- **Performance** → ограничить маркеры, включить серверную агрегацию.
- **Mobile UX** → адаптивные popup + gestures.

## Acceptance Criteria
1. Карта отображает минимум 1000 объектов без лагов.
2. Кластер (>=5 маркеров) раскрывается при zoom.
3. Popup содержит название, цену, CTA.
4. Тесты задач 10–12 проходят.
5. Документация обновлена (README + Swagger hints).
