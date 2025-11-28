#!/bin/bash
set -e

echo "=== KazSmartChain API Entrypoint ==="

# Устанавливаем зависимости только для API и SDK (не трогаем web)
# Корневой node_modules изолирован в volume, чтобы избежать конфликтов
if [ ! -d "/srv/apps/api/node_modules" ] || [ -z "$(ls -A /srv/apps/api/node_modules 2>/dev/null)" ] || \
   [ ! -d "/srv/packages/sdk/node_modules" ] || [ -z "$(ls -A /srv/packages/sdk/node_modules 2>/dev/null)" ]; then
    echo "Installing dependencies (API + SDK)..."
    
    # Устанавливаем SDK зависимости отдельно (в workspace)
    if [ ! -d "/srv/packages/sdk/node_modules" ] || [ -z "$(ls -A /srv/packages/sdk/node_modules 2>/dev/null)" ]; then
        echo "Installing SDK dependencies..."
        cd /srv/packages/sdk
        npm install --legacy-peer-deps --no-save
    fi
    
    # Устанавливаем API зависимости отдельно (в workspace)
    if [ ! -d "/srv/apps/api/node_modules" ] || [ -z "$(ls -A /srv/apps/api/node_modules 2>/dev/null)" ]; then
        echo "Installing API dependencies..."
        cd /srv/apps/api
        npm install --legacy-peer-deps --no-save
    fi
fi

# Исправляем проблему с rxjs в корневом node_modules (TypeORM использует его оттуда)
echo "Fixing rxjs in root node_modules for TypeORM..."
cd /srv
if [ -d "node_modules/rxjs" ]; then
    echo "Removing old rxjs from root..."
    rm -rf node_modules/rxjs
fi
npm install rxjs@^7.8.1 --legacy-peer-deps --no-save --prefix /srv 2>&1 | grep -E "(rxjs|added|removed)" || echo "rxjs installed"

# Запускаем миграции
echo "Running database migrations..."
cd /srv/apps/api
npm run migrate:run || echo "Migrations completed or skipped"

# Запускаем приложение
echo "Starting API server..."
exec npx ts-node --transpile-only src/main.ts

