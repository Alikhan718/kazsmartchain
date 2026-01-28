export default function SupplyPolicyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Supply Policy</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Understanding KSC token supply mechanics
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Fixed Supply Model</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain employs a fixed supply model, meaning the total number of KSC tokens 
          is predetermined and will not increase over time. This creates predictable economics 
          and protects token holders from inflation.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Deflationary Mechanisms</h2>
        <p className="text-gray-700 dark:text-gray-300">
          While the total supply is fixed, KSC implements deflationary mechanisms through:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>Transaction fee burning</li>
          <li>Token lockups for staking</li>
          <li>Governance participation requirements</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Supply Allocation</h2>
        <p className="text-gray-700 dark:text-gray-300">
          The fixed supply is allocated across various categories to ensure balanced distribution 
          and network sustainability.
        </p>
      </section>
    </div>
  );
}

