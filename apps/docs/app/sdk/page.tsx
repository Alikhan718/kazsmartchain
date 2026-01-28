export default function SDKPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">SDK</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          KazSmartChain Software Development Kit
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-gray-700 dark:text-gray-300">
          The KazSmartChain SDK provides developers with tools and libraries to interact with 
          the blockchain, deploy smart contracts, and build decentralized applications.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Installation</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <code className="text-sm">npm install @kazsmartchain/sdk</code>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Usage</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <pre className="text-sm">
{`import { KazSmartChainSDK } from '@kazsmartchain/sdk';

const sdk = new KazSmartChainSDK({
  apiUrl: 'http://localhost:4000',
});

// Interact with the blockchain
const tokens = await sdk.tokens.list();`}
          </pre>
        </div>
      </section>
    </div>
  );
}

