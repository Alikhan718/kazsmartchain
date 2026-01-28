export default function BlockchainLayerPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Blockchain Layer</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          The foundational blockchain infrastructure of KazSmartChain
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Hyperledger Besu</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain uses Hyperledger Besu as its core blockchain client. Besu is an Ethereum-compatible 
          client that provides:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>EVM-compatible execution environment</li>
          <li>Proof of Authority (PoA) consensus mechanism</li>
          <li>High transaction throughput</li>
          <li>Enterprise-grade security and privacy features</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Consensus Mechanism</h2>
        <p className="text-gray-700 dark:text-gray-300">
          The network uses a Proof of Authority consensus mechanism where approved validators are responsible 
          for creating and validating blocks. This ensures fast finality and high throughput while maintaining 
          security through validator reputation and governance.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Network Nodes</h2>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold">Validator Nodes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nodes that participate in consensus and create new blocks
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold">Full Nodes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nodes that maintain a complete copy of the blockchain
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold">Archive Nodes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nodes that store complete historical state data
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

