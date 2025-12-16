const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("\n========================================");
  console.log("  💸 Transfer KSC Tokens Between Organizations");
  console.log("========================================\n");

  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log("Usage: node scripts/transfer-between-orgs.js <from> <to> <amount>");
    console.log("\nExamples:");
    console.log("  Transfer from НУ to КазНУ: node scripts/transfer-between-orgs.js nu kaznu 1000");
    console.log("  Transfer from КазНУ to НУ: node scripts/transfer-between-orgs.js kaznu nu 500");
    console.log("\nOrganizations:");
    console.log("  nu    - Назарбаевский Университет (0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73)");
    console.log("  kaznu - КазНУ имени Аль-Фараби (0x501E66aB402b9E7b5BeE8c10fc82D4D65c8A8D8C)");
    process.exit(1);
  }

  const [fromOrg, toOrg, amountStr] = args;

  // Organization mapping
  const organizations = {
    nu: {
      name: 'Назарбаевский Университет (НУ)',
      address: '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73',
    },
    kaznu: {
      name: 'КазНУ имени Аль-Фараби',
      address: '0x501E66aB402b9E7b5BeE8c10fc82D4D65c8A8D8C',
    },
  };

  if (!organizations[fromOrg] || !organizations[toOrg]) {
    console.error("❌ Invalid organization. Use 'nu' or 'kaznu'");
    process.exit(1);
  }

  if (fromOrg === toOrg) {
    console.error("❌ Cannot transfer to the same organization");
    process.exit(1);
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    console.error("❌ Invalid amount. Must be a positive number");
    process.exit(1);
  }

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Contract:", contractAddress);
  console.log("\n📋 Transfer Details:");
  console.log(`   From: ${organizations[fromOrg].name}`);
  console.log(`   To:   ${organizations[toOrg].name}`);
  console.log(`   Amount: ${amount} KSC\n`);

  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Attach to contract
  const KSCToken = await hre.ethers.getContractFactory("KSCToken");
  const kscToken = KSCToken.attach(contractAddress);

  // Check balances before transfer
  const fromAddress = organizations[fromOrg].address;
  const toAddress = organizations[toOrg].address;
  
  const fromBalance = await kscToken.balanceOf(fromAddress);
  const fromBalanceFormatted = hre.ethers.formatEther(fromBalance);
  
  console.log(`\n💰 ${organizations[fromOrg].name} Balance: ${fromBalanceFormatted} KSC`);
  
  if (parseFloat(fromBalanceFormatted) < amount) {
    console.error(`\n❌ Insufficient balance! ${organizations[fromOrg].name} has only ${fromBalanceFormatted} KSC`);
    process.exit(1);
  }

  // Check if deployer has permission to transfer on behalf
  // We need to use transferFrom, which requires approval first
  // Or we can use a signer that controls the from address
  
  // For simplicity, we'll use the deployer account to send ETH to from address
  // and then use that account to transfer
  // But actually, we need the private key for the from address
  
  // Alternative: Use deployer to transfer if deployer owns the tokens
  // Or: Send transaction from the from address if we have its private key
  
  // For now, let's check if deployer can transfer
  // Actually, the best approach is to use FireFly API for transfers
  // But for direct contract calls, we need the private key of the sender
  
  console.log("\n⚠️  Direct contract transfer requires the private key of the sender.");
  console.log("   For production, use FireFly API or ensure sender has ETH for gas.\n");
  
  // Try to transfer using deployer (if deployer has tokens)
  // Or we need to use a different approach
  
  // Actually, let's check if we can use deployer to send a transaction
  // that calls transferFrom, but we'd need approval first
  
  // For now, let's use a simpler approach: use deployer to send ETH to from address
  // and then use a signer for that address
  
  // Better: Use FireFly API for transfers (recommended)
  console.log("💡 Recommended: Use FireFly API for transfers:");
  console.log(`   POST http://localhost:5000/api/v1/namespaces/default/tokens/transfer`);
  console.log(`   Body: {`);
  console.log(`     "pool": "8cccb16d-913e-406c-b1d6-a1004aa5be42",`);
  console.log(`     "from": "${fromAddress}",`);
  console.log(`     "to": "${toAddress}",`);
  console.log(`     "amount": "${amount}",`);
  console.log(`     "key": "${fromAddress}"`);
  console.log(`   }`);
  console.log("\n   Or use the API endpoint:");
  console.log(`   POST http://localhost:4000/api/tokens/transfer`);
  console.log(`   Body: {`);
  console.log(`     "fromOrg": "${fromOrg}",`);
  console.log(`     "toOrg": "${toOrg}",`);
  console.log(`     "amount": ${amount}`);
  console.log(`   }`);
  
  // For direct contract call, we'd need the private key
  // Let's create an API endpoint instead
  
  console.log("\n========================================");
  console.log("  ℹ️  Use API endpoint for transfers");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Transfer failed:");
    console.error(error);
    process.exit(1);
  });

