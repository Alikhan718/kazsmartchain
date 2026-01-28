export default function RegulatoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Regulatory Compliance</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Compliance with Kazakhstan's Digital Asset Law
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Legal Framework</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain operates in compliance with Kazakhstan's Digital Asset Law, ensuring 
          that all activities on the platform adhere to local regulations and requirements.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Compliance Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>KYC/AML compliance</li>
          <li>Transaction monitoring</li>
          <li>Regulatory reporting</li>
          <li>Audit trails</li>
          <li>Privacy protection</li>
        </ul>
      </section>
    </div>
  );
}

