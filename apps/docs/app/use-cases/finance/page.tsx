export default function FinanceUseCasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Financial Services</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Blockchain applications in finance and banking
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Financial Applications</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain enables various financial services including tokenized assets, payments, 
          and decentralized finance applications compliant with Kazakhstan's regulations.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Use Cases</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>Tokenized assets and securities</li>
          <li>Cross-border payments</li>
          <li>Trade finance</li>
          <li>Supply chain finance</li>
          <li>Decentralized lending and borrowing</li>
        </ul>
      </section>
    </div>
  );
}

