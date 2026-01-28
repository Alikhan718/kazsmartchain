export default function TokenUtilityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Token Utility</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          How KSC tokens are used within the KazSmartChain ecosystem
        </p>
      </div>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Transaction Fees</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Every transaction on KazSmartChain requires KSC tokens to pay for gas fees. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
            <li>Smart contract deployments</li>
            <li>Token transfers</li>
            <li>Contract function calls</li>
            <li>Data storage on IPFS</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Staking and Validation</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Validators stake KSC tokens to participate in network consensus and earn rewards for maintaining network security.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Governance Participation</h2>
          <p className="text-gray-700 dark:text-gray-300">
            KSC token holders can participate in governance decisions, including protocol upgrades, parameter changes, and treasury allocation.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">DApp Integration</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Developers can integrate KSC tokens into their applications for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
            <li>In-app payments</li>
            <li>Reward mechanisms</li>
            <li>Access control</li>
            <li>Liquidity provision</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

