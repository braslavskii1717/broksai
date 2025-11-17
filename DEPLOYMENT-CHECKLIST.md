# Deployment Checklist — BroksAI Search Platform

## Pre-Deploy
- [ ] Confirm `main` branch green (CI, tests, lint).
- [ ] Update `.env` with production secrets (Mongo URI, JWT_SECRET, SLACK webhook).
- [ ] Verify `openapi.yaml` is up-to-date (`npm run build-docs` if изменится).
- [ ] Run `npm run test:search`, `npm run test:analytics`, `npm run test:fuzzy`, `npm run test:autocomplete`.
- [ ] Check PerformanceTracker baseline file `.performance-baseline.json` committed.

## Infrastructure
- [ ] MongoDB cluster healthy, TTL index (`searchLogs`) validated.
- [ ] Application servers scaled (min 2 instances) и health probes настроены.
- [ ] CDN/Load balancer routes `/api/*`, `/api-docs/*`.
- [ ] Logging/monitoring stack (Grafana, Loki) подключены.

## Deployment Steps
1. `npm ci && npm run build`.
2. Создать Docker image `broks-search:<tag>` и push в registry.
3. Apply Kubernetes manifest / PM2 restart (environment-dependent).
4. Run `npm run seed` (если требуется) на staging, **не** на production.
5. Smoke-test `/health`, `/api/search?q=ping`, `/api-docs`.

## Post-Deploy Validation
- [ ] Monitor latency dashboards (search <500 мс, autocomplete <100 мс).
- [ ] Проверить Slack alerts (отправить тест).
- [ ] Убедиться, что `SearchLog` пишет данные (время вставки <5 с после запроса).
- [ ] Проверить rate limiter (analytics → ожидаемый `429`).
- [ ] Обновить stakeholders (канал #release).

## Rollback Plan
- [ ] `kubectl rollout undo` / previous Docker tag готов.
- [ ] MongoDB backup point-in-time.
- [ ] Disable new traffic через load balancer при необходимости.

## Staging → Production Gates
- [ ] QA sign-off о прохождении тестов.
- [ ] Security review (OWASP) завершён.
- [ ] Product approval (PO/PT). 
