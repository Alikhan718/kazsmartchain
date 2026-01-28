#!/bin/bash
set -e

echo "=== KazSmartChain Docs Entrypoint ==="

# Устанавливаем зависимости для docs приложения
if [ ! -d "/srv/apps/docs/node_modules" ] || [ -z "$(ls -A /srv/apps/docs/node_modules 2>/dev/null)" ]; then
    echo "Installing dependencies (Docs)..."
    cd /srv/apps/docs
    npm install --legacy-peer-deps
else
    echo "Dependencies already installed, skipping npm install..."
fi

# Запускаем Next.js dev server
echo "Starting Next.js docs server..."
cd /srv/apps/docs
exec npm run dev

