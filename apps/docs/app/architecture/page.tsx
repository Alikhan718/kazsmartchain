export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Technical Architecture</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Understanding KazSmartChain's technical infrastructure
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Architecture Overview</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain is built on a robust, multi-layered architecture combining enterprise-grade 
          blockchain technology with modern infrastructure components.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Core Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Hyperledger Besu</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ethereum-compatible blockchain client providing the core consensus and transaction processing layer.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Hyperledger FireFly</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Multi-party system for enterprise data flows, providing APIs and SDKs for blockchain interactions.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">EVMConnect</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connector service enabling FireFly to interact with EVM-compatible blockchains like Besu.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">IPFS</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Decentralized storage layer for off-chain data, certificates, and documents.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Network Infrastructure</h2>
        <p className="text-gray-700 dark:text-gray-300">
          The network consists of validator nodes that maintain consensus, API nodes for client interactions, 
          and storage nodes for IPFS data. This distributed architecture ensures high availability and resilience.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Smart Contracts</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain supports EVM-compatible smart contracts written in Solidity. The platform includes 
          standard token contracts (ERC-20, ERC-721) and custom contracts for specific use cases.
        </p>
      </section>
    </div>
  );
}

