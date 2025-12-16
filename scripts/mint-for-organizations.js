const hre = require("hardhat");
const axios = require("axios");
const fs = require('fs');

async function main() {
  console.log("\n========================================");
  console.log("  🪙 Minting KSC Tokens for Organizations");
  console.log("========================================\n");

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  const poolId = "8cccb16d-913e-406c-b1d6-a1004aa5be42";
  
  // Organization wallets (we'll use different addresses for each org)
  const organizations = {
    nu: {
      name: "Назарбаевский Университет (НУ)",
      address: hre.ethers.getAddress("0xfe3b557e8fb62b89f4916b721be55ceb828dbd73"), // Owner address
      amount: "100000" // 100,000 KSC
    },
    kaznu: {
      name: "КазНУ имени Аль-Фараби",
      address: hre.ethers.getAddress("0x501e66ab402b9e7b5bee8c10fc82d4d65c8a8d8c"), // Different address (checksummed)
      amount: "50000" // 50,000 KSC
    }
  };

  const [deployer] = await hre.ethers.getSigners();
  const signingKey = deployer.address.toLowerCase();

  console.log("Pool ID:", poolId);
  console.log("Signing Key:", signingKey, "\n");

  // Mint for each organization
  for (const [orgId, org] of Object.entries(organizations)) {
    console.log(`🏦 ${org.name}`);
    console.log(`   Address: ${org.address}`);
    console.log(`   Amount: ${org.amount} KSC`);
    
    try {
      // Send ETH to organization address if not owner
      if (org.address.toLowerCase() !== signingKey) {
        console.log(`   💰 Sending ETH for gas...`);
        const ethTx = await deployer.sendTransaction({
          to: org.address,
          value: hre.ethers.parseEther("1.0")
        });
        await ethTx.wait();
        console.log(`   ✅ Sent 1 ETH for gas`);
      }

      // Mint tokens via FireFly
      console.log(`   🪙 Minting tokens via FireFly...`);
      const response = await axios.post(
        'http://localhost:5000/api/v1/namespaces/default/tokens/mint',
        {
          pool: poolId,
          to: org.address,
          amount: org.amount,
          key: signingKey
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log(`   ✅ Mint initiated!`);
      console.log(`   TX ID: ${response.data.localId}`);
      console.log();
    } catch (error) {
      console.error(`   ❌ Failed to mint for ${org.name}`);
      console.error(`   Error:`, error.response?.data?.error || error.message);
      console.log();
    }
  }

  // Wait for confirmations
  console.log("⏳ Waiting for blockchain confirmations (10 seconds)...\n");
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Check balances via contract
  console.log("🔍 Verifying Balances via Smart Contract:\n");
  
  const KSCToken = await hre.ethers.getContractFactory("KSCToken");
  const kscToken = KSCToken.attach(deploymentInfo.contractAddress);

  for (const [orgId, org] of Object.entries(organizations)) {
    const balance = await kscToken.balanceOf(org.address);
    console.log(`${org.name}:`);
    console.log(`   Balance: ${hre.ethers.formatEther(balance)} KSC\n`);
  }

  // Check via FireFly API
  console.log("🔍 Checking FireFly Token Accounts:\n");
  
  try {
    const accountsResponse = await axios.get(
      'http://localhost:5000/api/v1/namespaces/default/tokens/accounts'
    );
    
    console.log(`Found ${accountsResponse.data.length} token accounts:\n`);
    
    for (const account of accountsResponse.data) {
      const org = Object.values(organizations).find(
        o => o.address.toLowerCase() === account.key.toLowerCase()
      );
      if (org) {
        console.log(`${org.name} (${account.key}):`);
        // Note: FireFly accounts endpoint might not show balance directly
        console.log(`   Account registered ✓\n`);
      }
    }
  } catch (error) {
    console.log("⚠️  Could not fetch FireFly accounts");
  }

  // Get recent transactions
  console.log("📊 Recent Transactions:\n");
  
  try {
    const txResponse = await axios.get(
      'http://localhost:5000/api/v1/namespaces/default/tokens/transfers?limit=10'
    );
    
    if (txResponse.data && txResponse.data.length > 0) {
      txResponse.data.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.type} - Amount: ${tx.amount || 'N/A'}`);
        console.log(`   From: ${tx.from || 'N/A'}`);
        console.log(`   To: ${tx.to || 'N/A'}`);
        console.log(`   TX: ${tx.localId}\n`);
      });
    } else {
      console.log("No transactions found yet.\n");
    }
  } catch (error) {
    console.log("⚠️  Could not fetch transactions");
  }

  console.log("========================================");
  console.log("  ✅ MINTING COMPLETE!");
  console.log("========================================\n");
  
  console.log("📝 Summary:");
  console.log(`   • НУ: ${organizations.nu.amount} KSC`);
  console.log(`   • КазНУ: ${organizations.kaznu.amount} KSC`);
  console.log(`   • Total Minted: ${parseInt(organizations.nu.amount) + parseInt(organizations.kaznu.amount)} KSC\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Minting failed:");
    console.error(error);
    process.exit(1);
  });

