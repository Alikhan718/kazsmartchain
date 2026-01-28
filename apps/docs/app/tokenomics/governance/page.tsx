export default function GovernancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Governance</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          How KazSmartChain is governed and how you can participate
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Governance Model</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain implements a decentralized governance model where KSC token holders can 
          participate in decision-making processes. This includes protocol upgrades, parameter changes, 
          and treasury allocation.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Voting Mechanism</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Governance proposals are submitted and voted on by token holders. Voting power is proportional 
          to the amount of KSC tokens staked or held.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Proposal Types</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>Protocol upgrades and improvements</li>
          <li>Network parameter adjustments</li>
          <li>Treasury fund allocation</li>
          <li>Validator set changes</li>
          <li>Ecosystem grants and funding</li>
        </ul>
      </section>
    </div>
  );
}

