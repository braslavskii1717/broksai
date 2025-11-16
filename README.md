# 🤖 Codex ↔ Perplexity Automation

**Автоматическая генерация кода с валидацией через OpenAI GPT-4o и Perplexity AI**

> ⚡ Полностью автоматизированный workflow для генерации, валидации и создания Pull Requests с AI-генерированным кодом

---

## 🚀 Возможности

- ✅ **Полностью автоматическая** генерация кода через GitHub Issues
- ✅ **GPT-4o модель** для продвинутой генерации кода (Chat Completions API)
- ✅ **Perplexity Sonar Large** для глубокой валидации качества
- ✅ **Автоматические Pull Requests** с сгенерированным кодом
- ✅ **Расширенная обработка ошибок** с try-catch блоками
- ✅ **24/7 работа** без вашего участия
- ✅ **Issue Templates** для удобного создания запросов

---

## 📝 Как это работает

1. Создаёте Issue с меткой `codex-request`
2. GitHub Actions автоматически запускается
3. **OpenAI GPT-4o** генерирует код по вашему описанию
4. **Perplexity AI (llama-3.1-sonar-large-128k-online)** валидирует код на качество и безопасность
5. Создается Pull Request с результатами
6. Система автоматически комментирует issue с результатами
7. Вы получаете готовый код для review!

---

## ⚙️ Быстрая настройка

### Шаг 1: Получите API ключи

