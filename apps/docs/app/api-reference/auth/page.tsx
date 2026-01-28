export default function AuthPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Authentication</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          How to authenticate with the KazSmartChain API
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">JWT Authentication</h2>
        <p className="text-gray-700 dark:text-gray-300">
          KazSmartChain API uses JSON Web Tokens (JWT) for authentication. Include the token in the Authorization header of your requests.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Getting a Token</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Authenticate by sending credentials to the login endpoint:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <pre className="text-sm">
{`POST /api/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}`}
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Using the Token</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Include the token in subsequent requests:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <pre className="text-sm">
{`Authorization: Bearer YOUR_JWT_TOKEN`}
          </pre>
        </div>
      </section>
    </div>
  );
}

