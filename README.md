# 🇰🇿 KazSmartChain - Sovereign Blockchain for Kazakhstan

**Production-Ready Blockchain Platform** with real token implementation, multi-party workflows, and complete dashboard integration.

> **Проект Blockchain & FinTech Laboratory** при поддержке **NU Impact Foundation**  
> Назарбаевский Университет (НУ)

## ✨ Features

### Blockchain Infrastructure
- ⛓️ **Hyperledger Besu** - EVM-compatible private blockchain (QBFT consensus)
- 🔥 **Hyperledger FireFly** - Unified blockchain API with event streaming
- 🔐 **QBFT Consensus** - Quorum Byzantine Fault Tolerance для безопасности сети
- 📡 **EVMConnect** - Коннектор между FireFly и Besu
- ✍️ **FireFly Signer** - Подписание транзакций

### Token System
- 💰 **KSC Token** - Native ERC-20 utility token (deployed & working, 1.15M+ KSC)
- 🏦 **NU Stablecoin (NU-T)** - University-issued stablecoin contract (1:1 с тенге)
- 🔐 **Custody Service** - Digital asset custody solution для управления активами
- 🪙 **FFTokens Integration** - Поддержка ERC-20 и ERC-721 стандартов

### Dashboard & Monitoring
- 🎨 **Multi-Dashboard System** - Superadmin, Organization & Public Explorer
- 📊 **Real-time Monitoring** - Live blockchain metrics & transaction tracking
- 📈 **Transaction Charts** - Графики активности транзакций
- 🔍 **Blockchain Explorer** - Просмотр блоков и транзакций
- 📋 **Audit Logging** - Полный журнал всех операций

### Multi-party & Security
- 🔐 **Multi-party System** - Support for multiple organizations
- 👥 **Role-Based Access Control (RBAC)** - Система ролей и прав доступа
- 🏢 **Multi-tenant Isolation** - Изоляция данных между организациями
- 🔒 **Private Messaging** - Приватные транзакции между организациями

### Storage & Integration
- 📦 **IPFS Integration** - Decentralized storage для файлов и метаданных
- 🌐 **Solana Integration** - NFT/Certificate integration (базовая реализация)
- 🗄️ **PostgreSQL** - Надежное хранение бизнес-данных
- ⚡ **Redis** - Кэширование и сессии

## 🏗️ Architecture

```
┌─────────────────────┐
│  Next.js Dashboard  │ ← http://localhost:3000
│  (React + Tailwind) │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   NestJS API        │ ← http://localhost:4000
│   (Multi-tenant)    │
└─────────┬───────────┘
          │
    ┌─────┴──────────┬──────────┐
    │                │          │
┌───▼────┐   ┌───────▼───┐  ┌──▼─────┐
│ Besu   │   │  FireFly  │  │  IPFS  │
│ :8545  │   │  :5000    │  │  :5001 │
└────────┘   └───────────┘  └────────┘
```

## 🚀 Quick Start

### 1. Start the Stack

```bash
# Start all services
docker-compose -f docker-compose.simple.yml up -d

# Wait ~60 seconds for initialization
# Check status
docker-compose -f docker-compose.simple.yml ps
```

### 2. Access Dashboards

- **Main Dashboard**: http://localhost:3000
- **KSC Tokens**: http://localhost:3000/tokens
- **Organizations**: http://localhost:3000/orgs
- **Network Monitor**: http://localhost:3000/network
- **Admin Panel**: http://localhost:3000/admin
- **Explorer**: http://localhost:3000/explorer

### 3. Backend APIs

- **API Server**: http://localhost:4000
- **API Docs**: http://localhost:4000/docs
- **Health Check**: http://localhost:4000/api/health

### 4. Blockchain Services

- **FireFly UI**: http://localhost:5000
- **Besu RPC**: http://localhost:8545
- **IPFS Gateway**: http://localhost:8080

## 💰 KSC Token Details

