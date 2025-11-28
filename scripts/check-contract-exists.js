const hre = require("hardhat");

async function main() {
  console.log("\n========================================");
  console.log("  🔍 Checking KSC Token Contract");
  console.log("========================================\n");

  const fs = require('fs');
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  } catch (error) {
    console.log("❌ deployment-info.json not found. Contract needs to be deployed.\n");
    process.exit(1);
  }

  const contractAddress = deploymentInfo.contractAddress;
  console.log("Contract Address:", contractAddress);
  console.log("Network:", deploymentInfo.network);
  console.log("");

  try {
    // Try to get contract code
    const code = await hre.ethers.provider.getCode(contractAddress);
    
    if (code === "0x" || code === "0x0") {
      console.log("❌ Contract does NOT exist at this address!");
      console.log("   The blockchain was likely reset (volumes cleared).");
      console.log("   You need to redeploy the contract.\n");
      console.log("   Run: npm run deploy:ksc\n");
      return false;
    } else {
      console.log("✅ Contract EXISTS at this address!");
      console.log("   Code length:", code.length, "bytes");
      
      // Try to get total supply
      try {
        const KSCToken = await hre.ethers.getContractFactory("KSCToken");
        const kscToken = KSCToken.attach(contractAddress);
        const totalSupply = await kscToken.totalSupply();
        console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "KSC");
        
        // Check organization balances
        const bccAddress = "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73";
        const kaznuAddress = "0x501E66aB402b9E7b5BeE8c10fc82D4D65c8A8D8C";
        
        const bccBalance = await kscToken.balanceOf(bccAddress);
        const kaznuBalance = await kscToken.balanceOf(kaznuAddress);
        
        console.log("\n📊 Current Balances:");
        console.log("   BCC:", hre.ethers.formatEther(bccBalance), "KSC");
        console.log("   КазНУ:", hre.ethers.formatEther(kaznuBalance), "KSC");
        
        if (bccBalance === 0n && kaznuBalance === 0n) {
          console.log("\n⚠️  No tokens minted yet. Run: npm run mint:direct\n");
        }
        
        return true;
      } catch (error) {
        console.log("   ⚠️  Could not read contract state:", error.message);
        return true; // Contract exists but might have issues
      }
    }
  } catch (error) {
    console.log("❌ Error checking contract:", error.message);
    console.log("   Make sure Besu is running: docker-compose -f docker-compose.simple.yml up -d besu\n");
    return false;
  }
}

main()
  .then((exists) => {
    process.exit(exists ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });

