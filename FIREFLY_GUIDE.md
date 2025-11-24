# 🔥 FireFly в KazSmartChain

## Что такое FireFly?

**Hyperledger FireFly** - это унифицированный API gateway для блокчейнов, который упрощает работу с:
- 🔗 Ethereum (через Besu + EVMConnect)
- 📦 Smart Contracts (развертывание и вызовы)
- 🪙 Токенами (ERC-20, ERC-721, ERC-1155)
- 📁 IPFS (децентрализованное хранилище)
- 📡 Event Streaming (отслеживание событий блокчейна)

## Архитектура

```
┌─────────────────────────────────────────────────┐
│              KazSmartChain API                  │
│           (ваше приложение)                     │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│           🔥 FireFly Core                       │
│      Унифицированный API (Port 5000)           │
│  • Namespaces (изоляция данных)                 │
│  • Smart Contract Management                    │
│  • Token APIs                                   │
│  • Event Streaming                              │
└─────┬──────────────────┬────────────────┬───────┘
      │                  │                │
      ▼                  ▼                ▼
┌──────────┐      ┌───────────┐    ┌──────────┐
│⚡EVMConnect│     │ 📦 IPFS   │    │🗄️Postgres│
│Port 5008 │      │Port 5001  │    │Port 5432 │
└────┬─────┘      └───────────┘    └──────────┘
     │
     ▼
┌────────────┐
│ ⛓️ Besu     │
│Port 8545   │
│(Ethereum)  │
└────────────┘
```

## Основные концепции

### 1. Namespaces (Пространства имен)
- **default** - ваше основное пространство
- Изолирует данные для разных приложений/организаций
- Каждый namespace имеет свои plugins

### 2. Plugins (Плагины)
- **blockchain0** (ethereum) - подключение к Besu через EVMConnect
- **database0** (postgres) - хранение событий и транзакций
- **sharedstorage0** (ipfs) - хранение файлов и метаданных

### 3. Event Streams
- Автоматическое отслеживание событий из блокчейна
- WebSocket подключение для real-time уведомлений
- Хранение истории событий в PostgreSQL

## API Endpoints

### Базовые

```bash
# Статус системы
GET http://localhost:5000/api/v1/status

# Список namespaces
GET http://localhost:5000/api/v1/namespaces

# Информация о namespace
GET http://localhost:5000/api/v1/namespaces/default/status
```

### Smart Contracts

```bash
# Развернуть контракт
POST http://localhost:5000/api/v1/namespaces/default/contracts/deploy

# Вызвать метод контракта
POST http://localhost:5000/api/v1/namespaces/default/contracts/invoke
```

### События

```bash
# Получить события
GET http://localhost:5000/api/v1/namespaces/default/events

# WebSocket подключение
ws://localhost:5000/ws?namespace=default
```

## Примеры использования

### 1. Проверка статуса

**PowerShell:**
```powershell
Invoke-RestMethod http://localhost:5000/api/v1/status | ConvertTo-Json
```

**Bash:**
```bash
curl http://localhost:5000/api/v1/status | jq
```

### 2. Получить список namespaces

**PowerShell:**
```powershell
Invoke-RestMethod http://localhost:5000/api/v1/namespaces | Format-Table
```

**Bash:**
```bash
curl http://localhost:5000/api/v1/namespaces | jq
```

### 3. Развернуть Smart Contract

```bash
curl -X POST http://localhost:5000/api/v1/namespaces/default/contracts/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "contract": "0x608060405234...",  # Bytecode
    "definition": { ... }              # ABI
  }'
```

## Конфигурация

### config/firefly.core.yaml

```yaml
http:
  address: 0.0.0.0
  port: 5000

namespaces:
  default: default
  predefined:
    - name: default
      plugins:
        - blockchain0
        - sharedstorage0
        - database0

plugins:
  database:
    - name: database0
      type: postgres
      postgres:
        url: postgres://kaz:kazpass@postgres:5432/kazsmartchain
        migrations:
          auto: true

  blockchain:
    - name: blockchain0
      type: ethereum
      ethereum:
        ethconnect:
          url: http://evmconnect:5008

  sharedstorage:
    - name: sharedstorage0
      type: ipfs
      ipfs:
        api:
          url: http://ipfs:5001
```

### config/evmconnect.yaml

```yaml
connector:
  url: http://besu:8545

persistence:
  leveldb:
    path: /evmconnect/data

ffcore:
  url: http://firefly:5000
  namespaces:
    - default

api:
  port: 5008
  address: 0.0.0.0
```

## Troubleshooting

### FireFly показывает "namespace initializing"
```bash
# Проверьте логи
docker logs kaz-firefly -f

# Проверьте подключение к PostgreSQL
docker logs kaz-postgres
```

### EVMConnect не подключается к Besu
```bash
# Проверьте что Besu работает
docker ps | grep besu

# Проверьте логи EVMConnect
docker logs kaz-evmconnect -f

# Проверьте что Besu майнит блоки
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Ошибка "permission denied" для leveldb
```bash
# Пересоздайте volume с правильными правами
docker-compose -f docker-compose.simple.yml down -v
docker-compose -f docker-compose.simple.yml up -d
```

## Полезные ссылки

- 📖 [FireFly Documentation](https://hyperledger.github.io/firefly/latest/)
- 🔌 [EVMConnect GitHub](https://github.com/hyperledger/firefly-evmconnect)
- 🎓 [FireFly Tutorials](https://hyperledger.github.io/firefly/latest/tutorials/)
- 📺 [FireFly Video Guides](https://www.youtube.com/@HyperledgerFoundation)

## Следующие шаги

1. ✅ Изучите [API Reference](https://hyperledger.github.io/firefly/latest/reference/)
2. ✅ Попробуйте развернуть свой первый Smart Contract
3. ✅ Настройте WebSocket подключение для событий
4. ✅ Изучите Token APIs для создания ERC-20/ERC-721

---

**Вопросы?** Смотрите полную документацию в [README_SIMPLE.md](README_SIMPLE.md)

