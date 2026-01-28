export default function NetworkInfrastructurePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Network Infrastructure</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          The network layer and infrastructure components
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Network Topology</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain operates as a distributed network of nodes spread across Kazakhstan. 
          The network is designed for high availability, low latency, and resilience.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Infrastructure Components</h2>
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">API Gateway</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Provides RESTful APIs for interacting with the blockchain and accessing network services.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">FireFly Core</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Multi-party system managing data flows, identities, and blockchain interactions.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">IPFS Network</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Decentralized storage network for off-chain data, documents, and media files.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Relay Service</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Service for relaying transactions and messages between network participants.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Security & Privacy</h2>
        <p className="text-gray-700 dark:text-gray-300">
          The network implements multiple layers of security including encryption, access controls, 
          and privacy-preserving features to protect user data and transactions.
        </p>
      </section>
    </div>
  );
}