```
Contract Address: 0x42699A7612A82f1d9C36148af9C77354759b210b
Symbol: KSC
Decimals: 18
```

### Token Operations

```bash
# Deploy new token
npm run deploy:ksc

# Test token functionality
npm run test:ksc

# Mint tokens for organizations
npm run mint:orgs

# Direct mint (bypassing FireFly)
npm run mint:direct

# Check balances
npm run check:ksc-balance
```

## 🏢 Organizations

Currently active organizations:

1. **Назарбаевский Университет (НУ)**
   - Slug: `nu`
   - Address: `0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73`
   - Admin: admin@nu.kz

2. **КазНУ имени Аль-Фараби**
   - Slug: `kaznu`
   - Address: `0x501E66aB402b9E7b5BeE8c10fc82D4D65c8A8D8C`
   - Admin: admin@kaznu.kz

## 📊 API Endpoints

### KSC Token APIs

```bash
# Get all balances
GET http://localhost:4000/api/tokens/balances

# Get transaction history
GET http://localhost:4000/api/tokens/transactions?limit=50&offset=0

# Get token statistics
GET http://localhost:4000/api/tokens/stats
```

### Dashboard APIs

```bash
# Network metrics
GET http://localhost:4000/api/dashboard/network

# Organization metrics
GET http://localhost:4000/api/dashboard/org/:id

# Recent transactions
GET http://localhost:4000/api/dashboard/transactions/recent

# Validators
GET http://localhost:4000/api/dashboard/validators
```

## 💾 Data Persistence

All data is persisted in Docker volumes and **safe to stop/restart**:

- `pgdata` - PostgreSQL database
- `besu_data` - Blockchain data (all blocks & transactions)
- `firefly_data` - FireFly data
- `ipfs_data` - IPFS files
- `solana_data` - Solana data
- `evmconnect_data` - EVMConnect events

## 🛠️ Development

### Project Structure

```
kazsmartchain/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # Next.js frontend
│   └── relay/        # Relay service
├── packages/
│   └── sdk/          # Shared TypeScript SDK
├── contracts/        # Solidity contracts
├── scripts/          # Deployment & testing scripts
├── config/           # Configuration files
│   ├── firefly.core.yaml
│   └── evmconnect.yaml
└── docker-compose.simple.yml
```

### Database Seeding

```bash
# Seed initial organizations
docker-compose -f docker-compose.simple.yml exec api npm run seed
```

### Blockchain Operations

```bash
# Compile contracts
npm run compile

# Deploy KSC token
npm run deploy:ksc

# Test token
npm run test:ksc

# Mint for organizations
npm run mint:direct
```

## 🔒 Security Features

### KSC Token Security

- ✅ OpenZeppelin audited contracts
- ✅ Owner-only minting (Ownable)
- ✅ Emergency pause functionality (Pausable)
- ✅ Token burning capability (ERC20Burnable)
- ✅ Gasless approvals (ERC20Permit)

### Platform Security

- Multi-tenant isolation
- Role-based access control (RBAC)
- Audit logging for all operations
- Private messaging between organizations
- QBFT consensus for network security

## 📈 Monitoring

Real-time updates every 10-15 seconds:

- Network health & metrics
- Token balances
- Transaction history
- Validator status
- Organization activity

## 🌐 Network Information

### Besu Configuration

- **Network ID**: 1337
- **Consensus**: QBFT (Quorum Byzantine Fault Tolerance)
- **RPC Endpoint**: http://localhost:8545
- **Chain Type**: Private/Permissioned

### FireFly Configuration

- **Namespace**: default
- **Blockchain**: Ethereum (Besu)
- **Tokens**: fftokens (ERC-20/ERC-721)
- **Storage**: IPFS
- **Database**: PostgreSQL

## 🔧 Troubleshooting

### Check Service Status

