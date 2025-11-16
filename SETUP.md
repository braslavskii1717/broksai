# 🚀 Быстрый старт: Codex ↔ Perplexity Automation

## Требования

- Node.js 18+
- npm или yarn
- GitHub репозиторий
- 3 API ключа (OpenAI, Perplexity, GitHub Token)

## Установка за 5 минут

### Шаг 1: Получите API ключи

#### OpenAI API Key
1. https://platform.openai.com/api-keys
2. "Create new secret key"
3. ChatGPT Pro ($20/мес)

#### Perplexity API Key
1. https://www.perplexity.ai/settings/api
2. "Generate API Key"
3. Платежный метод (~$10)

#### GitHub Token
1. https://github.com/settings/tokens/new
2. codex-automation
3. Scopes: repo, workflow

### Шаг 2: Настройте переменные окружения

```bash
cp .env.example .env
nano .env
# Добавьте ваши ключи
```

### Шаг 3: Установите зависимости

```bash
npm install
```

### Шаг 4: Добавьте секреты в GitHub

1. https://github.com/braslavskii1717/broksai/settings/secrets/actions
2. New repository secret
3. OPENAI_API_KEY
4. PERPLEXITY_API_KEY

### Шаг 5: Создайте первый Issue

1. https://github.com/braslavskii1717/broksai/issues/new/choose
2. "🤖 Codex Request"
3. Заполните форму
4. Добавьте метку: codex-request
5. Submit

### Результат (2-5 минут):
- ✅ Комментарий с кодом
- ✅ Pull Request
- ✅ Метки

## Troubleshooting

**Workflow не запускается:**
- Проверьте метку codex-request
- Посмотрите Actions tab

**OpenAI Error 401:**
- Проверьте OPENAI_API_KEY
- Проверьте подписку ChatGPT Pro

**Perplexity Error:**
- Проверьте PERPLEXITY_API_KEY
- Проверьте баланс

---

🚀 **Начните использовать!**
