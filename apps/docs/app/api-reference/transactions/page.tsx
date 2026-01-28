export default function TransactionsAPIPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Transactions API</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          API endpoints for transaction operations
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Get Transactions</h2>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-mono">GET</span>
            <code className="text-sm">/api/transactions</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Retrieve a list of transactions with optional filtering.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <pre>{`Query Parameters:
- page: page number
- limit: items per page
- address: filter by address
- tokenId: filter by token`}</pre>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Get Transaction by Hash</h2>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-mono">GET</span>
            <code className="text-sm">/api/transactions/:hash</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get detailed information about a specific transaction by its hash.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Create Transaction</h2>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">POST</span>
            <code className="text-sm">/api/transactions</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Create and submit a new transaction to the blockchain.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <pre>{`Request: {
  "type": "transfer",
  "from": "0x...",
  "to": "0x...",
  "amount": "...",
  "tokenId": "..."
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}

