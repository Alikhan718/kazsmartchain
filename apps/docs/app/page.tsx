export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">KazSmartChain Documentation</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Welcome to the official documentation for KazSmartChain - Kazakhstan's sovereign blockchain platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="glass rounded-lg p-6 card-hover">
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Getting Started</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Learn the basics of KazSmartChain and how to get started with the platform.
          </p>
          <a href="/getting-started" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Get Started →
          </a>
        </div>

        <div className="glass rounded-lg p-6 card-hover">
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Tokenomics</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Understand KSC token economics, supply policy, and distribution.
          </p>
          <a href="/tokenomics" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Learn More →
          </a>
        </div>

        <div className="glass rounded-lg p-6 card-hover">
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Technical Architecture</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Explore the technical architecture and infrastructure of KazSmartChain.
          </p>
          <a href="/architecture" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            View Architecture →
          </a>
        </div>

        <div className="glass rounded-lg p-6 card-hover">
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">API Reference</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Complete API reference for developers building on KazSmartChain.
          </p>
          <a href="/api-reference" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            View API →
          </a>
        </div>
      </div>
    </div>
  );
}

