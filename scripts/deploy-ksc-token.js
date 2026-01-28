const hre = require("hardhat");
const axios = require("axios");

async function main() {
  console.log("\n========================================");
  console.log("  🚀 Deploying KSC Token to Besu");
  console.log("========================================\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy KSCToken
  console.log("📝 Deploying KSCToken contract...");
  const KSCToken = await hre.ethers.getContractFactory("KSCToken");
  
  // Initial supply: 1,000,000 KSC tokens
  const initialSupply = 1000000;
  const kscToken = await KSCToken.deploy(initialSupply);
  
  await kscToken.waitForDeployment();
  const contractAddress = await kscToken.getAddress();
  
  console.log("✅ KSCToken deployed to:", contractAddress);
  console.log("   Initial Supply:", initialSupply, "KSC tokens");
  console.log("   Owner:", deployer.address);
  console.log("   Decimals: 18\n");

  // Wait for a few blocks
  console.log("⏳ Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Get deployment transaction
  const deployTx = kscToken.deploymentTransaction();
  console.log("📋 Deployment Transaction:");
  console.log("   Hash:", deployTx.hash);
  console.log("   Block:", deployTx.blockNumber, "\n");

  // Verify contract state
  console.log("🔍 Verifying contract state...");
  const name = await kscToken.name();
  const symbol = await kscToken.symbol();
  const decimals = await kscToken.decimals();
  const totalSupply = await kscToken.totalSupply();
  const ownerBalance = await kscToken.balanceOf(deployer.address);
  
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals.toString());
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "KSC");
  console.log("   Owner Balance:", hre.ethers.formatEther(ownerBalance), "KSC\n");

  // Register in FireFly
  console.log("🔗 Registering token pool in FireFly...");
  const fireflyUrl = process.env.FIREFLY_BASE_URL || 'http://localhost:5000';
  const fireflyNamespace = process.env.FIREFLY_NAMESPACE || 'default';
  try {
    const response = await axios.post(
      `${fireflyUrl}/api/v1/namespaces/${fireflyNamespace}/tokens/pools?publish=true`,
      {
        name: "KSC-Token",
        type: "fungible",
        symbol: "KSC",
        config: {
          address: contractAddress,
          blockNumber: "0"
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log("✅ Token pool registered in FireFly!");
    console.log("   Pool ID:", response.data.id);
    console.log("   Pool Name:", response.data.name);
    console.log("   Connector:", response.data.connector, "\n");
  } catch (error) {
    console.error("⚠️  Warning: Could not register in FireFly");
    console.error("   Error:", error.response?.data?.error || error.message);
    console.error("   You can register manually later.\n");
  }

  // Save deployment info
  const deploymentInfo = {
    network: "besu",
    contractAddress: contractAddress,
    deployer: deployer.address,
    initialSupply: initialSupply,
    deploymentBlock: deployTx.blockNumber,
    transactionHash: deployTx.hash,
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to: deployment-info.json\n");

  console.log("========================================");
  console.log("  ✅ DEPLOYMENT SUCCESSFUL!");
  console.log("========================================\n");
  
  console.log("📝 Next Steps:");
  console.log("   1. Test minting: npm run test:ksc");
  console.log("   2. Update dashboards with contract address");
  console.log("   3. Transfer ownership to multi-sig (production)\n");
  
  console.log("🔑 Contract Address (save this!):");
  console.log("   " + contractAddress + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

