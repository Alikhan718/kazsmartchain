# FireFly Mock Server

Простой мок-сервер для эмуляции Hyperledger FireFly API для локальной разработки и демонстрации.

## Запуск

```bash
cd apps/mocks/firefly
node index.js
```

Сервер запустится на порту `5100` (или на порту, указанном в переменной окружения `PORT`).

## Эндпоинты

### Health Check
- `GET /health` - Проверка состояния сервера

### Namespaces
- `GET /namespaces` - Список пространств имен

### Token Pools
- `POST /api/v1/namespaces/default/tokens/pools` - Создать пул токенов
- `GET /api/v1/namespaces/default/tokens/pools` - Список пулов токенов

### Token Operations
- `POST /api/v1/namespaces/default/tokens/mint` - Минт токенов
- `POST /api/v1/namespaces/default/tokens/transfer` - Перевод токенов
- `POST /api/v1/namespaces/default/tokens/burn` - Сжигание токенов

### Transactions
- `POST /api/v1/namespaces/default/transactions/private` - Создать приватную транзакцию

### Contracts
- `POST /api/v1/namespaces/default/contracts/interfaces` - Добавить интерфейс контракта
- `GET /api/v1/namespaces/default/contracts/interfaces` - Список интерфейсов

### Event Streams
- `POST /api/v1/namespaces/default/events/streams` - Создать поток событий
- `GET /api/v1/namespaces/default/events/streams` - Список потоков

### Events (для Relay)
- `GET /events` - Получить события (для polling relay worker)

## Особенности

- ✅ CORS поддержка для всех запросов
- ✅ Логирование всех запросов
- ✅ Хранение состояния в памяти (сбрасывается при перезапуске)
- ✅ Генерация случайных ID для всех ресурсов
- ✅ Поддержка всех основных операций FireFly API

## Использование с Docker

Сервер автоматически запускается через `docker-compose.yml`:

```bash
docker-compose up firefly-mock
```

