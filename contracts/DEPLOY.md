# KSCToken Deployment Guide

## 🛡️ Security Features

✅ **OpenZeppelin Audited Contracts**
- ERC20: Standard token implementation
- ERC20Burnable: Holders can burn their tokens
- ERC20Pausable: Emergency stop mechanism
- Ownable: Owner-only administrative functions
- ERC20Permit: Gasless approvals (EIP-2612)

✅ **Access Control**
- `mint()`: Only owner can mint new tokens
- `pause()`: Only owner can pause transfers
- `unpause()`: Only owner can unpause
- `burn()`: Any holder can burn their own tokens

---

## 📋 Deployment Options

### Option A: Remix IDE (Recommended - 5 minutes)

1. **Open Remix**
   - Go to https://remix.ethereum.org

2. **Install OpenZeppelin**
   - In Remix, click "Plugin Manager"
   - Activate "Solidity Compiler"
   - File Explorer → Create new file `KSCToken.sol`
   - Copy contents from `contracts/KSCToken.sol`

3. **Compile**
   - Solidity Compiler tab
   - Compiler version: `0.8.20+`
   - Click "Compile KSCToken.sol"

4. **Deploy**
   - "Deploy & Run Transactions" tab
   - Environment: "External Http Provider"
   - Provider URL: `http://127.0.0.1:8545`
   - Contract: `KSCToken`
   - Constructor parameter: `1000000` (1 million initial supply)
   - Click "Deploy"

5. **Copy Contract Address**
   - After deployment, copy the contract address
   - Format: `0x...` (42 characters)

---

### Option B: Hardhat Script (Advanced - 15 minutes)

#### 1. Setup Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
npx hardhat init
```

#### 2. Configure Hardhat

Edit `hardhat.config.js`:

```javascript
module.exports = {
  solidity: "0.8.20",
  networks: {
    besu: {
      url: "http://localhost:8545",
      accounts: ["0x..."] // Private key
    }
  }
};
```

#### 3. Deploy Script

Create `scripts/deploy-ksc.js`:

```javascript
async function main() {
  const KSCToken = await ethers.getContractFactory("KSCToken");
  const kscToken = await KSCToken.deploy(1000000); // 1M initial supply
  await kscToken.waitForDeployment();
  console.log("KSCToken deployed to:", await kscToken.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### 4. Run Deploy

```bash
npx hardhat run scripts/deploy-ksc.js --network besu
```

---

## 🔗 Register in FireFly

After deployment, register the token pool in FireFly:

```powershell
$contractAddress = "0x..." # Your deployed contract address

$body = @{
    name = "KSC-Token"
    type = "fungible"
    symbol = "KSC"
    config = @{
        address = $contractAddress
        blockNumber = "0"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/namespaces/default/tokens/pools?publish=true" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## 🧪 Testing

### Check Balance

```javascript
// In Remix, after deployment
kscToken.balanceOf("0xYourAddress")
```

### Mint Tokens (Owner Only)

```javascript
kscToken.mint("0xRecipientAddress", "1000000000000000000") // 1 token
```

### Transfer

```javascript
kscToken.transfer("0xRecipientAddress", "1000000000000000000")
```

### Burn

```javascript
kscToken.burn("1000000000000000000") // Burn 1 token
```

---

## 🚨 Important Notes

1. **Initial Supply**: Constructor parameter is in WHOLE tokens (will be multiplied by 10^18)
2. **Decimals**: 18 (standard for ERC-20)
3. **Owner**: Deployer address becomes owner
4. **Mint Amount**: When minting via contract, use wei (with decimals)
5. **Mint via FireFly**: FireFly handles decimals automatically

---

## 📊 Contract Info

- **Name**: KazSmartChain Token
- **Symbol**: KSC
- **Decimals**: 18
- **Initial Supply**: Configurable (recommended: 1,000,000)
- **Max Supply**: Unlimited (owner can mint)
- **Burnable**: Yes (holders can burn own tokens)
- **Pausable**: Yes (owner only)

---

## 🔒 Security Recommendations

1. **Transfer Ownership**: After deployment, transfer to multi-sig wallet
2. **Pause Mechanism**: Only use in emergencies
3. **Mint Carefully**: Consider implementing max supply cap
4. **Test First**: Deploy to testnet before mainnet
5. **Audit**: Get professional audit before production

---

## 📞 Next Steps

After successful deployment:

1. ✅ Save contract address
2. ✅ Register pool in FireFly
3. ✅ Test mint operation
4. ✅ Test transfer operation
5. ✅ Update dashboards to show KSC token
6. ✅ Transfer ownership to multi-sig (production)

