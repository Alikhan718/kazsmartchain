const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("\n========================================");
  console.log("  🔄 Restore KSC Token State");
  console.log("========================================\n");

  // Step 1: Check if contract exists
  console.log("[1/4] Checking if contract exists...");
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
    const code = await hre.ethers.provider.getCode(deploymentInfo.contractAddress);
    
    if (code === "0x" || code === "0x0") {
      console.log("   ❌ Contract does NOT exist. Need to redeploy.\n");
      deploymentInfo = null;
    } else {
      console.log("   ✅ Contract exists!\n");
    }
  } catch (error) {
    console.log("   ❌ deployment-info.json not found or error reading contract.\n");
    deploymentInfo = null;
  }

  // Step 2: Deploy contract if needed
  if (!deploymentInfo) {
    console.log("[2/4] Deploying KSC Token contract...");
    const KSCToken = await hre.ethers.getContractFactory("KSCToken");
    const initialSupply = 1000000;
    const kscToken = await KSCToken.deploy(initialSupply);
    await kscToken.waitForDeployment();
    const contractAddress = await kscToken.getAddress();
    
    const deployTx = kscToken.deploymentTransaction();
    
    deploymentInfo = {
      network: "besu",
      contractAddress: contractAddress,
      deployer: (await hre.ethers.getSigners())[0].address,
      initialSupply: initialSupply,
      deploymentBlock: deployTx?.blockNumber || null,
      transactionHash: deployTx?.hash || "",
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("   ✅ Contract deployed:", contractAddress);
    console.log("   ✅ Deployment info saved\n");
  } else {
    console.log("[2/4] Contract already deployed, skipping deployment.\n");
  }

  // Step 3: Check balances
  console.log("[3/4] Checking current balances...");
  const KSCToken = await hre.ethers.getContractFactory("KSCToken");
  const kscToken = KSCToken.attach(deploymentInfo.contractAddress);
  
  const bccAddress = "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73";
  const kaznuAddress = "0x501E66aB402b9E7b5BeE8c10fc82D4D65c8A8D8C";
  
  const bccBalance = await kscToken.balanceOf(bccAddress);
  const kaznuBalance = await kscToken.balanceOf(kaznuAddress);
  const totalSupply = await kscToken.totalSupply();
  
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "KSC");
  console.log("   BCC Balance:", hre.ethers.formatEther(bccBalance), "KSC");
  console.log("   КазНУ Balance:", hre.ethers.formatEther(kaznuBalance), "KSC\n");

  // Step 4: Mint tokens if needed
  console.log("[4/4] Minting tokens for organizations...");
  const [deployer] = await hre.ethers.getSigners();
  
  const targetBCCBalance = hre.ethers.parseEther("100000"); // 100,000 KSC
  const targetKazNUBalance = hre.ethers.parseEther("50000"); // 50,000 KSC
  
  if (bccBalance < targetBCCBalance) {
    const amountToMint = targetBCCBalance - bccBalance;
    console.log(`   🪙 Minting ${hre.ethers.formatEther(amountToMint)} KSC for BCC...`);
    const tx = await kscToken.mint(bccAddress, amountToMint);
    await tx.wait();
    console.log("   ✅ BCC tokens minted!");
  } else {
    console.log("   ✅ BCC already has sufficient balance");
  }
  
  if (kaznuBalance < targetKazNUBalance) {
    const amountToMint = targetKazNUBalance - kaznuBalance;
    console.log(`   🪙 Minting ${hre.ethers.formatEther(amountToMint)} KSC for КазНУ...`);
    const tx = await kscToken.mint(kaznuAddress, amountToMint);
    await tx.wait();
    console.log("   ✅ КазНУ tokens minted!");
  } else {
    console.log("   ✅ КазНУ already has sufficient balance");
  }

  // Final verification
  console.log("\n🔍 Final Verification:\n");
  const finalBCCBalance = await kscToken.balanceOf(bccAddress);
  const finalKazNUBalance = await kscToken.balanceOf(kaznuAddress);
  const finalTotalSupply = await kscToken.totalSupply();
  
  console.log("   Total Supply:", hre.ethers.formatEther(finalTotalSupply), "KSC");
  console.log("   BCC Balance:", hre.ethers.formatEther(finalBCCBalance), "KSC");
  console.log("   КазНУ Balance:", hre.ethers.formatEther(finalKazNUBalance), "KSC");

  console.log("\n========================================");
  console.log("  ✅ KSC Token State Restored!");
  console.log("========================================\n");
  
  console.log("📝 Next Steps:");
  console.log("   1. Register token pool in FireFly (if needed)");
  console.log("   2. Organizations can now transfer tokens via API");
  console.log("   3. Use: POST http://localhost:4000/api/tokens/transfer\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Restoration failed:");
    console.error(error);
    process.exit(1);
  });

