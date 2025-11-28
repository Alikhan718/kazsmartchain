# 🏗️ Архитектура KazSmartChain

## Обзор системы

**KazSmartChain** — это корпоративная блокчейн-платформа для Казахстана, построенная на базе Hyperledger Besu и FireFly. Платформа обеспечивает работу с токенами, мультитенантность, интеграцию с IPFS и Solana, а также предоставляет комплексные дашборды для мониторинга и управления.

---

## 🎯 Основные компоненты

### 1. **Frontend (Next.js Web Application)**
- **Технологии**: Next.js 16, React 19, Tailwind CSS, TypeScript

**Функциональность:**
- Мультитенантный дашборд с переключением между организациями
- Публичный Explorer для просмотра транзакций
- Админ-панель для суперадминистраторов
- Страницы для управления токенами, организациями, сетью
- Real-time обновления через WebSocket
- Интеграция с Solana для NFT/сертификатов

**Основные страницы:**
- `/` - Главная страница с метриками
- `/tokens` - Управление KSC токенами
- `/orgs` - Управление организациями
- `/network` - Мониторинг сети
- `/explorer` - Блокчейн Explorer
- `/admin` - Админ-панель (валидаторы, аудит, compliance)

---

### 2. **Backend API (NestJS)**
- **Технологии**: NestJS 10, TypeORM, PostgreSQL, Redis

**Архитектура модулей:**

#### **Core Modules:**
- **AppModule** - Главный модуль приложения, объединяет все модули
- **AuthModule** - Аутентификация и авторизация (JWT, guards)
- **RbacModule** - Role-Based Access Control (роли, права доступа)
- **HealthModule** - Health checks для мониторинга

#### **Blockchain Modules:**
- **FireFlyModule** - Интеграция с Hyperledger FireFly
  - Управление транзакциями
  - Работа с событиями блокчейна
  - Интеграция с Besu через EVMConnect
- **TokensModule** - Управление KSC токенами
  - Получение балансов организаций
  - История транзакций
  - Статистика токенов
  - Прямая работа с контрактом через Besu RPC
- **NetworkModule** - Мониторинг сети
  - Метрики блокчейна
  - Статус валидаторов
  - Информация о блоках

#### **Storage & Integration:**
- **IpfsModule** - Децентрализованное хранилище
  - Загрузка файлов в IPFS
  - Получение файлов по CID
- **SolanaModule** - Интеграция с Solana
  - Минтинг NFT/сертификатов
  - Управление активами на Solana

#### **Business Logic:**
- **OrgsModule** - Управление организациями
- **CertsModule** - Управление сертификатами
- **AuditModule** - Аудит всех операций
- **RelayModule** - Relay сервис для событий
- **RealtimeModule** - WebSocket для real-time обновлений
- **MetricsModule** - Сбор и предоставление метрик

**База данных (PostgreSQL):**
- **Organizations** - Организации (мультитенантность)
- **Users** - Пользователи с привязкой к организациям
- **RoleAssignments** - Назначение ролей
- **AuditEvents** - События аудита
- **TokenPools** - Пуллы токенов в FireFly
- **SolanaAssets** - Активы на Solana
- **X509Certs** - X.509 сертификаты
- **AssetFiles** - Файлы в IPFS
- **ContractInterfaces** - Интерфейсы смарт-контрактов
- **ContractListeners** - Слушатели событий контрактов
- **ProcessedEvents** - Обработанные события
- **PrivacyGroups** - Приватные группы
- **RelayCheckpoints** - Чекпоинты relay сервиса

---

### 3. **Blockchain Layer**

#### **Hyperledger Besu**
- **Порт**: 8545
- **Консенсус**: QBFT (Quorum Byzantine Fault Tolerance)
- **Network ID**: 1337
- **Тип**: Private/Permissioned blockchain
- **Функции**:
  - Выполнение EVM-совместимых смарт-контрактов
  - Майнинг блоков
  - RPC API для взаимодействия

#### **Hyperledger FireFly**
- **Порт**: 5000
- **Функции**:
  - Unified API для блокчейн операций
  - Управление транзакциями
  - Event streaming
  - Multi-party workflows
  - Private messaging между организациями

