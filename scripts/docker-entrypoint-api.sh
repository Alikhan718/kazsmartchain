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

# Исправляем проблему с rxjs в корневом node_modules (TypeORM и NestJS используют его оттуда)
echo "Checking rxjs in root node_modules for TypeORM and NestJS..."
cd /srv
if [ -f "node_modules/rxjs/package.json" ]; then
    RXJS_VERSION=$(node -e "try { console.log(require('./node_modules/rxjs/package.json').version); } catch(e) { console.log('0.0.0'); }" 2>/dev/null || echo "0.0.0")
    echo "Current rxjs version in root: $RXJS_VERSION"
    if [[ "$RXJS_VERSION" =~ ^7\. ]]; then
        echo "✓ rxjs version is compatible (7.x)"
    else
        echo "⚠ rxjs version may be incompatible, but skipping reinstall to avoid conflicts"
    fi
else
    echo "Installing rxjs@^7.8.1 in root node_modules..."
    npm install rxjs@^7.8.1 --legacy-peer-deps --no-save --prefix /srv 2>&1 | grep -E "(rxjs|added|removed|up to date)" || echo "rxjs installation skipped (may have conflicts)"
fi

# Также убеждаемся что rxjs установлен в apps/api/node_modules
echo "Ensuring rxjs in apps/api/node_modules..."
cd /srv/apps/api
if [ ! -d "node_modules/rxjs" ]; then
    npm install rxjs@^7.8.1 --legacy-peer-deps --no-save 2>&1 | grep -E "(rxjs|added|removed|up to date)" || echo "rxjs check in api completed"
else
    echo "✓ rxjs already present in apps/api/node_modules"
fi

# Запускаем миграции
echo "Running database migrations..."
cd /srv/apps/api
npm run migrate:run || echo "Migrations completed or skipped"

# Запускаем приложение
echo "Starting API server..."
exec npx ts-node --transpile-only src/main.ts
