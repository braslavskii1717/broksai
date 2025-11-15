#!/bin/bash
set -e
PORT=3000
if lsof -ti:${PORT} >/dev/null 2>&1; then
  echo "⚠️  Порт ${PORT} занят. Освобождаем..."
  lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true
  sleep 1
  echo "✓ Порт ${PORT} освобождён"
fi
echo "🚀 Запуск Next.js production сервера..."
npx --no-install next start