#### **EVMConnect**
- **Порт**: 5008
- **Функции**:
  - Коннектор между FireFly и Besu
  - Обработка событий блокчейна
  - Управление транзакциями

#### **FireFly Signer**
- **Порт**: 8555
- **Функции**:
  - Подписание транзакций перед отправкой в Besu
  - Управление ключами

#### **FFTokens (ERC-20/ERC-721 Connector)**
- **Порт**: 3001
- **Функции**:
  - Управление токенами через FireFly
  - Поддержка ERC-20 и ERC-721 стандартов

#### **KSC Token Smart Contract**
- **Адрес**: `0x42699A7612A82f1d9C36148af9C77354759b210b`
- **Стандарт**: ERC-20 с расширениями
- **Особенности**:
  - OpenZeppelin audited contracts
  - ERC20Burnable - возможность сжигания токенов
  - ERC20Pausable - экстренная остановка
  - ERC20Permit - gasless approvals
  - Ownable - только владелец может минтить
- **Текущий supply**: 1,151,950 KSC
- **Держатели**:
  - Банк ЦентрКредит (BCC): 1,099,800 KSC
  - КазНУ имени Аль-Фараби: 50,000 KSC

---

### 4. **Storage Layer**

#### **IPFS (InterPlanetary File System)**
- **API Порт**: 5001
- **Gateway Порт**: 8080
- **Функции**:
  - Децентрализованное хранилище файлов
  - Хранение метаданных NFT
  - Хранение сертификатов
  - Content-addressed storage

#### **PostgreSQL**
- **Порт**: 5432
- **База данных**: kazsmartchain
- **Функции**:
  - Хранение всех бизнес-данных
  - Мультитенантность через organizations
  - Аудит логи
  - Пользователи и роли

#### **Redis**
- **Порт**: 6379
- **Функции**:
  - Кэширование
  - Сессии
  - Rate limiting

---

### 5. **Solana Integration**

#### **Solana Validator (Testnet)**
- **RPC Порт**: 8899
- **PubSub Порт**: 8900
- **Faucet Порт**: 9900
- **Функции**:
  - Минтинг NFT/сертификатов
  - Bridge между Besu и Solana
  - Управление активами

---

### 6. **Relay Service**
- **Функции**:
  - Обработка событий из FireFly
  - Маршрутизация событий
  - Prometheus metrics
  - Health checks

---

### 7. **Shared SDK**
- **Функции**:
  - Общий TypeScript SDK для frontend и backend
  - Типизированные клиенты API
  - Zod схемы для валидации
  - KazClient класс для работы с API

---

## 🔄 Потоки данных

### Транзакция токенов:
```
Frontend (Next.js) 
  → API (NestJS) 
    → FireFly 
      → EVMConnect 
        → FireFly Signer 
          → Besu (Blockchain)
```

### Загрузка файла:
```
Frontend 
  → API 
    → IPFS 
      → CID возвращается 
        → Сохранение в PostgreSQL
```

### Минтинг NFT:
```
Frontend 
  → API 
    → Solana Service 
      → Solana Validator
```

### Real-time обновления:
```
Besu (Events) 
  → EVMConnect 
    → FireFly 
      → API (WebSocket Gateway) 
        → Frontend (WebSocket Client)
```

---

## 🔐 Безопасность

### Уровни безопасности:

1. **Network Level:**
   - Private/Permissioned blockchain (Besu)
   - QBFT консенсус для защиты от атак
   - Firewall и сетевые политики

2. **Application Level:**
   - JWT аутентификация
   - Role-Based Access Control (RBAC)
   - Multi-tenant isolation
   - Rate limiting (600 req/min)
   - Helmet для защиты HTTP заголовков
   - CORS настройки

3. **Smart Contract Level:**
   - OpenZeppelin audited contracts
   - Owner-only minting
   - Pausable механизм
   - ERC20Permit для безопасных approvals

4. **Data Level:**
   - Аудит всех операций
   - Шифрование данных в транзите
   - Приватные группы в FireFly

---

## 📊 Мониторинг и метрики

