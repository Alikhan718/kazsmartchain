# 📊 KSC Tokenomics - Визуальная диаграмма

## 🎯 Общая архитектура токенов

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KAZSMARTCHAIN TOKEN ECOSYSTEM                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│        KSC TOKEN                 │    │      KZT-CBDC TOKEN              │
│     (Utility Token)              │    │      (Stablecoin)                │
├──────────────────────────────────┤    ├──────────────────────────────────┤
│                                  │    │                                  │
│  💨 Gas Fees                     │    │  💵 Payments                     │
│     └─ 50% burned               │    │     └─ B2B, B2G, G2C             │
│     └─ 50% to validators        │    │                                  │
│                                  │    │  💰 Settlements                 │
│  🗳️ Governance                   │    │     └─ Real-time                │
│     └─ Voting power             │    │                                  │
│     └─ Network decisions        │    │  📊 Trading                      │
│                                  │    │     └─ 1:1 with KZT            │
│  🔒 Staking                      │    │                                  │
│     └─ 5-15% APY                │    │  🏛️ Regulated                   │
│     └─ Validator staking        │    │     └─ NBK oversight            │
│                                  │    │                                  │
│  🔑 Access Control               │    │                                  │
│     └─ Premium features         │    │                                  │
│                                  │    │                                  │
│  💎 Collateral                   │    │                                  │
│     └─ Bridge collateral        │    │                                  │
│                                  │    │                                  │
└──────────────┬───────────────────┘    └──────────────┬───────────────────┘
               │                                        │
               │                                        │
               └──────────────┬─────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   BRIDGE PROTOCOL   │
                    │  (KSC ↔ KZT-CBDC)  │
                    │                     │
                    │  • Swap mechanism   │
                    │  • Rate oracle      │
                    │  • Liquidity pool   │
                    └─────────────────────┘
```

---

## 💰 Токеномика KSC - Потоки

### Эмиссия (Inflation)

```
┌─────────────────────────────────────────────────────────────┐
│                    EMISSION SOURCES                          │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Validators   │
                    │  Rewards      │
                    │  ~5-10% APY   │
                    └──────┬───────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │      KSC Token Supply            │
        │   (Controlled Inflation)         │
        └──────────────────────────────────┘
                           ▲
                           │
                    ┌──────┴───────┐
                    │              │
        ┌───────────▼───┐  ┌───────▼────────┐
        │  Staking      │  │  Governance    │
        │  Rewards      │  │  Participation │
        │  5-15% APY    │  │  0.1 KSC/vote  │
        └───────────────┘  └────────────────┘
```

### Дефляция (Deflation)

```
┌─────────────────────────────────────────────────────────────┐
│                    DEFLATION MECHANISMS                     │
└─────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────┐
        │      KSC Token Supply            │
        │   (Deflationary Pressure)         │
        └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │      Gas Fee Burning              │
        │      50% of all gas fees          │
        └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │      🔥 BURNED FOREVER            │
        │      (Reduces Total Supply)      │
        └──────────────────────────────────┘
```

### Баланс эмиссии и дефляции

```
┌─────────────────────────────────────────────────────────────┐
│              INFLATION vs DEFLATION BALANCE                  │
└─────────────────────────────────────────────────────────────┘

    EMISSION (Inflation)              DEFLATION (Burning)
    ┌─────────────────┐              ┌─────────────────┐
    │                 │              │                 │
    │ Validator: +5%  │              │ Gas Fees: -4%   │
    │ Staking:   +3%   │              │                 │
    │ Governance: +1% │              │                 │
    │                 │              │                 │
    │ Total:    +9%   │              │ Total:    -4%   │
    └────────┬────────┘              └────────┬────────┘
             │                                 │
             └─────────────┬───────────────────┘
                           │
                    ┌──────▼──────┐
                    │ NET: +5%    │
                    │ (Controlled)│
                    └─────────────┘
```

---

## 🔒 Staking Механизм

```
┌─────────────────────────────────────────────────────────────┐
│                    STAKING ECOSYSTEM                        │
└─────────────────────────────────────────────────────────────┘

    User Stakes KSC                    Validator Stakes KSC
    ┌──────────────┐                  ┌──────────────────┐
    │              │                  │                  │
    │ Min: 1,000   │                  │ Min: 100,000     │
    │ KSC          │                  │ KSC              │
    │              │                  │                  │
    │ Lock: 0-365  │                  │ Lock: Permanent  │
    │ days         │                  │ (until exit)     │
    │              │                  │                  │
    │ APY: 5-15%   │                  │ Block Rewards:   │
    │              │                  │ 1-5 KSC/block    │
    └──────┬───────┘                  └────────┬─────────┘
           │                                   │
           │                                   │
           ▼                                   ▼
    ┌──────────────────────────────────────────────┐
    │         STAKING CONTRACT                      │
    │                                               │
    │  • Tracks all stakes                         │
    │  • Calculates rewards                        │
    │  • Distributes rewards                       │
    │  • Manages validator registry                │
    └──────────────────────────────────────────────┘
           │                                   │
           │                                   │
           ▼                                   ▼
    ┌──────────────┐                  ┌──────────────────┐
    │ User Rewards │                  │ Validator Rewards│
    │ (Minted)     │                  │ (Minted)         │
    └──────────────┘                  └──────────────────┘
