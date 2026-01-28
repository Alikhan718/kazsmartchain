export default function GovernmentUseCasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Government Services</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Blockchain applications for government and public sector
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Digital Government</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain enables digital transformation of government services, providing transparency, 
          immutability, and efficiency in public sector operations.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Applications</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>Document verification and authentication</li>
          <li>Public procurement transparency</li>
          <li>Voting systems</li>
          <li>Land registry and property records</li>
          <li>Public service delivery tracking</li>
        </ul>
      </section>
    </div>
  );
}