**OpenAI API:**
1. Перейдите на [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Создайте новый API ключ
3. ⚠️ Требуется доступ к GPT-4o (ChatGPT Plus/Pro)

**Perplexity API:**
1. Перейдите на [https://www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
2. Сгенерируйте API ключ
3. Добавьте ~$10 кредитов для тестирования

### Шаг 2: Добавьте секреты в GitHub

1. Откройте: `Settings` → `Secrets and variables` → `Actions`
2. Нажмите `New repository secret`
3. Добавьте два секрета:

```
Name: OPENAI_API_KEY
Value: [ваш действующий ключ OpenAI]

Name: PERPLEXITY_API_KEY
Value: [ваш ключ Perplexity]
```

⚠️ **ВАЖНО**: Убедитесь, что API ключи действующие и не истекшие!

### Шаг 3: Готово! 🎉

Все файлы уже созданы и настроены:

- ✅ `.github/workflows/codex-perplexity-automation.yml` (69 строк, 2.23 KB)
- ✅ `.github/scripts/codex-perplexity-integration.js` (216 строк, 7.94 KB)
- ✅ `.github/ISSUE_TEMPLATE/codex_request.md`
- ✅ `package.json`

---

## 📚 Использование

### Создайте Issue:

1. Перейдите во вкладку `Issues`
2. Нажмите `New issue`
3. Выберите шаблон **🤖 Codex Request**
4. Заполните:
   - **Description**: что нужно создать
   - **Requirements**: список требований
   - **Technologies**: какие технологии использовать
5. Добавьте метку `codex-request` (автоматически)
6. Нажмите `Submit new issue`

### Что происходит дальше:

- 🤖 GitHub Actions запускает workflow
- 💻 GPT-4o генерирует код
- 🔍 Perplexity Sonar Large проверяет качество
- 📦 Создается Pull Request
- 💬 Результаты публикуются в комментариях

---

## 🔧 Технические детали

### Используемые технологии:

**OpenAI Integration:**
- Модель: `gpt-4o`
- API: Chat Completions API (с поддержкой streaming)
- Организация и проект: настраиваемые через переменные окружения
- Обработка ошибок: полная с try-catch блоками

**Perplexity Integration:**
- Модель: `llama-3.1-sonar-large-128k-online`
- Max tokens: 2000 (увеличено для детального анализа)
- System prompt: расширенный для глубокой code review
- Анализирует: структуру, безопасность, производительность, best practices

**GitHub Actions Workflow:**
- Разрешения: `contents:write`, `issues:write`, `pull-requests:write`
- Триггер: создание/обновление issue с меткой `codex-request`
- Node.js: v20
- Dependencies: `@octokit/rest`, `axios`

---

## 📁 Структура проекта

```
broksai/
├── .github/
│   ├── workflows/
│   │   └── codex-perplexity-automation.yml  # Главный workflow
│   ├── scripts/
│   │   └── codex-perplexity-integration.js  # Логика интеграции
│   ├── ISSUE_TEMPLATE/
│   │   └── codex_request.md                  # Шаблон для запросов
│   └── output/                               # Сгенерированный код
└── package.json                              # Зависимости
```

---

## 💡 Пример Issue

```markdown
## 📋 Description
Создать REST API endpoint для управления пользователями

## 🎯 Requirements

- GET /api/users - получить список пользователей
- POST /api/users - создать пользователя
- Async/await синтаксис
- Обработка ошибок
- JSDoc комментарии

## 🔧 Technologies

- Node.js
- Express.js
- MongoDB/Mongoose
```

---

## 📈 Результат

После обработки вы получите:

1. **Pull Request** с готовым кодом на новой ветке
2. **Комментарий в Issue** с:
   - Сгенерированным кодом
   - Детальным анализом качества от Perplexity
   - Рекомендациями по улучшению
   - Ссылкой на созданный Pull Request
3. **Файл** `.github/output/issue-X.js` в репозитории

---

## 🔧 Troubleshooting

### ❌ Workflow не запускается?

- Проверьте что метка `codex-request` добавлена к Issue
- Убедитесь что API ключи добавлены в Secrets
- Проверьте права доступа в Settings → Actions → General

### ❌ Ошибка "401 Incorrect API key provided"?

**Это самая частая проблема!**

1. Перейдите в Settings → Secrets and variables → Actions
2. Обновите секрет `OPENAI_API_KEY` актуальным действующим ключом
3. Получить новый ключ: https://platform.openai.com/account/api-keys
4. Убедитесь что ключ:
   - Не истек
   - Имеет доступ к GPT-4o
   - Аккаунт активен и имеет кредиты
5. После обновления создайте новый issue или нажмите "Re-run jobs"

### ❌ Код не генерируется?

- Проверьте логи в Actions → Latest workflow run
- Убедитесь что баланс Perplexity API положительный
- Проверьте формат вашего запроса в Issue

### ❌ Pull Request не создается?

- Убедитесь что workflow имеет права `contents:write` и `pull-requests:write`
- Проверьте что ветка `dev` существует и доступна
- Посмотрите детали ошибки в логах Actions

---

## 💰 Стоимость

- **OpenAI API (GPT-4o)**: ~$0.01-0.03 за запрос (зависит от размера кода)
- **Perplexity API**: ~$0.001-0.005 за запрос
- **GitHub Actions**: Бесплатно (2000 минут/мес для публичных репозиториев)

**Примерная стоимость:** $0.02-0.05 за одну генерацию кода

---

## 🚀 Расширенные возможности

После базовой настройки вы можете:

- Добавить автоматические unit тесты
- Интегрировать ESLint/Prettier для форматирования
- Настроить CI/CD деплой
- Добавить код-метрики и coverage
- Интегрировать с Slack/Discord для уведомлений
- Добавить автоматический merge PR после ревью

---

## 📊 История обновлений

### v2.0 - Ноябрь 2025
- ✅ Обновлена OpenAI интеграция с поддержкой организации и проекта
- ✅ Миграция с Completions API на Chat Completions API
- ✅ Обновление модели с `code-davinci-002` на `gpt-4o`
- ✅ Добавлена comprehensive обработка ошибок с try-catch
- ✅ Обновлена Perplexity модель на `llama-3.1-sonar-large-128k-online`
- ✅ Увеличен max_tokens до 2000 для детального анализа
- ✅ Расширен system prompt для Perplexity
- ✅ Добавлено автоматическое создание Pull Requests
- ✅ Проведено финальное тестирование системы

---

## 👥 Поддержка

Если возникли вопросы:

1. Проверьте Issues в репозитории (особенно Issue #3 с отчётом о тестировании)
2. Создайте новый Issue с описанием проблемы
3. Проверьте логи GitHub Actions для детальной диагностики
4. Убедитесь что API ключи действующие и не истекшие

---

## 📜 Лицензия

MIT

---

**Создано с ❤️ для автоматизации разработки**

*Система полностью готова к работе. После обновления API ключей будет работать автоматически!*
