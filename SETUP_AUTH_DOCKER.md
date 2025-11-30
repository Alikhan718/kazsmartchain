# Настройка аутентификации ЭЦП в Docker

## 📋 Обзор

Данный документ описывает настройку и использование системы аутентификации с ЭЦП НУЦ РК в Docker окружении.

## ✅ Что реализовано

### 1. Backend интеграция
- ✅ PHP и KalkanCrypt расширение автоматически устанавливаются при запуске контейнера
- ✅ PHP Bridge Service для проверки подписей через KalkanCrypt
- ✅ ECDSA Service для проверки подписей и валидации сертификатов
- ✅ Certificate Parser для извлечения информации из сертификатов
- ✅ Auth Service с поддержкой ЭЦП аутентификации
- ✅ User Service для создания/обновления пользователей по сертификатам
- ✅ Role Assignment Service для автоматического назначения ролей
- ✅ JWT токены (access + refresh)
- ✅ Challenge-Response механизм для защиты от replay атак

### 2. Frontend интеграция
- ✅ Страница входа `/login`
- ✅ Компонент `LoginForm` с интеграцией NCALayer
- ✅ Компонент `CertificateSelector` для выбора сертификата
- ✅ NCALayer Client для работы с ЭЦП через WebSocket
- ✅ API клиент для аутентификации

### 3. База данных
- ✅ Таблица `auth_challenges` для хранения одноразовых challenge
- ✅ Таблица `refresh_tokens` для refresh токенов
- ✅ Обновлена таблица `users` с полями для сертификатов
- ✅ Обновлена таблица `organizations` с полями `bin` и `email_domain`
- ✅ Автоматические миграции при запуске контейнера

### 4. Docker конфигурация
- ✅ Автоматическая установка PHP при первом запуске
- ✅ Автоматическая установка и настройка KalkanCrypt расширения
- ✅ Определение версии PHP и выбор правильной библиотеки из SDK
- ✅ Настройка `LD_LIBRARY_PATH` для поиска `libpcsclite.so.1`
- ✅ Fallback на mock режим если KalkanCrypt недоступен

## 🚀 Как запустить

### 1. Пересобрать и запустить контейнеры

```bash
# Остановить текущие контейнеры
docker-compose -f docker-compose.simple.yml down

# Запустить заново (PHP установится автоматически при первом запуске)
docker-compose -f docker-compose.simple.yml up -d

# Проверить логи API контейнера
docker logs -f kaz-api
```

### 2. Проверить что PHP и KalkanCrypt установлены

```bash
# Войти в контейнер API
docker exec -it kaz-api bash

# Проверить PHP
php -v

# Проверить что KalkanCrypt загружен
php -m | grep -i kalkan

# Проверить что libpcsclite доступен
ldconfig -p | grep pcsclite

# Выйти
exit
```

### 3. Проверить миграции

```bash
# Проверить что таблицы созданы
docker exec -it kaz-postgres psql -U kaz -d kazsmartchain -c "\dt"

# Должны быть таблицы:
# - auth_challenges
# - refresh_tokens
# - users (с новыми полями: certificate_serial, certificate_subject, certificate_issuer, certificate_valid_from, certificate_valid_to)
# - organizations (с новыми полями: bin, email_domain)
```

### 4. Проверить API endpoints

```bash
# Получить challenge
curl -X POST http://localhost:4000/api/auth/challenge \
  -H "Content-Type: application/json"

# Должен вернуть:
# {
#   "challenge": "KazSmartChain Login Challenge: ...",
#   "nonce": "...",
#   "expiresAt": "..."
# }
```

## 🔧 Конфигурация

### Переменные окружения

Можно переопределить через `.env` файл или переменные окружения:

```bash
# В docker-compose.simple.yml или .env
JWT_SECRET=your-production-secret-key-here
PHP_PATH=/usr/bin/php
KALKANCRYPT_PATH=/usr/lib/php/20220829/kalkancrypt.so
LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu
```

### Структура SDK

