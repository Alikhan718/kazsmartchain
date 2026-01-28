export default function GettingStartedPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Getting Started</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Learn how to get started with KazSmartChain
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">What is KazSmartChain?</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          KazSmartChain (KSC) is Kazakhstan's national public blockchain platform, set to launch on December 16, 2025 – the country's Independence Day.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          As a sovereign blockchain infrastructure, KSC is designed to support Kazakhstan's digital economy ambitions and technological sovereignty. In practical terms, it will serve as an open network for government, businesses, developers, and citizens to build and use decentralized applications (DApps) and digital services in a locally controlled environment.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Key Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>Sovereign blockchain infrastructure for Kazakhstan</li>
          <li>Fixed, non-inflationary token supply</li>
          <li>Built on Hyperledger Besu and FireFly</li>
          <li>Support for smart contracts and DApps</li>
          <li>Integration with IPFS for decentralized storage</li>
          <li>Compliance with Kazakhstan's Digital Asset Law</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Quick Start</h2>
        <div className="glass rounded-lg p-4">
          <p className="font-mono-code text-sm text-gray-800 dark:text-gray-200">
            # Connect to KazSmartChain network<br />
            # Use our SDK or API to interact with the blockchain<br />
            # Start building your DApp
          </p>
        </div>
      </section>
    </div>
  );
}

