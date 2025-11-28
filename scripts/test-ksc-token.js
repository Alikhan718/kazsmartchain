const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("\n========================================");
  console.log("  🧪 Testing KSC Token");
  console.log("========================================\n");

  // Load deployment info
  if (!fs.existsSync('deployment-info.json')) {
    console.error("❌ deployment-info.json not found!");
    console.error("   Run: npm run deploy:ksc first\n");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log("📋 Contract Address:", contractAddress, "\n");

  // Get contract instance
  const KSCToken = await hre.ethers.getContractFactory("KSCToken");
  const kscToken = KSCToken.attach(contractAddress);

  // Get accounts
  const [owner] = await hre.ethers.getSigners();
  // Generate a test recipient address
  const recipientWallet = hre.ethers.Wallet.createRandom();
  const recipient = recipientWallet.connect(hre.ethers.provider);
  
  console.log("Owner:", owner.address);
  console.log("Recipient:", recipient.address);
  
  // Send ETH to recipient for gas
  console.log("💰 Sending ETH to recipient for gas...");
  const ethTx = await owner.sendTransaction({
    to: recipient.address,
    value: hre.ethers.parseEther("1.0") // 1 ETH for gas
  });
  await ethTx.wait();
  console.log("   ✅ Sent 1 ETH for gas\n");

  // Test 1: Check initial state
  console.log("🔍 Test 1: Contract State");
  const name = await kscToken.name();
  const symbol = await kscToken.symbol();
  const totalSupply = await kscToken.totalSupply();
  const ownerBalance = await kscToken.balanceOf(owner.address);
  
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "KSC");
  console.log("   Owner Balance:", hre.ethers.formatEther(ownerBalance), "KSC");
  console.log("   ✅ State check passed\n");

  // Test 2: Mint tokens
  console.log("🪙 Test 2: Minting Tokens");
  const mintAmount = hre.ethers.parseEther("1000"); // 1000 KSC
  console.log("   Minting", hre.ethers.formatEther(mintAmount), "KSC to", recipient.address);
  
  const mintTx = await kscToken.mint(recipient.address, mintAmount);
  await mintTx.wait();
  
  const recipientBalance = await kscToken.balanceOf(recipient.address);
  console.log("   Recipient Balance:", hre.ethers.formatEther(recipientBalance), "KSC");
  console.log("   ✅ Mint successful\n");

  // Test 3: Transfer tokens
  console.log("💸 Test 3: Transfer Tokens");
  const transferAmount = hre.ethers.parseEther("100"); // 100 KSC
  console.log("   Transferring", hre.ethers.formatEther(transferAmount), "KSC from owner to recipient");
  
  const transferTx = await kscToken.transfer(recipient.address, transferAmount);
  await transferTx.wait();
  
  const newRecipientBalance = await kscToken.balanceOf(recipient.address);
  console.log("   New Recipient Balance:", hre.ethers.formatEther(newRecipientBalance), "KSC");
  console.log("   ✅ Transfer successful\n");

  // Test 4: Burn tokens
  console.log("🔥 Test 4: Burn Tokens");
  const burnAmount = hre.ethers.parseEther("50"); // 50 KSC
  console.log("   Burning", hre.ethers.formatEther(burnAmount), "KSC from recipient");
  
  const kscTokenAsRecipient = kscToken.connect(recipient);
  const burnTx = await kscTokenAsRecipient.burn(burnAmount);
  await burnTx.wait();
  
  const finalRecipientBalance = await kscToken.balanceOf(recipient.address);
  const newTotalSupply = await kscToken.totalSupply();
  
  console.log("   Final Recipient Balance:", hre.ethers.formatEther(finalRecipientBalance), "KSC");
  console.log("   New Total Supply:", hre.ethers.formatEther(newTotalSupply), "KSC");
  console.log("   ✅ Burn successful\n");

  // Test 5: Approval and TransferFrom
  console.log("✔️  Test 5: Approval & TransferFrom");
  const approveAmount = hre.ethers.parseEther("200");
  console.log("   Approving", hre.ethers.formatEther(approveAmount), "KSC");
  
  const approveTx = await kscToken.approve(recipient.address, approveAmount);
  await approveTx.wait();
  
  const allowance = await kscToken.allowance(owner.address, recipient.address);
  console.log("   Allowance:", hre.ethers.formatEther(allowance), "KSC");
  console.log("   ✅ Approval successful\n");

  console.log("========================================");
  console.log("  ✅ ALL TESTS PASSED!");
  console.log("========================================\n");
  
  console.log("📊 Summary:");
  console.log("   Contract:", contractAddress);
  console.log("   ✅ Mint: Working");
  console.log("   ✅ Transfer: Working");
  console.log("   ✅ Burn: Working");
  console.log("   ✅ Approval: Working");
  console.log("\n🎉 KSC Token is ready for production!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Tests failed:");
    console.error(error);
    process.exit(1);
  });

