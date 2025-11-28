# 🇰🇿 KazSmartChain - Sovereign Blockchain for Kazakhstan

**Production-Ready Blockchain Platform** with real token implementation, multi-party workflows, and complete dashboard integration.

## ✨ Features

- ⛓️ **Hyperledger Besu** - EVM-compatible private blockchain (QBFT consensus)
- 🔥 **Hyperledger FireFly** - Unified blockchain API with event streaming
- 💰 **KSC Token** - Native ERC-20 utility token (deployed & working)
- 🎨 **Multi-Dashboard System** - Superadmin, Organization & Public Explorer
- 📊 **Real-time Monitoring** - Live blockchain metrics & transaction tracking
- 🔐 **Multi-party System** - Support for multiple organizations
- 📦 **IPFS Integration** - Decentralized storage
- 🌐 **Solana Bridge** - NFT/Certificate integration (planned)

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
Total Supply: 1,151,950 KSC

Current Holders:
  • Банк ЦентрКредит (BCC): 1,099,800 KSC
  • КазНУ имени Аль-Фараби: 50,000 KSC
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

1. **Банк ЦентрКредит (BCC)**
   - Slug: `bcc`
   - Address: `0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73`
   - Admin: admin@bcc.kz

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

- [x] Besu blockchain setup
- [x] FireFly integration
- [x] KSC Token deployment
- [x] Multi-dashboard system
- [x] Real-time transaction monitoring
- [x] Organization management
- [ ] Token transfer functionality
- [ ] Staking/rewards system
- [ ] Solana NFT bridge
- [ ] CBDC (KZT) integration
- [ ] Government integration
- [ ] Multi-signature wallets
- [ ] Advanced analytics

## 📚 Documentation

- **FireFly**: https://hyperledger.github.io/firefly/
- **Besu**: https://besu.hyperledger.org/
- **OpenZeppelin**: https://docs.openzeppelin.com/

## 🤝 Contributing

This is a sovereign blockchain project for Kazakhstan. For collaboration inquiries, please contact the project maintainers.

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for Kazakhstan 🇰🇿**