```

---

## 🗳️ Governance Механизм

```
┌─────────────────────────────────────────────────────────────┐
│                  GOVERNANCE WORKFLOW                         │
└─────────────────────────────────────────────────────────────┘

    Step 1: Create Proposal              Step 2: Voting Period
    ┌──────────────────┐                ┌──────────────────┐
    │                  │                │                  │
    │ Min: 100 KSC     │                │ Duration: 7 days │
    │ to propose       │                │                  │
    │                  │                │ Voting Power =   │
    │ Description:     │                │ KSC Balance      │
    │ Network changes  │                │                  │
    │                  │                │ Reward: 0.1 KSC  │
    │                  │                │ per vote         │
    └────────┬─────────┘                └────────┬─────────┘
             │                                   │
             │                                   │
             ▼                                   ▼
    ┌──────────────────────────────────────────────────┐
    │              PROPOSAL STATE                       │
    │                                                   │
    │  Votes For:    ████████████ 60%                  │
    │  Votes Against: ████████ 40%                      │
    │                                                   │
    │  Quorum: 10% of total supply                      │
    │  Status: Active                                  │
    └──────────────────────────────────────────────────┘
             │
             │
             ▼
    Step 3: Execution
    ┌──────────────────┐
    │                  │
    │ If passed:       │
    │ Execute changes  │
    │                  │
    │ If failed:       │
    │ Proposal closed  │
    │                  │
    └──────────────────┘
```

---

## 📊 Распределение токенов

```
┌─────────────────────────────────────────────────────────────┐
│            INITIAL TOKEN DISTRIBUTION (1M KSC)              │
└─────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────────┐
    │                                             │
    │  🏛️ Government Reserve: 20% (200K)         │
    │     ████████████████████                    │
    │     Vesting: 24 months                     │
    │                                             │
    │  🏦 Validator Pool: 30% (300K)             │
    │     ████████████████████████████            │
    │     Distributed to validators               │
    │                                             │
    │  🏢 Organization Grants: 25% (250K)         │
    │     ████████████████████████               │
    │     НУ: 100K, КазНУ: 50K, Others: 100K   │
    │                                             │
    │  💰 Liquidity Pool: 15% (150K)              │
    │     ████████████████                        │
    │     For KSC ↔ KZT-CBDC exchange            │
    │                                             │
    │  🔬 Development Fund: 5% (50K)               │
    │     █████                                   │
    │     Vesting: 12 months                     │
    │                                             │
    │  🎁 Community Rewards: 5% (50K)             │
    │     █████                                   │
    │     Airdrops, bounties                     │
    │                                             │
    └────────────────────────────────────────────┘
```

---

## 🔄 Годовой цикл эмиссии

```
┌─────────────────────────────────────────────────────────────┐
│              ANNUAL EMISSION CYCLE                          │
└─────────────────────────────────────────────────────────────┘

    Year Start: 1,000,000 KSC
    │
    │
    ├─ Month 1-3: Initial Distribution
    │  └─ 1,000,000 KSC distributed
    │
    ├─ Month 4-12: Ongoing Operations
    │  │
    │  ├─ Validator Rewards: +50,000 KSC (5%)
    │  ├─ Staking Rewards: +30,000 KSC (3%)
    │  ├─ Governance Rewards: +10,000 KSC (1%)
    │  │
    │  └─ Gas Fee Burning: -40,000 KSC (4%)
    │
    │
    Year End: 1,050,000 KSC
    │
    │ Net Inflation: +5%
    │
    ▼
    Next Year Cycle (Reset counters)
```

---

## 🎯 Использование KSC в экосистеме

```
┌─────────────────────────────────────────────────────────────┐
│              KSC USAGE IN ECOSYSTEM                         │
└─────────────────────────────────────────────────────────────┘

    User/Organization
    │
    ├─► Pay Gas Fees ──────────────┐
    │                               │
    ├─► Stake Tokens ───────────────┤
    │                               │
    ├─► Vote in Governance ──────────┤
    │                               │
    ├─► Access Premium Features ────┤
    │                               │
    └─► Use as Collateral ──────────┤
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   KSC Token Flow     │
                        │                       │
                        │  • Gas → 50% burned  │
                        │  • Staking → Rewards │
                        │  • Governance → Vote │
                        │  • Access → Premium  │
                        │  • Collateral → Lock  │
                        └───────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   Network Benefits    │
                        │                       │
                        │  • Security           │
                        │  • Decentralization   │
                        │  • Governance        │
                        │  • Value Accrual      │
                        └───────────────────────┘
```

---

## 📈 Прогноз развития токеномики

```
┌─────────────────────────────────────────────────────────────┐
│           TOKENOMICS EVOLUTION (5 Years)                    │
└─────────────────────────────────────────────────────────────┘

    Year 1                    Year 2                    Year 3+
    │                         │                         │
    │ Initial: 1M KSC         │ Supply: ~1.05M KSC     │ Supply: ~1.1M KSC
    │                         │                         │
    │ Inflation: 5-6%         │ Inflation: 3-5%        │ Inflation: 2-4%
    │                         │                         │
    │ Focus: Growth           │ Focus: Stability        │ Focus: Maturity
    │                         │                         │
    │ Staking: 10%            │ Staking: 20%           │ Staking: 30%
    │                         │                         │
    │ Governance: Low         │ Governance: Medium     │ Governance: High
    │                         │                         │
    ▼                         ▼                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │              MATURE TOKENOMICS                          │
    │                                                          │
    │  • Stable inflation (2-4%)                              │
    │  • High staking participation (30%+)                    │
    │  • Active governance (10%+ participation)              │
    │  • Balanced emission/deflation                           │
    │  • Strong network security                               │
    └─────────────────────────────────────────────────────────┘
```

---

**Версия:** 1.0  
**Дата:** 2025-01-XX