### Метрики собираются через:
- **Prometheus** - встроенные метрики в API и Relay
- **Health Checks** - для всех сервисов
- **Real-time Dashboard** - обновления каждые 10-15 секунд

### Отслеживаемые метрики:
- Балансы токенов
- История транзакций
- Статус сети
- Валидаторы
- Активность организаций
- IPFS загрузки
- Solana операции

---

## 🏢 Мультитенантность

### Организации:
1. **Банк ЦентрКредит (BCC)**
   - Slug: `bcc`
   - Address: `0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73`
   - Admin: admin@bcc.kz

2. **КазНУ имени Аль-Фараби**
   - Slug: `kaznu`
   - Address: `0x501E66aB402b9E7b5BeE8c10fc82D65c8A8D8C`
   - Admin: admin@kaznu.kz

### Изоляция:
- Каждая организация имеет свой FireFly namespace (опционально)
- Данные изолированы на уровне базы данных
- RBAC обеспечивает доступ только к своим данным
- Приватные группы для межорганизационной коммуникации

---

## 🚀 Развертывание

### Docker Compose Stack:
```yaml
Services:
  - postgres (PostgreSQL)
  - redis (Redis)
  - ipfs (IPFS)
  - besu (Hyperledger Besu)
  - firefly-signer (Transaction Signer)
  - evmconnect (EVM Connector)
  - firefly (Hyperledger FireFly)
  - fftokens (Token Connector)
  - solana-validator (Solana)
  - api (NestJS Backend)
  - web (Next.js Frontend)
```

### Volumes (персистентность):
- `pgdata` - PostgreSQL данные
- `besu_data` - Блокчейн данные
- `firefly_data` - FireFly данные
- `ipfs_data` - IPFS файлы
- `solana_data` - Solana данные
- `evmconnect_data` - EVMConnect события

---

## 📁 Структура проекта

```
kazsmartchain/
├── apps/
│   ├── api/              # NestJS Backend
│   │   └── src/
│   │       ├── main.ts
│   │       ├── modules/   # Все модули API
│   │       └── persistence/
│   │           └── entities/  # TypeORM сущности
│   ├── web/              # Next.js Frontend
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React компоненты
│   │   └── lib/          # Утилиты и клиенты
│   └── relay/            # Relay Service
├── packages/
│   └── sdk/              # Shared TypeScript SDK
├── contracts/            # Solidity контракты
│   └── KSCToken.sol
├── scripts/              # Deployment & testing скрипты
├── config/               # Конфигурационные файлы
│   ├── firefly.core.yaml
│   ├── evmconnect.yaml
│   └── firefly-signer.yaml
└── docker-compose.simple.yml
```

---

## 🔧 Технологический стек

### Frontend:
- Next.js 16 (App Router)
- React 19
- Tailwind CSS
- TypeScript
- Zustand (state management)
- TanStack Query (data fetching)
- WebSocket для real-time

### Backend:
- NestJS 10
- TypeORM
- PostgreSQL
- Redis
- WebSocket (Socket.IO)
- Swagger/OpenAPI
- Prometheus metrics

### Blockchain:
- Hyperledger Besu
- Hyperledger FireFly
- EVMConnect
- FireFly Signer
- FFTokens
- Solana

### Smart Contracts:
- Solidity ^0.8.20
- OpenZeppelin Contracts ^5.4.0
- Hardhat для разработки

### Infrastructure:
- Docker & Docker Compose
- Node.js 20
- TypeScript 5.6

---

## 📈 Roadmap

### ✅ Реализовано:
- [x] Besu blockchain setup
- [x] FireFly integration
- [x] KSC Token deployment
- [x] Multi-dashboard system
- [x] Real-time transaction monitoring
- [x] Organization management
- [x] IPFS integration
- [x] Solana integration (базовая)

### 🚧 В разработке:
- [ ] Token transfer functionality
- [ ] Staking/rewards system
- [ ] Solana NFT bridge (полная интеграция)
- [ ] CBDC (KZT) integration
- [ ] Government integration
- [ ] Multi-signature wallets
- [ ] Advanced analytics

---

## 📚 Дополнительная документация

- **README.md** - Основная документация проекта
- **START.md** - Инструкции по запуску
- **DEPLOY.md** - Инструкции по деплою контрактов
- **KSC_TOKEN_SUCCESS.md** - Документация по KSC токену
- **ORGANIZATIONS_TOKEN_EXCHANGE.md** - Обмен токенами между организациями
- **TOKEN_RESTORATION.md** - Восстановление состояния токенов

---

## 📊 Визуальная диаграмма архитектуры

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🏗️ KAZSMARTCHAIN ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              🌐 FRONTEND LAYER                              │
└─────────────────────────────────────────────────────────────────────────────┘

                    📊 Дэшборд панель (Next.js)
                              │
                              │ Transactions
                              │ WebSocket ⚡ (real-time)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🚀 APPLICATION LAYER                                │
└─────────────────────────────────────────────────────────────────────────────┘

                    🔧 Backend API (NestJS)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   Transactions          Queries              Files
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌──────────────┐    ┌──────────────┐
│  External     │    │  Storage     │    │  Storage     │
│  🌐 Solana    │    │  💾 Redis    │    │  📦 IPFS     │
│  Validator    │    │  (Cache)     │    │              │
└───────────────┘    └──────────────┘    │              │
                                        │              │ Metadata
                                        │              ▼
                                        │    ┌──────────────┐
                                        │    │  🐘 PostgreSQL│
                                        │    │              │
                                        │    └──────────────┘
                                        │           │
                                        │    Events │ Events
                                        │    (dashed)│
                                        │           │
                                        │           ▼
                                        │    ┌──────────────────────────────┐
                                        │    │    🔥 BLOCKCHAIN LAYER        │
                                        │    └──────────────────────────────┘
                                        │           │
                                        │    Transactions
                                        │           │
                                        │           ▼
                                        │    ┌──────────────────────────────┐
                                        │    │  🔥 Hyperledger FireFly       │
                                        │    │  (Unified Blockchain API)    │
                                        │    └──────────────────────────────┘
                                        │           │
                                        │    Transactions│Queries
                                        │           │
                                        │           ▼
                                        │    ┌──────────────────────────────┐
                                        │    │  🪙 FFTokens                 │
                                        │    │  (ERC-20/ERC-721 Connector)  │
                                        │    └──────────────────────────────┘
                                        │           │
                                        │    Transactions│Queries
                                        │           │
                                        │           ▼
                                        │    ┌──────────────────────────────┐
                                        │    │  ⚡ EVMCONNECT                │
                                        │    │  ┌──────────────────────────┐ │
                                        │    │  │  ✍️ FIREFLY SIGNER        │ │
                                        │    │  │  ┌──────────────────────┐│ │
                                        │    │  │  │  ⛓️ HYPERLEDGER BESU  ││ │
                                        │    │  │  │  ┌──────────────────┐ ││ │
                                        │    │  │  │  │  💰 KSC Token    │ ││ │
                                        │    │  │  │  │  (Smart Contract)│ ││ │
                                        │    │  │  │  └──────────────────┘ ││ │
                                        │    │  │  └──────────────────────┘│ │
                                        │    │  └──────────────────────────┘ │
                                        │    └──────────────────────────────┘
                                        │           │
                                        │    Events (dashed) ⬅️
                                        │           │
                                        └───────────┘
                                              │
                                        Events│Queries
                                              │
                                              ▼
                                    🔧 Backend API
                                              │
                                        WebSocket ⚡
                                              │
                                              ▼
                                    📊 Дэшборд панель

┌─────────────────────────────────────────────────────────────────────────────┐
│                            📋 УСЛОВНЫЕ ОБОЗНАЧЕНИЯ                           │
└─────────────────────────────────────────────────────────────────────────────┘

→  Сплошная стрелка    = Прямые запросы/команды (Transactions, Queries, Files)
⇢  Пунктирная стрелка  = События/уведомления (Events, WebSocket)
⬅️  Обратная стрелка   = Обратный поток данных

