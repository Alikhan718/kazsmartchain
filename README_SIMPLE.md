# 🚀 KazSmartChain - Упрощенная рабочая версия

## 📋 Что это?

Это **упрощенная, готовая к работе версия** KazSmartChain с реальными сервисами:
- ✅ **Hyperledger Besu** - Ethereum-совместимый блокчейн
- ✅ **Hyperledger FireFly** - Enterprise блокчейн-шлюз
- ✅ **Solana Test Validator** - Реальный Solana validator
- ✅ **IPFS** - Децентрализованное хранилище
- ✅ **PostgreSQL, Redis** - Инфраструктура
- ✅ **API & Web** - Ваши приложения

## 🎯 Быстрый старт

### Windows (PowerShell)

```powershell
# Запуск всей системы
.\scripts\start-simple.ps1

# Тестирование
.\scripts\test-simple.ps1
```

### Linux/Mac (Bash)

```bash
# Сделать скрипты исполняемыми
chmod +x scripts/start-simple.sh scripts/test-simple.sh

# Запуск всей системы
bash scripts/start-simple.sh

# Тестирование
bash scripts/test-simple.sh
```

### Или вручную

```bash
# Запуск
docker-compose -f docker-compose.simple.yml up -d

# Просмотр логов
docker-compose -f docker-compose.simple.yml logs -f

# Остановка
docker-compose -f docker-compose.simple.yml down
```

## 📊 Что внутри?

### Сервисы и порты

| Сервис | Порт | URL | Описание |
|--------|------|-----|----------|
| **FireFly API** | 5000 | http://localhost:5000/api | Блокчейн-шлюз |
| **Besu RPC** | 8545 | http://localhost:8545 | Ethereum RPC |
| **IPFS API** | 5001 | http://localhost:5001 | Децентрализованное хранилище |
| **IPFS Gateway** | 8080 | http://localhost:8080 | IPFS веб-gateway |
| **Solana RPC** | 8899 | http://localhost:8899 | Solana JSON-RPC |
| **API Backend** | 4000 | http://localhost:4000 | NestJS API |
| **Web Frontend** | 3000 | http://localhost:3000 | Next.js UI |
| **PostgreSQL** | 5432 | localhost:5432 | База данных |
| **Redis** | 6379 | localhost:6379 | Кэш |

## 🔧 Что исправлено?

### ✅ Критические исправления

1. **Network Binding Fixed** ✅
   ```yaml
   FF_SERVER_ADDRESS: "0.0.0.0"  # Вместо 127.0.0.1
   ```

2. **Правильные service names** ✅
   ```yaml
   FIREFLY_BASE_URL: http://firefly:5000  # Вместо host.docker.internal
   BESU_RPC_URL: http://besu:8545
   SOLANA_RPC_URL: http://solana-validator:8899
   ```

3. **Использование evmconnect вместо ethconnect** ✅
   - Современный подход без Kafka
   - Прямое подключение FireFly → Besu
   - Проще и надежнее

4. **Реальный Solana validator** ✅
   - Вместо мока используется `solana-test-validator`
   - Полноценный локальный validator
   - Реальные транзакции

5. **Правильная последовательность запуска** ✅
   - Сначала инфраструктура
   - Затем блокчейны
   - Потом приложения

## 📝 Примеры использования

### 1. Проверка FireFly

```bash
# Получить статус
curl http://localhost:5000/api/v1/status

# Получить namespaces
curl http://localhost:5000/api/v1/namespaces

# Получить информацию о default namespace
curl http://localhost:5000/api/v1/namespaces/default
```

**Ожидаемый ответ:**
```json
{
  "name": "default",
  "created": "2025-11-24T...",
  "plugins": ["blockchain", "sharedstorage", "tokens"]
}
```

### 2. Проверка Besu

```bash
# Получить номер последнего блока
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'

# Получить Chain ID
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc": "2.0",
    "method": "eth_chainId",
    "params": [],
    "id": 1
  }'
```

### 3. Проверка Solana

```bash
# Получить версию
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc": "2.0",
    "method": "getVersion",
    "params": [],
    "id": 1
  }'

# Проверить health
curl -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc": "2.0",
    "method": "getHealth",
    "params": [],
    "id": 1
  }'
```

