export default function APIReferencePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">API Reference</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Complete API documentation for KazSmartChain
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Base URL</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <code className="text-sm">http://localhost:4000/api</code>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Authentication</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Most API endpoints require authentication using JWT tokens. Include the token in the Authorization header:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <code className="text-sm">Authorization: Bearer YOUR_TOKEN_HERE</code>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">API Endpoints</h2>
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-mono">GET</span>
              <code className="text-sm">/api/tokens</code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get list of tokens
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">POST</span>
              <code className="text-sm">/api/transactions</code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new transaction
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-mono">GET</span>
              <code className="text-sm">/api/organizations</code>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get list of organizations
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Swagger Documentation</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Interactive API documentation is available at:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <code className="text-sm">http://localhost:4000/docs</code>
        </div>
      </section>
    </div>
  );
}

