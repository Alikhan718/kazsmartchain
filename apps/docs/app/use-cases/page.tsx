export default function UseCasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Use Cases</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Real-world applications of KazSmartChain
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain enables a wide range of use cases across government, finance, identity, 
          and other sectors. The platform's flexibility and compliance features make it suitable 
          for various applications.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Key Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Government Services</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Digital government services, document verification, and public sector transparency.
            </p>
            <a href="/use-cases/government" className="text-blue-600 dark:text-blue-400 hover:underline">
              Learn More →
            </a>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Financial Services</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tokenized assets, payments, and decentralized finance applications.
            </p>
            <a href="/use-cases/finance" className="text-blue-600 dark:text-blue-400 hover:underline">
              Learn More →
            </a>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Digital Identity</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Self-sovereign identity, credentials, and authentication systems.
            </p>
            <a href="/use-cases/identity" className="text-blue-600 dark:text-blue-400 hover:underline">
              Learn More →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

