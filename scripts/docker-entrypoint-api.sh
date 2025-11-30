#!/bin/bash
set -e

echo "=== KazSmartChain API Entrypoint ==="

# Устанавливаем PHP и необходимые зависимости для KalkanCrypt
if ! command -v php &> /dev/null; then
    echo "Installing PHP and required packages..."
    apt-get update -qq
    apt-get install -y -qq \
        php-cli \
        php-dev \
        php-common \
        php-mbstring \
        libssl-dev \
        libpcsclite1 \
        libpcsclite-dev \
        pcscd \
        > /dev/null 2>&1
    
    # Находим путь к libpcsclite.so.1
    PCSCLITE_LIB=$(find /usr/lib -name "libpcsclite.so*" 2>/dev/null | head -n 1)
    if [ -n "$PCSCLITE_LIB" ]; then
        echo "Found libpcsclite at: $PCSCLITE_LIB"
        # Создаем симлинк если нужно
        PCSCLITE_DIR=$(dirname "$PCSCLITE_LIB")
        if [ ! -f "$PCSCLITE_DIR/libpcsclite.so.1" ]; then
            # Ищем версию с номером
            PCSCLITE_SO=$(find "$PCSCLITE_DIR" -name "libpcsclite.so.*" | head -n 1)
            if [ -n "$PCSCLITE_SO" ]; then
                ln -sf "$(basename "$PCSCLITE_SO")" "$PCSCLITE_DIR/libpcsclite.so.1" || true
                echo "Created symlink: $PCSCLITE_DIR/libpcsclite.so.1"
            fi
        fi
    fi
    
    # Обновляем кэш библиотек и добавляем пути
    echo "/usr/lib/x86_64-linux-gnu" > /etc/ld.so.conf.d/pcsclite.conf 2>/dev/null || true
    ldconfig || true
    
    # Определяем версию PHP для выбора правильной библиотеки
    PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.2")
    PHP_EXT_DIR=$(php-config --extension-dir 2>/dev/null || echo "/usr/lib/php/20220829")
    
    echo "PHP version: $PHP_VERSION"
    echo "PHP extension dir: $PHP_EXT_DIR"
    
    # Копируем KalkanCrypt библиотеку
    SDK_PATH="/srv/SDK 2.0/PHP_Linux/lib"
    if [ -d "$SDK_PATH" ]; then
        # Выбираем версию библиотеки (используем 8.2 как fallback, или ближайшую доступную)
        if [ -f "$SDK_PATH/$PHP_VERSION/NTS/kalkancrypt.so" ]; then
            KALKANCRYPT_SRC="$SDK_PATH/$PHP_VERSION/NTS/kalkancrypt.so"
        elif [ -f "$SDK_PATH/8.2/NTS/kalkancrypt.so" ]; then
            KALKANCRYPT_SRC="$SDK_PATH/8.2/NTS/kalkancrypt.so"
            echo "Using PHP 8.2 library as fallback"
        else
            echo "WARNING: KalkanCrypt library not found for PHP $PHP_VERSION"
            KALKANCRYPT_SRC=""
        fi
        
        if [ -n "$KALKANCRYPT_SRC" ] && [ -f "$KALKANCRYPT_SRC" ]; then
            echo "Installing KalkanCrypt extension..."
            mkdir -p "$PHP_EXT_DIR"
            cp "$KALKANCRYPT_SRC" "$PHP_EXT_DIR/kalkancrypt.so"
            
            # Настраиваем php.ini для загрузки расширения
            PHP_INI_DIR=$(php-config --ini-dir 2>/dev/null || echo "/etc/php/8.2/cli/conf.d")
            if [ -d "$PHP_INI_DIR" ]; then
                echo "extension=kalkancrypt.so" > "$PHP_INI_DIR/20-kalkancrypt.ini"
                echo "KalkanCrypt extension configured"
            else
                # Fallback: добавляем в основной php.ini
                PHP_INI=$(php --ini 2>/dev/null | grep "Loaded Configuration File" | awk '{print $4}' || echo "/etc/php/8.2/cli/php.ini")
                if [ -f "$PHP_INI" ]; then
                    if ! grep -q "extension=kalkancrypt.so" "$PHP_INI"; then
                        echo "extension=kalkancrypt.so" >> "$PHP_INI"
                        echo "Added KalkanCrypt to php.ini"
                    fi
                fi
            fi
            
            # Устанавливаем LD_LIBRARY_PATH для PHP, чтобы он мог найти libpcsclite
            if [ -n "$PCSCLITE_DIR" ]; then
                export LD_LIBRARY_PATH="$PCSCLITE_DIR:${LD_LIBRARY_PATH:-}"
                echo "export LD_LIBRARY_PATH=\"$PCSCLITE_DIR:\${LD_LIBRARY_PATH:-}\"" >> /etc/environment 2>/dev/null || true
            fi
            
            # Проверяем что расширение загружено
            if LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}:${PCSCLITE_DIR:-}" php -m 2>/dev/null | grep -i kalkan > /dev/null; then
                echo "✓ KalkanCrypt extension loaded successfully"
            else
                echo "⚠ Checking KalkanCrypt extension..."
                LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}:${PCSCLITE_DIR:-}" php -m 2>&1 | grep -i "kalkan\|pcsclite" || true
                echo "⚠ KalkanCrypt extension not loaded (will use mock mode)"
            fi
        fi
    else
        echo "WARNING: SDK path not found at $SDK_PATH"
        echo "KalkanCrypt will not be available (will use mock mode)"
    fi
else
    echo "PHP already installed: $(php -v | head -n 1)"
    # Проверяем и настраиваем libpcsclite для уже установленного PHP
    PCSCLITE_LIB=$(find /usr/lib -name "libpcsclite.so*" 2>/dev/null | head -n 1)
    if [ -n "$PCSCLITE_LIB" ]; then
        PCSCLITE_DIR=$(dirname "$PCSCLITE_LIB")
        if [ ! -f "$PCSCLITE_DIR/libpcsclite.so.1" ]; then
            PCSCLITE_SO=$(find "$PCSCLITE_DIR" -name "libpcsclite.so.*" | head -n 1)
            if [ -n "$PCSCLITE_SO" ]; then
                ln -sf "$(basename "$PCSCLITE_SO")" "$PCSCLITE_DIR/libpcsclite.so.1" || true
            fi
        fi
        echo "/usr/lib/x86_64-linux-gnu" > /etc/ld.so.conf.d/pcsclite.conf 2>/dev/null || true
        ldconfig || true
    fi
fi

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
    # Пробуем установить rxjs, но не критично если не получится (может быть конфликт с вложенными зависимостями)
    echo "Checking rxjs in root node_modules for TypeORM and NestJS..."
    cd /srv
    # Проверяем есть ли rxjs и какая версия
    if [ -f "node_modules/rxjs/package.json" ]; then
        RXJS_VERSION=$(node -e "try { console.log(require('./node_modules/rxjs/package.json').version); } catch(e) { console.log('0.0.0'); }" 2>/dev/null || echo "0.0.0")
        echo "Current rxjs version in root: $RXJS_VERSION"
        # Если версия 7.x, все ок
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

