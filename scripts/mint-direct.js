const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("\n========================================");
  console.log("  🪙 Direct Mint KSC Tokens (Hardhat)");
  console.log("========================================\n");

  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;

  const KSCToken = await hre.ethers.getContractFactory("KSCToken");
  const kscToken = KSCToken.attach(contractAddress);

  // Organizations (using Besu dev accounts with known private keys)
  const bccAddress = "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73";    // Dev account #1
  const kaznuAddress = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"; // Dev account #2 (changed for transfer support)

  console.log("Contract:", contractAddress);
  console.log("\n📋 Minting Plan:");
  console.log("   BCC:   100,000 KSC");
  console.log("   КазНУ:  50,000 KSC");
  console.log("   Total: 150,000 KSC\n");

  // Mint for BCC
  console.log("🏦 Minting for Банк ЦентрКредит (BCC)...");
  const mintBCC = await kscToken.mint(
    bccAddress,
    hre.ethers.parseEther("100000")
  );
  console.log("   TX:", mintBCC.hash);
  await mintBCC.wait();
  console.log("   ✅ Confirmed!\n");

  // Mint for КазНУ
  console.log("🎓 Minting for КазНУ имени Аль-Фараби...");
  const mintKazNU = await kscToken.mint(
    kaznuAddress,
    hre.ethers.parseEther("50000")
  );
  console.log("   TX:", mintKazNU.hash);
  await mintKazNU.wait();
  console.log("   ✅ Confirmed!\n");

  // Verify balances
  console.log("🔍 Verifying final balances...\n");
  
  const totalSupply = await kscToken.totalSupply();
  const bccBalance = await kscToken.balanceOf(bccAddress);
  const kaznuBalance = await kscToken.balanceOf(kaznuAddress);

  console.log("📊 Results:");
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "KSC");
  console.log("   BCC Balance:", hre.ethers.formatEther(bccBalance), "KSC");
  console.log("   КазНУ Balance:", hre.ethers.formatEther(kaznuBalance), "KSC");

  console.log("\n========================================");
  console.log("  ✅ MINTING SUCCESSFUL!");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Minting failed:");
    console.error(error);
    process.exit(1);
  });