```bash
# All containers
docker-compose -f docker-compose.simple.yml ps

# Specific service logs
docker logs kaz-web
docker logs kaz-api
docker logs firefly
docker logs besu
```

### Restart Services

```bash
# Restart specific service
docker-compose -f docker-compose.simple.yml restart web

# Restart all
docker-compose -f docker-compose.simple.yml restart

# Full rebuild
docker-compose -f docker-compose.simple.yml down
docker-compose -f docker-compose.simple.yml up -d --build
```

### Common Issues

**Web container error "No workspaces found":**
- Fixed: `workspaces` added to root `package.json`

**API container crashes:**
- Fixed: Using `npx ts-node` instead of `ts-node-dev`

**FireFly operations stuck:**
- Use direct Hardhat scripts: `npm run mint:direct`

## 🎯 Roadmap

### ✅ Реализовано

- [x] **Besu blockchain setup** - Полностью настроен приватный блокчейн с QBFT консенсусом
- [x] **FireFly integration** - Интеграция с Hyperledger FireFly для unified API
- [x] **KSC Token deployment** - Развернут и работает ERC-20 токен
- [x] **Multi-dashboard system** - Система дашбордов: Superadmin, Organization, Public Explorer
- [x] **Real-time transaction monitoring** - Мониторинг транзакций в реальном времени через WebSocket
- [x] **Organization management** - Управление организациями с мультитенантностью
- [x] **IPFS integration** - Интеграция с IPFS для децентрализованного хранения файлов
- [x] **Solana integration** - Базовая интеграция с Solana для NFT/сертификатов
- [x] **Token balances API** - API для получения балансов и статистики токенов
- [x] **Transaction history** - История транзакций с фильтрацией и пагинацией
- [x] **Network monitoring** - Мониторинг сети, валидаторов и метрик блокчейна
- [x] **Audit logging** - Система аудита всех операций
- [x] **NU Stablecoin contract** - Контракт для университетского стейблкоина (NU-T)
- [x] **Custody Service contract** - Контракт для кастоди сервиса
- [x] **Database seeding** - Система инициализации организаций и пользователей
- [x] **Role-Based Access Control (RBAC)** - Система ролей и прав доступа
- [x] **Multi-tenant isolation** - Изоляция данных между организациями

### 🚧 В разработке

- [ ] **Token transfer functionality** - Функциональность переводов токенов между организациями
- [ ] **Staking/rewards system** - Система стейкинга и вознаграждений
- [ ] **Solana NFT bridge** - Полная интеграция с Solana для NFT
- [ ] **CBDC (KZT) integration** - Интеграция с цифровым тенге
- [ ] **Government integration** - Интеграция с государственными системами
- [ ] **Multi-signature wallets** - Мультиподписные кошельки
- [ ] **Advanced analytics** - Расширенная аналитика и отчетность
- [ ] **Governance system** - Система управления через голосование
- [ ] **Gas fee burning** - Механизм сжигания gas fees

## 📚 Documentation

- **FireFly**: https://hyperledger.github.io/firefly/
- **Besu**: https://besu.hyperledger.org/
- **OpenZeppelin**: https://docs.openzeppelin.com/

## 🤝 Contributing

This is a sovereign blockchain project for Kazakhstan, developed by **Blockchain & FinTech Laboratory** at Nazarbayev University with support from **NU Impact Foundation**.

For collaboration inquiries, please contact the project maintainers.

### About the Project

**KazSmartChain** is part of the research and development initiatives at Nazarbayev University's Blockchain & FinTech Laboratory, aimed at creating a sovereign blockchain infrastructure for Kazakhstan. The project focuses on:

- Building a production-ready blockchain platform
- Developing innovative fintech solutions
- Creating educational resources for blockchain technology
- Supporting digital transformation in Kazakhstan

**Supported by:** NU Impact Foundation

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for Kazakhstan 🇰🇿**

---

**Blockchain & FinTech Laboratory** | **NU Impact Foundation** | **Nazarbayev University**
