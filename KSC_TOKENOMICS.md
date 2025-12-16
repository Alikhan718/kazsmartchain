# 💰 KSC Token - Токеномика и Экономическая Модель

## 📋 Содержание
1. [Роль KSC в суверенном блокчейне](#роль-ksc-в-суверенном-блокчейне)
2. [Архитектура токенов: KSC vs Денежный токен](#архитектура-токенов-ksc-vs-денежный-токен)
3. [Токеномика KSC](#токеномика-ksc)
4. [Механизмы использования](#механизмы-использования)
5. [Распределение токенов](#распределение-токенов)
6. [Эмиссия и дефляция](#эмиссия-и-дефляция)
7. [План реализации](#план-реализации)

---

## 🎯 Роль KSC в суверенном блокчейне

### Основная концепция

**KSC Token** — это **утилитарный токен** (Utility Token) для управления и функционирования экосистемы KazSmartChain. Он НЕ является денежным средством, а выполняет следующие функции:

### 1. **Gas Fee Token** (Токен для оплаты комиссий)
- Оплата транзакций в сети KazSmartChain
- Оплата выполнения смарт-контрактов
- Оплата хранения данных в IPFS
- Оплата кросс-чейн операций

### 2. **Governance Token** (Токен управления)
- Голосование по предложениям развития сети
- Управление параметрами консенсуса
- Решения о добавлении/удалении валидаторов
- Изменение параметров сети (gas price, block time)

### 3. **Staking Token** (Токен для стейкинга)
- Стейкинг для валидаторов
- Стейкинг для участия в консенсусе
- Получение вознаграждений за валидацию блоков
- Делегированный стейкинг

### 4. **Collateral Token** (Залоговый токен)
- Залог для кросс-чейн мостов
- Залог для деривативов и смарт-контрактов
- Залог для получения кредитов в экосистеме

### 5. **Access Token** (Токен доступа)
- Доступ к премиум-функциям платформы
- Доступ к расширенной аналитике
- Приоритетная обработка транзакций
- Доступ к приватным группам

---

## 🏦 Архитектура токенов: KSC vs Денежный токен

### ✅ Рекомендация: **Двухуровневая система токенов**

```
┌─────────────────────────────────────────────────────────┐
│           KAZSMARTCHAIN TOKEN ARCHITECTURE              │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   KSC Token          │         │   KZT-CBDC Token     │
│   (Utility Token)    │         │   (Stablecoin)       │
├──────────────────────┤         ├──────────────────────┤
│ • Gas fees           │         │ • Платежи            │
│ • Governance         │         │ • Расчеты            │
│ • Staking            │         │ • Торговля           │
│ • Access control     │         │ • 1:1 с тенге        │
│ • Collateral         │         │ • Регулируемый       │
└──────────────────────┘         └──────────────────────┘
         │                                  │
         └──────────┬───────────────────────┘
                    │
         ┌──────────▼──────────┐
         │   Bridge Protocol   │
         │   (KSC ↔ KZT-CBDC)  │
         └─────────────────────┘
```

### Почему два токена?

#### **KSC Token** (Utility)
- ✅ **Не является денежным средством** — избегает регуляторных проблем
- ✅ **Фокус на функциональности** — управление сетью, доступ, стейкинг
- ✅ **Стабильность не критична** — может колебаться в цене
- ✅ **Децентрализованное управление** — через governance

#### **KZT-CBDC Token** (Stablecoin)
- ✅ **Денежное средство** — для реальных платежей и расчетов
- ✅ **Стабильность 1:1 с тенге** — предсказуемость для бизнеса
- ✅ **Регулируемый** — контроль со стороны НБ РК
- ✅ **Для коммерческих операций** — B2B, B2G, G2C платежи

### Взаимодействие токенов

1. **Пользователи покупают KSC** для использования сети (gas, staking, governance)
2. **Для платежей используют KZT-CBDC** (стабильная стоимость)
3. **Bridge позволяет конвертировать** KSC ↔ KZT-CBDC при необходимости
4. **KSC можно заработать** через стейкинг и валидацию

---

## 💎 Токеномика KSC

### Общие параметры

```
┌─────────────────────────────────────────────────────┐
│              KSC TOKEN SPECIFICATIONS                │
├─────────────────────────────────────────────────────┤
│ Symbol:                    KSC                      │
│ Name:                     KazSmartChain Token       │
│ Decimals:                 18                        │
│ Standard:                 ERC-20 + Extensions       │
│ Initial Supply:          1,000,000 KSC              │
│ Max Supply:              Unlimited (controlled)     │
│ Inflation Rate:          Variable (governance)      │
│ Deflation Mechanism:     Burn on gas fees          │
└─────────────────────────────────────────────────────┘
```

### Распределение токенов (Initial Allocation)

```
┌─────────────────────────────────────────────────────┐
│         INITIAL TOKEN DISTRIBUTION                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🏛️  Government Reserve:        20% (200,000 KSC)    │
│      └─ Для развития инфраструктуры                 │
│                                                      │
│  🏦  Validator Pool:            30% (300,000 KSC)   │
│      └─ Распределение между валидаторами            │
│                                                      │
│  🏢  Organization Grants:        25% (250,000 KSC)    │
│      └─ НУ, КазНУ, другие организации              │
│                                                      │
│  💰  Liquidity Pool:            15% (150,000 KSC)   │
│      └─ Для обмена KSC ↔ KZT-CBDC                  │
│                                                      │
│  🔬  Development Fund:           5% (50,000 KSC)    │
│      └─ Разработка и улучшения                      │
│                                                      │
│  🎁  Community Rewards:         5% (50,000 KSC)    │
│      └─ Airdrops, баунти, программы                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Механизмы эмиссии

#### 1. **Validator Rewards** (Вознаграждения валидаторам)
```
Механизм: Новые токены минтируются за валидацию блоков
Частота: Каждый блок
Формула: Block Reward = Base Reward × (1 + Staking Bonus)
Годовая эмиссия: ~5-10% от текущего supply (governance)
```

#### 2. **Staking Rewards** (Вознаграждения за стейкинг)
```
Механизм: Проценты за заблокированные токены
APY: 5-15% (зависит от общего стейка)
Минимальный стейк: 1,000 KSC
Период блокировки: 30-365 дней (опционально)
```

#### 3. **Governance Participation** (Участие в управлении)
```
Механизм: Вознаграждения за активное голосование
Размер: 0.1-1 KSC за голосование
Цель: Стимулировать участие в governance
```

### Механизмы дефляции (сжигания)

#### 1. **Gas Fee Burning**
```
Механизм: Часть gas fees сжигается (не возвращается)
Процент: 50% от всех gas fees
Цель: Контроль инфляции, дефляционное давление
```

#### 2. **Transaction Fee Burning**
```
Механизм: Сжигание при определенных операциях
Типы: Cross-chain transfers, NFT minting, Contract deployment
Процент: 1-5% от суммы транзакции
```

#### 3. **Voluntary Burning**
```
Механизм: Пользователи могут сжигать свои токены
Использование: Снижение supply, демонстрация приверженности
```

---

## 🔧 Механизмы использования

### 1. Gas Fee Payment

```solidity
// Псевдокод механизма оплаты gas
function executeTransaction(bytes calldata data) external {
    uint256 gasCost = calculateGasCost(data);
    uint256 kscRequired = gasCost * gasPrice; // в KSC
    
    // Сжигаем 50% от gas fee
    uint256 burnAmount = kscRequired / 2;
    kscToken.burn(burnAmount);
    
    // Остальное идет валидаторам
    distributeToValidators(kscRequired - burnAmount);
    
    // Выполняем транзакцию
    execute(data);
}
```

**Параметры:**
- Base Gas Price: 1 Gwei (в KSC)
- Dynamic Gas Price: Зависит от загрузки сети
- Burn Rate: 50% от всех gas fees

### 2. Staking Mechanism

```solidity
// Псевдокод стейкинга
contract KSCStaking {
    struct Stake {
        uint256 amount;
        uint256 lockPeriod;
        uint256 startTime;
        uint256 rewards;
    }
    
    mapping(address => Stake) public stakes;
    
    function stake(uint256 amount, uint256 lockDays) external {
        kscToken.transferFrom(msg.sender, address(this), amount);
        stakes[msg.sender] = Stake({
            amount: amount,
            lockPeriod: lockDays * 1 days,
            startTime: block.timestamp,
            rewards: 0
        });
    }
    
    function calculateRewards(address staker) public view returns (uint256) {
        Stake memory s = stakes[staker];
        uint256 stakedTime = block.timestamp - s.startTime;
        uint256 apy = getAPY(); // 5-15%
        return s.amount * apy * stakedTime / (365 days * 100);
    }
}
```

**Параметры:**
- Минимальный стейк: 1,000 KSC
- APY: 5-15% (зависит от общего стейка)
- Период блокировки: 30-365 дней (опционально)
- Комиссия за досрочный вывод: 10%

### 3. Governance Mechanism

```solidity
// Псевдокод governance
contract KSCGovernance {
    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    function vote(uint256 proposalId, bool support) external {
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        uint256 votingPower = kscToken.balanceOf(msg.sender);
        
        if (support) {
            proposals[proposalId].votesFor += votingPower;
        } else {
            proposals[proposalId].votesAgainst += votingPower;
        }
        
        hasVoted[proposalId][msg.sender] = true;
        
        // Вознаграждение за участие
        kscToken.mint(msg.sender, 0.1 ether); // 0.1 KSC
    }
}
```

**Параметры:**
- Минимальный баланс для голосования: 100 KSC
- Время голосования: 7 дней
- Кворум: 10% от общего supply
- Вознаграждение за голосование: 0.1 KSC

### 4. Validator Staking

```solidity
// Псевдокод валидаторского стейкинга
contract ValidatorStaking {
    struct Validator {
        address validatorAddress;
        uint256 stakedAmount;
        uint256 totalRewards;
        bool active;
    }
    
    mapping(address => Validator) public validators;
    uint256 public constant MIN_VALIDATOR_STAKE = 100000 * 1e18; // 100,000 KSC
    
    function becomeValidator() external {
        require(kscToken.balanceOf(msg.sender) >= MIN_VALIDATOR_STAKE, "Insufficient stake");
        kscToken.transferFrom(msg.sender, address(this), MIN_VALIDATOR_STAKE);
        
        validators[msg.sender] = Validator({
            validatorAddress: msg.sender,
            stakedAmount: MIN_VALIDATOR_STAKE,
            totalRewards: 0,
            active: true
        });
    }
    
    function distributeBlockReward(address validator) external onlyConsensus {
        uint256 blockReward = calculateBlockReward();
        validators[validator].totalRewards += blockReward;
        kscToken.mint(validator, blockReward);
    }
}
```

**Параметры:**
- Минимальный стейк валидатора: 100,000 KSC
- Block Reward: 1-5 KSC (зависит от governance)
- Slashing: 1-10% при нарушении консенсуса

---

## 📊 Распределение токенов

### Фазы распределения

#### **Фаза 1: Initial Distribution (Месяц 1-3)**
```
Government Reserve:     200,000 KSC (vesting: 24 месяца)
Validator Pool:         300,000 KSC (распределение по валидаторам)
Organization Grants:    250,000 KSC (НУ: 100K, КазНУ: 50K, другие: 100K)
Liquidity Pool:         150,000 KSC (сразу)
Development Fund:        50,000 KSC (vesting: 12 месяцев)
Community Rewards:       50,000 KSC (airdrops в течение года)
```

#### **Фаза 2: Validator Rewards (Постоянно)**
```
Ежедневная эмиссия:     ~137-274 KSC/день (5-10% годовых)
Распределение:          Пропорционально стейку валидаторов
```

#### **Фаза 3: Staking Rewards (Постоянно)**
```
Источник:               Часть валидаторских наград
APY:                    5-15%
Распределение:          Пропорционально стейку пользователей
```

### Vesting Schedule

```
┌─────────────────────────────────────────────────────┐
│              VESTING SCHEDULE                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Government Reserve (200K):                         │
│  └─ 24 месяца линейного разблокирования            │
│     ~8,333 KSC/месяц                                │
│                                                      │
│  Development Fund (50K):                            │
│  └─ 12 месяцев линейного разблокирования           │
│     ~4,167 KSC/месяц                                │
│                                                      │
│  Organization Grants (250K):                         │
│  └─ Немедленно (для активного использования)        │
│                                                      │
│  Validator Pool (300K):                              │
│  └─ Распределение при запуске валидаторов          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Эмиссия и дефляция

### Модель эмиссии

```
Годовая инфляция = Validator Rewards + Staking Rewards - Burned Tokens

Пример расчета (Year 1):
- Начальный supply: 1,000,000 KSC
- Validator Rewards: 50,000 KSC (5%)
- Staking Rewards: 30,000 KSC (3%)
- Burned Tokens: 40,000 KSC (4%)
- Чистая инфляция: 40,000 KSC (4%)
- Конечный supply: 1,040,000 KSC
```

### Целевая инфляция

```
Год 1:  4-6% (стимулирование роста)
Год 2:  3-5% (стабилизация)
Год 3+: 2-4% (долгосрочная стабильность)
```

### Механизмы контроля

1. **Governance Voting** — изменение параметров эмиссии
2. **Dynamic Burn Rate** — увеличение процента сжигания при высокой активности
3. **Validator Slashing** — штрафы снижают эмиссию
4. **Staking Requirements** — минимальные требования для получения наград

---

## 🚀 План реализации

### Этап 1: Базовая токеномика (Месяц 1-2)

- [ ] Обновить контракт KSC Token с новыми функциями
- [ ] Реализовать механизм сжигания gas fees
- [ ] Создать Staking контракт
- [ ] Реализовать базовый Governance
- [ ] Настроить распределение токенов

### Этап 2: Расширенная функциональность (Месяц 3-4)

- [ ] Validator Staking контракт
- [ ] Механизм распределения наград валидаторам
- [ ] Governance UI в дашборде
- [ ] Staking UI в дашборде
- [ ] Аналитика токеномики

### Этап 3: Интеграция с KZT-CBDC (Месяц 5-6)

- [ ] Разработка KZT-CBDC токена
- [ ] Bridge контракт KSC ↔ KZT-CBDC
- [ ] Интеграция с НБ РК (если возможно)
- [ ] Тестирование обмена токенов

### Этап 4: Оптимизация и масштабирование (Месяц 7+)

- [ ] Оптимизация gas costs
- [ ] Улучшение механизмов дефляции
- [ ] Расширенная аналитика
- [ ] Документация для пользователей

---

## 📈 Метрики успеха

### Ключевые показатели (KPIs)

1. **Adoption Metrics**
   - Количество активных держателей KSC
   - Количество стейкеров
   - Количество участников governance

2. **Economic Metrics**
   - Общий стейк (Total Staked)
   - Ежедневный объем транзакций
   - Процент сожженных токенов
   - Соотношение эмиссии/дефляции

3. **Network Metrics**
   - Количество валидаторов
   - Время блока
   - Gas price динамика
   - Успешность транзакций

---

## 🎯 Выводы и рекомендации

### ✅ KSC Token должен оставаться Utility Token

**Причины:**
1. Избежание регуляторных проблем (не является денежным средством)
2. Фокус на функциональности сети
3. Гибкость в управлении через governance
4. Возможность интеграции с CBDC через bridge

### ✅ Создать отдельный KZT-CBDC Token

**Причины:**
1. Для реальных платежей нужна стабильность
2. Регулируемость со стороны НБ РК
3. Разделение ответственности (utility vs money)
4. Соответствие международным стандартам CBDC

### ✅ Токеномика должна быть сбалансированной

**Принципы:**
1. Контролируемая инфляция (2-6% в год)
2. Механизмы дефляции (burning)
3. Стимулирование долгосрочного стейкинга
4. Активное участие в governance

---

**Версия документа:** 1.0  
**Дата создания:** 2025-01-XX  
**Автор:** KazSmartChain Team

