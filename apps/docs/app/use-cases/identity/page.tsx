export default function IdentityUseCasesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Digital Identity</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Self-sovereign identity and credential management
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Identity Solutions</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain provides infrastructure for self-sovereign identity systems where users 
          control their own identity data and credentials.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Applications</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>Digital credentials and certificates</li>
          <li>Identity verification</li>
          <li>Access control and authentication</li>
          <li>Privacy-preserving identity systems</li>
          <li>Educational credentials</li>
        </ul>
      </section>
    </div>
  );
}

