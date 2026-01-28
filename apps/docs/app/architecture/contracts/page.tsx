export default function SmartContractsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Smart Contracts</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Smart contract development on KazSmartChain
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">EVM Compatibility</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain is fully EVM-compatible, meaning you can deploy and interact with smart contracts 
          written in Solidity using standard Ethereum development tools and libraries.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Standard Contracts</h2>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold">KSC Token (ERC-20)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The native KSC token contract implementing the ERC-20 standard
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold">NFT Contracts (ERC-721)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Support for non-fungible tokens for certificates, credentials, and digital assets
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold">Custom Contracts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deploy custom smart contracts for specific use cases and business logic
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Development Tools</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Develop smart contracts using standard Ethereum tooling:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>Hardhat or Truffle for development and testing</li>
          <li>OpenZeppelin Contracts for secure, audited contract libraries</li>
          <li>Remix IDE for browser-based development</li>
          <li>KazSmartChain SDK for JavaScript/TypeScript integration</li>
        </ul>
      </section>
    </div>
  );
}

