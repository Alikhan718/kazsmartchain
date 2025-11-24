# ⚡ KazSmartChain - Быстрый старт за 5 минут

## 🎯 Что нужно?

- ✅ Docker Desktop установлен и запущен
- ✅ Минимум 8GB RAM
- ✅ Минимум 20GB свободного места на диске

## 🚀 Запуск (Выберите свою ОС)

### Windows

```powershell
# 1. Открыть PowerShell в папке проекта
cd C:\Users\seitk\Desktop\jas\blockchain.lab\kazsmartchain

# 2. Запустить систему
.\scripts\start-simple.ps1

# 3. Подождать 3-5 минут пока все запустится ☕

# 4. Проверить что все работает
.\scripts\test-simple.ps1
```

### Linux/Mac

```bash
# 1. Перейти в папку проекта
cd ~/kazsmartchain

# 2. Дать права на выполнение скриптам
chmod +x scripts/*.sh

# 3. Запустить систему
bash scripts/start-simple.sh

# 4. Подождать 3-5 минут пока все запустится ☕

# 5. Проверить что все работает
bash scripts/test-simple.sh
```

## ✅ Проверка

После запуска откройте в браузере:

1. **🔥 FireFly API** → http://localhost:5000/api/v1/status
   - Должен вернуть JSON с информацией о namespace и plugins
   - FireFly - это унифицированный API для блокчейнов (Ethereum, Solana)

2. **🌐 Web Frontend** → http://localhost:3000
   - Должно загрузиться веб-приложение

3. **🔌 API Backend** → http://localhost:4000/api
   - Должна открыться API документация

4. **⚡ EVMConnect** → http://localhost:5008/eventstreams
   - Должен вернуть список event streams
   - EVMConnect соединяет FireFly с Besu (Ethereum)

## 🧪 Быстрый тест

### Windows PowerShell:
```powershell
# 1. Проверка FireFly (унифицированный API)
Invoke-RestMethod http://localhost:5000/api/v1/status | ConvertTo-Json

# 2. Проверка Besu (Ethereum) - должен показать номер блока
$body = @{ jsonrpc = "2.0"; method = "eth_blockNumber"; params = @(); id = 1 } | ConvertTo-Json
Invoke-RestMethod http://localhost:8545 -Method Post -Body $body -ContentType "application/json"

# 3. Проверка namespaces в FireFly
Invoke-RestMethod http://localhost:5000/api/v1/namespaces | Format-Table
```

### Linux/Mac:
```bash
# 1. Проверка FireFly (унифицированный API)
curl http://localhost:5000/api/v1/status | jq

# 2. Проверка Besu (Ethereum) - должен показать номер блока
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq

# 3. Проверка namespaces в FireFly
curl http://localhost:5000/api/v1/namespaces | jq

# 4. Проверка IPFS
curl http://localhost:5001/api/v0/version | jq
```

Если все команды возвращают JSON ответы - **поздравляю! Все работает!** 🎉

## 🛑 Остановка

```bash
# Windows
docker-compose -f docker-compose.simple.yml down

# Linux/Mac
docker-compose -f docker-compose.simple.yml down
```

## 📚 Следующие шаги

1. Прочитайте полную документацию: [README_SIMPLE.md](README_SIMPLE.md)
2. Изучите примеры API
3. Начните разработку!

## ❌ Проблемы?

### FireFly не отвечает или показывает "namespace initializing"
- Подождите еще 1-2 минуты (первый запуск делает миграции БД)
- Проверьте логи: `docker logs kaz-firefly -f`
- Проверьте EVMConnect: `docker logs kaz-evmconnect -f`
- Убедитесь что PostgreSQL запущен: `docker ps | grep postgres`

### EVMConnect не запускается
- Проверьте что Besu работает: `docker ps | grep besu`
- Проверьте логи: `docker logs kaz-evmconnect -f`
- Перезапустите: `docker-compose -f docker-compose.simple.yml restart evmconnect`

### Порт занят
```bash
# Остановите все Docker контейнеры
docker stop $(docker ps -aq)

# Попробуйте снова
docker-compose -f docker-compose.simple.yml up -d
```

### Docker не запускается
- Убедитесь что Docker Desktop запущен
- Перезапустите Docker Desktop
- Проверьте что выделено достаточно ресурсов (Settings → Resources → Memory: 8GB+)

### Permission denied на Linux
```bash
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

---

**Нужна помощь?** Смотрите [README_SIMPLE.md](README_SIMPLE.md) для подробной информации.

