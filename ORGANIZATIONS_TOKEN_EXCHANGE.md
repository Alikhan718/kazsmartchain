# 💸 Обмен токенами KSC между организациями

## 📋 Обзор

Система позволяет двум организациям обмениваться токенами KSC через:
- REST API
- Веб-интерфейс
- Прямые вызовы контракта

## 🏢 Организации

| ID | Название | Адрес | Текущий баланс |
|----|----------|-------|----------------|
| `nu` | Назарбаевский Университет (НУ) | `0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73` | 100,000 KSC |
| `kaznu` | КазНУ имени Аль-Фараби | `0x501E66aB402b9E7b5BeE8c10fc82D4D65c8A8D8C` | 50,000 KSC |

## 🚀 Использование

### 1. Через REST API

#### Перевод токенов

```bash
POST http://localhost:4000/api/tokens/transfer
Content-Type: application/json

{
  "fromOrg": "nu",
  "toOrg": "kaznu",
  "amount": 1000
}
```

**Ответ:**
```json
{
  "success": true,
  "transferId": "abc123...",
  "from": {
    "org": "nu",
    "name": "Назарбаевский Университет (НУ)",
    "address": "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73"
  },
  "to": {
    "org": "kaznu",
    "name": "КазНУ имени Аль-Фараби",
    "address": "0x501E66aB402b9E7b5BeE8c10fc82D4D65c8A8D8C"
  },
  "amount": 1000,
  "timestamp": "2025-01-XX..."
}
```

#### Проверка балансов

```bash
GET http://localhost:4000/api/tokens/balances
```

#### История транзакций

```bash
GET http://localhost:4000/api/tokens/transactions?limit=50&offset=0
```

### 2. Через веб-интерфейс

1. Откройте страницу организации:
   - НУ: http://localhost:3000/orgs/nu/tokens
   - КазНУ: http://localhost:3000/orgs/kaznu/tokens

2. Нажмите кнопку **"Transfer Tokens / Перевести токены"**

3. Заполните форму:
   - Выберите организацию-получатель
   - Введите сумму перевода

4. Подтвердите перевод

### 3. Через FireFly API (продвинутый)

```bash
POST http://localhost:5000/api/v1/namespaces/default/tokens/transfer
Content-Type: application/json

{
  "pool": "8cccb16d-913e-406c-b1d6-a1004aa5be42",
  "from": "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73", // НУ address
  "to": "0x501E66aB402b9E7b5BeE8c10fc82D4D65c8A8D8C",
  "amount": "1000",
  "key": "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73"
}
```

## 🔍 Проверка состояния

### Проверка контракта

```bash
npm run check:contract
```

### Проверка балансов

```bash
npm run check:balance
```

### Полное восстановление (если токены пропали)

```bash
npm run restore:ksc
```

## 📊 Примеры использования

### Пример 1: НУ переводит 1000 KSC в КазНУ

```bash
curl -X POST http://localhost:4000/api/tokens/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromOrg": "nu",
    "toOrg": "kaznu",
    "amount": 1000
  }'
```

### Пример 2: КазНУ переводит 500 KSC в НУ

```bash
curl -X POST http://localhost:4000/api/tokens/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromOrg": "kaznu",
    "toOrg": "nu",
    "amount": 500
  }'
```

### Пример 3: Проверка балансов после перевода

```bash
curl http://localhost:4000/api/tokens/balances | jq
```

## ⚠️ Важные замечания

1. **Баланс**: У отправителя должно быть достаточно токенов
2. **Gas**: Отправитель должен иметь ETH для оплаты газа
3. **Подтверждение**: Транзакции обрабатываются асинхронно через FireFly
4. **Мониторинг**: Используйте API для отслеживания статуса транзакций

## 🔐 Безопасность

- Все транзакции записываются в блокчейн
- История транзакций доступна через API
- Балансы проверяются перед переводом
- Ошибки валидации возвращаются с описанием

## 📈 Мониторинг

### Статистика токенов

```bash
GET http://localhost:4000/api/tokens/stats
```

**Ответ:**
```json
{
  "totalSupply": "150000.00",
  "totalMinted": "150000.00",
  "totalBurned": "0.00",
  "totalTransferred": "1000.00",
  "totalTransactions": 3,
  "mintCount": 2,
  "burnCount": 0,
  "transferCount": 1,
  "holders": 2
}
```

## 🐛 Troubleshooting

### Ошибка: "Insufficient balance"

**Причина:** У отправителя недостаточно токенов

**Решение:** Проверьте баланс через `GET /api/tokens/balances`

### Ошибка: "Transfer failed"

**Причина:** Проблема с FireFly или блокчейном

**Решение:**
1. Проверьте статус FireFly: `docker logs kaz-firefly`
2. Проверьте статус Besu: `docker logs kaz-besu`
3. Убедитесь, что контракт существует: `npm run check:contract`

### Токены не отображаются

**Причина:** Контракт был переразвернут или volumes очищены

**Решение:** Запустите `npm run restore:ksc`

## 📝 API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/tokens/balances` | Получить балансы всех организаций |
| GET | `/api/tokens/transactions` | Получить историю транзакций |
| GET | `/api/tokens/stats` | Получить статистику токенов |
| POST | `/api/tokens/transfer` | Перевести токены между организациями |

## 🎯 Следующие шаги

1. ✅ Восстановить токены (если нужно): `npm run restore:ksc`
2. ✅ Протестировать перевод через API
3. ✅ Протестировать перевод через веб-интерфейс
4. ✅ Проверить историю транзакций
5. ✅ Настроить мониторинг транзакций

---

**Готово к использованию!** 🎉

