# 🤖 Codex ↔ Perplexity Automation

**Автоматическая генерация кода с валидацией через OpenAI Codex и Perplexity AI**

## 🚀 Возможности

- ✅ **Полностью автоматическая** генерация кода через GitHub Issues
- ✅ **Валидация качества** кода через Perplexity AI
- ✅ **Автоматические Pull Requests** с сгенерированным кодом
- ✅ **24/7 работа** без вашего участия
- ✅ **Issue Templates** для удобного создания запросов

## 📝 Как это работает

1. Создаёте Issue с меткой `codex-request`
2. GitHub Actions автоматически запускается
3. OpenAI Codex генерирует код по вашему описанию
4. Perplexity AI валидирует код на качество и безопасность
5. Создается Pull Request с результатами
6. Вы получаете готовый код для review!

## ⚙️ Быстрая настройка

### Шаг 1: Получите API ключи

**OpenAI API:**
1. Перейдите на https://platform.openai.com/api-keys
2. Создайте новый API ключ
3. ⚠️ Требуется ChatGPT Pro ($20/мес)

**Perplexity API:**
1. Перейдите на https://www.perplexity.ai/settings/api  
2. Сгенерируйте API ключ
3. Добавьте ~$10 кредитов для тестирования

### Шаг 2: Добавьте секреты в GitHub

1. Откройте: `Settings` → `Secrets and variables` → `Actions`
2. Нажмите `New repository secret`
3. Добавьте два секрета:

```
Name: OPENAI_API_KEY
Value: [ваш ключ OpenAI]

Name: PERPLEXITY_API_KEY  
Value: [ваш ключ Perplexity]
```

### Шаг 3: Готово! 🎉

Все файлы уже созданы:
- ✅ `.github/workflows/codex-perplexity-automation.yml`
- ✅ `.github/scripts/codex-perplexity-integration.js`
- ✅ `.github/ISSUE_TEMPLATE/codex_request.md`
- ✅ `package.json`

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
- 💻 Codex генерирует код
- 🔍 Perplexity проверяет качество
- 📦 Создается Pull Request
- 💬 Результаты публикуются в комментариях

## 📁 Структура проекта

```
broksai/
├── .github/
│   ├── workflows/
│   │   └── codex-perplexity-automation.yml
│   ├── scripts/
│   │   └── codex-perplexity-integration.js
│   ├── ISSUE_TEMPLATE/
│   │   └── codex_request.md
│   └── output/           # Сгенерированный код
└── package.json
```

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

## 📈 Результат

После обработки вы получите:

1. **Pull Request** с готовым кодом
2. **Комментарий в Issue** с:
   - Сгенерированным кодом
   - Анализом качества от Perplexity
   - Рекомендациями по улучшению
3. **Файл** `.github/output/issue-X.js` в репозитории

## 🔧 Troubleshooting

### Workflow не запускается?
- Проверьте что метка `codex-request` добавлена к Issue
- Убедитесь что API ключи добавлены в Secrets

### Ошибка "API key invalid"?
- Проверьте правильность ключей в Settings → Secrets
- Убедитесь что у вас есть активная подписка OpenAI

### Код не генерируется?
- Проверьте логи в Actions → Latest workflow run
- Убедитесь что баланс Perplexity API положительный

## 💰 Стоимость

- **OpenAI API (GPT-4)**: $20/мес (ChatGPT Pro)
- **Perplexity API**: ~$0.001 за запрос (~$10 на 10000 запросов)
- **GitHub Actions**: Бесплатно (2000 минут/мес)

## 🚀 Расширенные возможности

После базовой настройки вы можете:

- Добавить автоматические тесты
- Интегрировать ESLint/Prettier
- Настроить CI/CD деплой
- Добавить код-метрики

## 👥 Поддержка

Если возникли вопросы:
1. Проверьте Issues в репозитории
2. Создайте новый Issue с описанием проблемы
3. Проверьте логи GitHub Actions

## 📜 Лицензия

MIT

---

**Создано с ❤️ для автоматизации разработки**
