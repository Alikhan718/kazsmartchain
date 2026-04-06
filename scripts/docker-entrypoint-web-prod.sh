#!/bin/bash
set -e

echo "=== KazSmartChain Web Entrypoint ==="

# 1. Устанавливаем зависимости
if [ ! -d "/srv/apps/web/node_modules" ] || [ -z "$(ls -A /srv/apps/web/node_modules 2>/dev/null)" ]; then
    echo "Installing dependencies..."
    cd /srv
    npm install --workspaces --include-workspace-root --legacy-peer-deps --workspace=apps/web --workspace=packages/sdk
else
    echo "Dependencies already installed, skipping..."
fi

# 2. Собираем SDK
if [ ! -d "/srv/packages/sdk/dist" ]; then
    echo "Building SDK..."
    cd /srv/packages/sdk
    npm run build
fi

# 3. Собираем Next.js production build
echo "Building Next.js production app..."
cd /srv/apps/web
rm -rf .next
npm run build

# 4. Запускаем
echo "Starting Next.js in production mode..."
exec npm run start