### 4. Работа с IPFS

```bash
# Добавить файл
echo "Hello KazSmartChain!" | curl -X POST \
  -F "file=@-" \
  http://localhost:5001/api/v0/add

# Получить файл (замените HASH на полученный выше)
curl http://localhost:8080/ipfs/HASH
```

### 5. Создание token pool в FireFly

```bash
# Создать fungible token pool
curl -X POST http://localhost:5000/api/v1/namespaces/default/tokens/pools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "KazCoin",
    "type": "fungible",
    "config": {
      "name": "Kazakhstan Coin",
      "symbol": "KZC"
    }
  }'
```

### 6. Отправка сообщения через FireFly

```bash
# Broadcast сообщение
curl -X POST http://localhost:5000/api/v1/namespaces/default/messages/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "value": "Hello from KazSmartChain!"
    }]
  }'
```

## 🔍 Мониторинг и логи

### Просмотр логов

```bash
# Все сервисы
docker-compose -f docker-compose.simple.yml logs -f

# Конкретный сервис
docker-compose -f docker-compose.simple.yml logs -f firefly
docker-compose -f docker-compose.simple.yml logs -f besu
docker-compose -f docker-compose.simple.yml logs -f solana-validator
docker-compose -f docker-compose.simple.yml logs -f api
```

### Проверка статуса

```bash
# Статус всех контейнеров
docker-compose -f docker-compose.simple.yml ps

# Health checks
docker-compose -f docker-compose.simple.yml ps | grep healthy
```

### Подключение к контейнеру

```bash
# FireFly
docker exec -it kaz-firefly sh

# Besu
docker exec -it kaz-besu sh

# API
docker exec -it kaz-api bash
```

## 🐛 Устранение проблем

### FireFly не отвечает

1. Подождите 1-2 минуты после запуска
2. Проверьте логи:
   ```bash
   docker logs kaz-firefly -f
   ```
3. Убедитесь что Besu и IPFS запущены:
   ```bash
   docker-compose -f docker-compose.simple.yml ps besu ipfs
   ```
4. Проверьте, что FireFly слушает на 0.0.0.0:
   ```bash
   docker logs kaz-firefly | grep "0.0.0.0:5000"
   ```

### Besu не майнит блоки

1. Проверьте логи:
   ```bash
   docker logs kaz-besu | grep -i "block"
   ```
2. Убедитесь что майнинг включен:
   ```bash
   docker logs kaz-besu | grep -i "miner"
   ```
3. Проверьте что есть транзакции для майнинга

### Solana не запускается

1. Проверьте логи:
   ```bash
   docker logs kaz-solana -f
   ```
2. Solana validator требует 1-2 минуты для инициализации
3. Проверьте доступные ресурсы (CPU/RAM)

### API не может подключиться к FireFly

1. Убедитесь что используется правильный URL:
   ```bash
   docker exec kaz-api env | grep FIREFLY
   # Должно быть: FIREFLY_BASE_URL=http://firefly:5000
   ```
2. Проверьте сетевое соединение:
   ```bash
   docker exec kaz-api curl http://firefly:5000/api/v1/status
   ```
3. Проверьте что контейнеры в одной сети:
   ```bash
   docker network inspect kazsmartchain-network
   ```

### Порты заняты

Если порты 5000, 8545, 8899 и т.д. уже заняты:

1. Найдите процессы:
   ```bash
   # Windows
   netstat -ano | findstr "5000"
   
   # Linux/Mac
   lsof -i :5000
   ```
2. Остановите старые контейнеры:
   ```bash
   docker stop $(docker ps -aq)
   ```
3. Или измените порты в `docker-compose.simple.yml`

