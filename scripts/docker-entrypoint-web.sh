#!/bin/bash
set -e

echo "=== KazSmartChain Web Entrypoint ==="

# Устанавливаем зависимости для всего workspace (включая SDK)
if [ ! -d "/srv/apps/web/node_modules" ] || [ -z "$(ls -A /srv/apps/web/node_modules 2>/dev/null)" ] || \
   [ ! -d "/srv/packages/sdk/node_modules" ] || [ -z "$(ls -A /srv/packages/sdk/node_modules 2>/dev/null)" ]; then
    echo "Installing dependencies (Web + SDK)..."
    cd /srv
    npm install --workspaces --include-workspace-root --legacy-peer-deps --workspace=apps/web --workspace=packages/sdk
else
    echo "Dependencies already installed, skipping npm install..."
fi

# Собираем SDK если нужно (только если dist отсутствует или пустой)
if [ ! -d "/srv/packages/sdk/dist" ] || [ -z "$(ls -A /srv/packages/sdk/dist 2>/dev/null)" ]; then
    echo "Building SDK..."
    cd /srv/packages/sdk
    npm run build || echo "SDK build failed, but continuing..."
else
    echo "SDK already built, skipping..."
fi

# Собираем и запускаем Next.js production server
echo "Building Next.js..."
cd /srv/apps/web
npm run build

echo "Starting Next.js production server..."
exec npm run start