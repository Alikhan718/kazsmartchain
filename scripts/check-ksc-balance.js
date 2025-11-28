const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;
  
  const KSCToken = await hre.ethers.getContractFactory("KSCToken");
  const kscToken = KSCToken.attach(contractAddress);

  const [owner] = await hre.ethers.getSigners();
  
  console.log("\n========================================");
  console.log("  💰 KSC Token Balances");
  console.log("========================================\n");
  
  const totalSupply = await kscToken.totalSupply();
  const ownerBalance = await kscToken.balanceOf(owner.address);
  
  // Organization addresses
  const bccAddress = "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73";
  const kaznuAddress = "0x501E66aB402b9E7b5BeE8c10fc82D4D65c8A8D8C";
  
  const bccBalance = await kscToken.balanceOf(bccAddress);
  const kaznuBalance = await kscToken.balanceOf(kaznuAddress);
  
  console.log("Contract:", contractAddress);
  console.log("\n📊 Token Supply:");
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "KSC");
  
  console.log("\n🏦 Organizations:");
  console.log("   BCC Balance:", hre.ethers.formatEther(bccBalance), "KSC");
  console.log("   КазНУ Balance:", hre.ethers.formatEther(kaznuBalance), "KSC\n");
}

main().catch(console.error);