## 🎓 Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                     KazSmartChain                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Web (UI)   │─────▶│  API Server  │                │
│  │   Next.js    │      │   NestJS     │                │
│  └──────────────┘      └──────┬───────┘                │
│                               │                          │
│         ┌─────────────────────┼───────────────┐         │
│         │                     │               │         │
│         ▼                     ▼               ▼         │
│  ┌──────────┐         ┌──────────┐    ┌──────────┐    │
│  │ FireFly  │◀───────▶│   Besu   │    │  Solana  │    │
│  │ Gateway  │         │ (ETH)    │    │Validator │    │
│  └────┬─────┘         └──────────┘    └──────────┘    │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────┐                                          │
│  │   IPFS   │                                          │
│  │ Storage  │                                          │
│  └──────────┘                                          │
│                                                          │
│  Infrastructure:                                        │
│  ┌──────────┐  ┌──────────┐                           │
│  │Postgres  │  │  Redis   │                           │
│  └──────────┘  └──────────┘                           │
└─────────────────────────────────────────────────────────┘
```

## 📚 Дополнительная информация

### Документация

- **FireFly**: https://hyperledger.github.io/firefly/
- **Besu**: https://besu.hyperledger.org/
- **Solana**: https://docs.solana.com/
- **IPFS**: https://docs.ipfs.tech/

### Примеры кода

Примеры использования API находятся в:
- `scripts/test-besu.ts` - Примеры работы с Besu
- `apps/api/src/modules/firefly/` - FireFly интеграция
- `apps/api/src/modules/solana/` - Solana интеграция

### Swagger API документация

После запуска доступна по адресу:
- http://localhost:4000/api

## 🔐 Безопасность

⚠️ **ВАЖНО**: Эта конфигурация предназначена **ТОЛЬКО для разработки и тестирования**.

Для production необходимо:
1. ✅ Включить TLS/mTLS для всех сервисов
2. ✅ Настроить реальную аутентификацию (OIDC/SAML)
3. ✅ Использовать сильные пароли и секреты
4. ✅ Настроить файрволл
5. ✅ Регулярно обновлять все компоненты
6. ✅ Использовать production режимы для всех сервисов
7. ✅ Настроить мониторинг и алерты

## 🎯 Следующие шаги

После успешного запуска вы можете:

1. **Развернуть смарт-контракт через FireFly**
   ```bash
   curl -X POST http://localhost:5000/api/v1/namespaces/default/contracts/deploy \
     -H "Content-Type: application/json" \
     -d @your-contract.json
   ```

2. **Создать NFT на Solana**
   - Используйте Solana CLI или API endpoint

3. **Настроить multi-party систему**
   - Запустите несколько FireFly нод
   - Настройте P2P коммуникацию

4. **Интегрировать с вашим приложением**
   - Используйте SDK из `packages/sdk`
   - Подключите к API на порту 4000

## 💡 Полезные советы

1. **Первый запуск занимает время**
   - Docker скачивает образы (~5-10 минут)
   - Инициализация сервисов (~2-3 минуты)
   - Будьте терпеливы! ☕

2. **Используйте тестовые скрипты**
   ```bash
   # Автоматическая проверка всех сервисов
   bash scripts/test-simple.sh
   ```

3. **Следите за логами**
   ```bash
   # В отдельном терминале
   docker-compose -f docker-compose.simple.yml logs -f
   ```

4. **Периодически очищайте Docker**
   ```bash
   # Удалить неиспользуемые образы
   docker image prune
   
   # Удалить все (осторожно!)
   docker system prune -a --volumes
   ```

## 🤝 Поддержка

Если что-то не работает:

1. Запустите тестовый скрипт: `bash scripts/test-simple.sh`
2. Проверьте логи: `docker-compose -f docker-compose.simple.yml logs`
3. Убедитесь что все порты свободны
4. Проверьте что Docker имеет достаточно ресурсов (CPU/RAM)
5. Попробуйте перезапустить: `docker-compose -f docker-compose.simple.yml restart`

## 📝 Changelog

### Version 1.0 (2025-11-24)

- ✅ Упрощенная архитектура без Kafka/Zookeeper
- ✅ Использование evmconnect вместо ethconnect
- ✅ Реальный Solana test validator
- ✅ Исправлен network binding (0.0.0.0)
- ✅ Правильные service names для Docker networking
- ✅ Автоматические скрипты запуска и тестирования
- ✅ Healthchecks для всех сервисов
- ✅ Документация и примеры

---

**🎉 Готово! Теперь у вас есть полностью рабочая KazSmartChain!**