📊 = Frontend
🔧 = Backend API
🌐 = External Services
💾 = Cache Storage
📦 = File Storage
🐘 = Database
🔥 = Blockchain Services
⚡ = Connectors
✍️ = Signing Service
⛓️ = Blockchain Node
🪙 = Token Services
💰 = Smart Contract
```

### 🔄 Основные потоки данных:

**1. Транзакции:**
```
📊 Дэшборд → 🔧 Backend API → 🔥 FireFly → 🪙 FFTokens → ⚡ EVMCONNECT → ✍️ Signer → ⛓️ Besu → 💰 KSC Token
```

**2. События (обратный поток):**
```
💰 KSC Token → ⛓️ Besu → ⚡ EVMCONNECT → 🔥 FireFly → 🐘 PostgreSQL → 🔧 Backend API → 📊 Дэшборд (WebSocket)
```

**3. Загрузка файлов:**
```
📊 Дэшборд → 🔧 Backend API → 📦 IPFS → 🐘 PostgreSQL
```

**4. Кэширование:**
```
📊 Дэшборд → 🔧 Backend API → 💾 Redis
```

**5. Solana операции:**
```
📊 Дэшборд → 🔧 Backend API → 🌐 Solana Validator
```

---

## 🎨 Структура Frontend (Дэшборд панель)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    📊 FRONTEND ARCHITECTURE (Next.js)                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          🎯 APP ROUTER (Pages)                              │
└─────────────────────────────────────────────────────────────────────────────┘

                    📄 Root Layout (layout.tsx)
                    ├─ 🏠 Главная страница (/)
                    │  ├─ StatCard (метрики сети)
                    │  ├─ KSCTokenCard (KSC токены)
                    │  ├─ TransactionChart (график транзакций)
                    │  └─ TransactionsTable (таблица транзакций)
                    │
                    ├─ 🪙 Токены (/tokens)
                    │  └─ Управление KSC токенами
                    │
                    ├─ 👥 Организации (/orgs)
                    │  ├─ Список организаций
                    │  └─ Детали организации (/orgs/[id])
                    │     ├─ /tokens - Токены организации
                    │     ├─ /assets - Активы
                    │     ├─ /contracts - Контракты
                    │     ├─ /solana - Solana активы
                    │     ├─ /privacy - Приватные группы
                    │     ├─ /relay - Relay настройки
                    │     └─ /access - Управление доступом
                    │
                    ├─ 🌐 Сеть (/network)
                    │  └─ Мониторинг сети и валидаторов
                    │
                    ├─ 🔍 Explorer (/explorer)
                    │  └─ Блокчейн Explorer
                    │
                    ├─ 📋 Аудит (/audit)
                    │  └─ Журнал аудита
                    │
                    └─ 🛡️ Админ панель (/admin)
                       ├─ /admin - Главная админка
                       ├─ /admin/organizations - Управление организациями
                       ├─ /admin/validators - Валидаторы
                       ├─ /admin/audit - Аудит лог
                       └─ /admin/compliance - Compliance

```

### 📋 Основные страницы и их функции:

**🏠 Главная (`/`):**
- Метрики сети (узлы, валидаторы, транзакции)
- KSC Token карточка с балансами
- График транзакций
- Таблица последних транзакций
- Быстрый доступ к разделам

**🪙 Токены (`/tokens`):**
- Управление KSC токенами
- Балансы организаций
- История переводов
- Статистика токенов

**👥 Организации (`/orgs`):**
- Список всех организаций
- Детальная информация по организации
- Управление токенами, активами, контрактами
- Solana интеграция
- Приватные группы

**🌐 Сеть (`/network`):**
- Мониторинг состояния сети
- Статус валидаторов
- Метрики блокчейна

**🔍 Explorer (`/explorer`):**
- Просмотр блоков и транзакций
- Поиск по хешам
- Детали транзакций

**📋 Аудит (`/audit`):**
- Журнал всех событий
- Фильтрация по типам
- Экспорт данных

**🛡️ Админ (`/admin`):**
- Суперадмин панель
- Управление организациями
- Валидаторы
- Compliance

---

**Версия документа**: 1.0  
**Последнее обновление**: 2025  
**Поддерживается**: JASAIM Blockchain