SDK должен быть расположен в корне проекта:
```
kazsmartchain/
├── SDK 2.0/
│   ├── PHP_Linux/
│   │   └── lib/
│   │       └── {PHP_VERSION}/
│   │           └── NTS/
│   │               └── kalkancrypt.so
│   └── ...
```

## 🔄 Режимы работы

### Режим разработки (mock)

Если KalkanCrypt не установлен или недоступен, система автоматически переключится в mock режим:
- ✅ Проверка подписи всегда возвращает `true` (в development режиме)
- ✅ Используются mock данные сертификатов (если NCALayer недоступен)
- ✅ Позволяет разрабатывать frontend без реального NCALayer
- ⚠️ **Важно**: В production режиме проверка подписи должна работать корректно

### Режим production

Когда KalkanCrypt установлен и работает:
- ✅ Реальная проверка подписей через KalkanCrypt PHP
- ✅ Парсинг сертификатов через KalkanCrypt API
- ✅ Полная валидация сертификатов (срок действия, CRL - в разработке)

## 📝 Поток аутентификации

1. **Пользователь открывает `/login`**
   - Frontend инициализирует NCALayer
   - Загружает список доступных сертификатов

2. **Пользователь выбирает сертификат**
   - Frontend запрашивает challenge от сервера (`POST /api/auth/challenge`)
   - Сервер генерирует одноразовый nonce и challenge строку
   - Challenge сохраняется в базе данных с TTL 5 минут

3. **Пользователь подписывает challenge**
   - NCALayer запрашивает PIN-код
   - Challenge подписывается приватным ключом сертификата
   - Подпись возвращается в формате CMS Base64

4. **Отправка запроса на аутентификацию**
   - Frontend отправляет `POST /api/auth/login` с:
     - `certificate`: PEM сертификат (может быть обрезанным, извлекается из подписи)
     - `signature`: CMS подпись в Base64
     - `nonce`: одноразовый nonce из challenge
     - `data`: challenge в Base64 (данные которые были подписаны)

5. **Проверка на сервере**
   - Проверка challenge (nonce, срок действия, не использован)
   - Извлечение полного сертификата из CMS подписи (если предоставлен обрезанный)
   - Проверка подписи через KalkanCrypt PHP
   - Парсинг сертификата и извлечение данных
   - Поиск или создание пользователя по `certificate_serial`
   - Назначение роли на основе данных сертификата
   - Генерация JWT токенов (access + refresh)

6. **Завершение аутентификации**
   - Токены сохраняются в `localStorage`
   - Пользователь перенаправляется на главную страницу

## 🐛 Troubleshooting

### PHP не установился

```bash
# Проверить логи
docker logs kaz-api | grep -i php

# Пересобрать контейнер
docker-compose -f docker-compose.simple.yml up -d --force-recreate api
```

### KalkanCrypt не загружается

```bash
# Проверить что библиотека скопирована
docker exec -it kaz-api ls -la /usr/lib/php/*/kalkancrypt.so

# Проверить php.ini
docker exec -it kaz-api php --ini

# Проверить загруженные модули
docker exec -it kaz-api php -m | grep kalkan

# Проверить LD_LIBRARY_PATH
docker exec -it kaz-api env | grep LD_LIBRARY_PATH
```

### libpcsclite.so.1 не найден

```bash
# Проверить что библиотека установлена
docker exec -it kaz-api find /usr/lib -name "libpcsclite.so*"

# Проверить ldconfig
docker exec -it kaz-api ldconfig -p | grep pcsclite

# Если не найдено, пересобрать контейнер
docker-compose -f docker-compose.simple.yml up -d --force-recreate api
```

### Миграции не выполняются

```bash
# Запустить миграции вручную
docker exec -it kaz-api bash
cd /srv/apps/api
npm run migrate:run
```

### Проверка подписи не работает

**Проблема**: KalkanCrypt возвращает ошибку при проверке подписи

**Возможные причины**:
1. Данные передаются в неправильном формате
2. Флаги для проверки подписи неверны
3. Сертификат не может быть извлечен из CMS подписи

