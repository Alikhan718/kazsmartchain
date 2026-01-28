export default function TokensAPIPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Tokens API</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          API endpoints for token operations
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Get All Tokens</h2>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-mono">GET</span>
            <code className="text-sm">/api/tokens</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Retrieve a list of all tokens in the system.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <pre>{`Response: {
  "tokens": [
    {
      "id": "...",
      "name": "KSC Token",
      "symbol": "KSC",
      "totalSupply": "..."
    }
  ]
}`}</pre>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Get Token Balance</h2>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-mono">GET</span>
            <code className="text-sm">/api/tokens/:tokenId/balance/:address</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get the balance of a specific token for an address.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Transfer Tokens</h2>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono">POST</span>
            <code className="text-sm">/api/tokens/transfer</code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Transfer tokens between addresses.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            <pre>{`Request: {
  "tokenId": "...",
  "from": "0x...",
  "to": "0x...",
  "amount": "1000000000000000000"
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}

