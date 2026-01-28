export default function TokenomicsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Tokenomics</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Understanding KSC token economics and distribution
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Token Overview</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          KazSmartChain Token (KSC) is the native utility token of the KazSmartChain network. 
          It serves as the primary means of transaction fees, staking, and governance participation.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Token Supply</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          KSC has a fixed total supply of tokens, ensuring no inflation and predictable economics. 
          The supply is designed to support the network's long-term sustainability while maintaining 
          value for token holders.
        </p>
        <div className="glass rounded-lg p-4 border-l-4 border-blue-500 dark:border-blue-400">
          <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Key Characteristics:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
            <li>Fixed total supply</li>
            <li>Non-inflationary</li>
            <li>Deflationary mechanism through transaction fees</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Token Utility</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-lg p-4 card-hover">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Transaction Fees</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              KSC tokens are used to pay for transaction fees on the network, including smart contract execution and data storage.
            </p>
          </div>
          <div className="glass rounded-lg p-4 card-hover">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Staking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Token holders can stake KSC to participate in network validation and earn rewards.
            </p>
          </div>
          <div className="glass rounded-lg p-4 card-hover">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Governance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              KSC tokens enable participation in network governance decisions and protocol upgrades.
            </p>
          </div>
          <div className="glass rounded-lg p-4 card-hover">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">DApp Integration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Developers can integrate KSC tokens into their decentralized applications for payments and incentives.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Distribution</h2>
        <p className="text-gray-700 dark:text-gray-300">
          The KSC token distribution is designed to ensure fair allocation across various stakeholders, 
          including validators, developers, government entities, and the community.
        </p>
      </section>
    </div>
  );
}

