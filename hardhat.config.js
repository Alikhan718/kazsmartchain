require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    besu: {
      url: "http://besu:8545",
      chainId: 1991, // ← Besu dev chain ID
      // Using default Besu dev accounts (no private key needed for dev)
      accounts: [
        // Default Besu dev account private key
        "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb7dd2d4b2b0ffb675872877"
      ]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

