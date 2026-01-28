export default function DistributionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Token Distribution</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          How KSC tokens are distributed across the ecosystem
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Distribution Overview</h2>
        <p className="text-gray-700 dark:text-gray-300">
          The KSC token distribution is designed to ensure fair allocation and long-term network sustainability. 
          Tokens are distributed across validators, developers, government entities, and the community.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Allocation Categories</h2>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold">Validators</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Allocation for network validators who secure the blockchain
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold">Development Fund</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tokens allocated for ecosystem development and grants
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold">Government & Public Sector</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Allocation for government entities and public sector use cases
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold">Community</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tokens for community incentives, airdrops, and public participation
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