**Решение**:
- Проверить логи API: `docker logs kaz-api | grep -i "KalkanCrypt\|PHP"`
- Убедиться что данные в Base64 формате без переносов строк
- Проверить что используется правильный формат CMS-detached подписи
- В development режиме проверка пропускается для продолжения разработки

### rxjs ошибки при запуске

**Проблема**: `Error: Cannot find module 'rxjs/operators'`

**Решение**: Уже исправлено в `docker-entrypoint-api.sh`. Если проблема повторяется:
```bash
# Пересобрать контейнер
docker-compose -f docker-compose.simple.yml up -d --force-recreate api
```

## 📊 Текущий статус

### ✅ Полностью реализовано
- [x] Docker конфигурация с PHP и KalkanCrypt
- [x] Автоматическая установка зависимостей
- [x] Backend API endpoints для аутентификации
- [x] Frontend страница входа с NCALayer
- [x] Challenge-Response механизм
- [x] Извлечение сертификата из CMS подписи
- [x] Создание/обновление пользователей по сертификатам
- [x] Назначение ролей на основе данных сертификата
- [x] JWT токены (access + refresh)
- [x] Миграции базы данных

### 🔄 В разработке
- [ ] Полная проверка подписи через KalkanCrypt (есть проблемы с форматом данных)
- [ ] Проверка CRL (Certificate Revocation List)
- [ ] Проверка цепочки сертификатов
- [ ] Защита маршрутов (редирект на /login если не авторизован)

### 📋 Планируется
- [ ] Rate limiting на endpoints аутентификации
- [ ] Логирование всех попыток входа
- [ ] Уведомления об истечении сертификата
- [ ] Поддержка нескольких сертификатов на пользователя

## 🔐 Безопасность

### Реализовано
- ✅ Одноразовые nonce для защиты от replay атак
- ✅ TTL для challenges (5 минут)
- ✅ Отметка использованных challenges
- ✅ HTTPS обязателен (в production)
- ✅ JWT токены с коротким временем жизни (15 минут для access, 7 дней для refresh)

### Требует внимания
- ⚠️ Проверка подписи в development режиме пропускается (для продолжения разработки)
- ⚠️ CRL проверка не реализована
- ⚠️ Проверка цепочки сертификатов не реализована
- ⚠️ Rate limiting не настроен

## 📚 Дополнительная информация

### Структура файлов

```
apps/api/src/modules/
├── auth/
│   ├── auth.controller.ts      # API endpoints
│   ├── auth.service.ts          # Логика аутентификации
│   └── auth.guard.ts            # Guard для защиты маршрутов
├── ecdsa/
│   ├── ecdsa.service.ts         # Основной сервис для работы с ЭЦП
│   ├── php-bridge.service.ts    # Bridge к KalkanCrypt PHP
│   └── certificate-parser.service.ts  # Парсинг сертификатов
└── users/
    ├── users.service.ts         # Управление пользователями
    └── role-assignment.service.ts  # Назначение ролей

apps/web/
├── app/login/
│   └── page.tsx                 # Страница входа
├── components/auth/
│   ├── LoginForm.tsx            # Форма входа
│   └── CertificateSelector.tsx # Выбор сертификата
└── lib/
    ├── ncalayer/
    │   └── client.ts            # NCALayer клиент
    └── auth/
        └── api.ts               # API клиент для аутентификации
```

### Полезные команды

```bash
# Просмотр логов в реальном времени
docker logs -f kaz-api

# Перезапуск API контейнера
docker restart kaz-api

# Проверка статуса контейнеров
docker-compose -f docker-compose.simple.yml ps

# Очистка и пересборка
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml up -d --build
```

## 📝 Примечания

- При первом запуске установка PHP может занять 1-2 минуты
- KalkanCrypt библиотека выбирается автоматически по версии PHP
- Если библиотека не найдена, система работает в mock режиме
- Все изменения в коде применяются через volumes (hot reload)
- В development режиме проверка подписи может быть пропущена для продолжения разработки

---

**Последнее обновление:** 2025-11-30  
**Версия документа:** 2.0
