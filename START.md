# 🚀 Команды для запуска KazSmartChain

## 📋 Быстрый старт

```bash
# 1. Переход в папку проекта
cd C:\Users\seitk\Desktop\jas\blockchain.lab\kazsmartchain

# 2. Остановка старых контейнеров (если есть)
docker-compose -f docker-compose.simple.yml down

# 3. Запуск всех сервисов
docker-compose -f docker-compose.simple.yml up -d

# 4. Проверка статуса
docker-compose -f docker-compose.simple.yml ps
```

## 🔍 Полезные команды

### Просмотр логов
```bash
# Все сервисы
docker-compose -f docker-compose.simple.yml logs -f

# Конкретный сервис
docker-compose -f docker-compose.simple.yml logs -f kaz-api
docker-compose -f docker-compose.simple.yml logs -f kaz-web
docker-compose -f docker-compose.simple.yml logs -f firefly
```

### Перезапуск сервиса
```bash
docker-compose -f docker-compose.simple.yml restart kaz-api
docker-compose -f docker-compose.simple.yml restart kaz-web
```

### Остановка
```bash
# Остановка без удаления volumes
docker-compose -f docker-compose.simple.yml down

# Полная очистка (удаляет volumes!)
docker-compose -f docker-compose.simple.yml down -v
```

## 🌐 Доступные URL после запуска

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/docs
- **FireFly**: http://localhost:5000
- **Besu RPC**: http://localhost:8545
- **IPFS Gateway**: http://localhost:8080

## ⚠️ Важно

- Данные сохраняются в Docker volumes
- При `down -v` все данные будут удалены!
- Первый запуск может занять 2-3 минуты (скачивание образов)

