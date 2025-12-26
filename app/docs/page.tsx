export default function DocsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Documentation</h1>

        <div className="space-y-12">
          <section className="card">
            <h2 className="text-2xl font-semibold text-white mb-4">API Overview</h2>
            <p className="text-gray-400 mb-4">
              Flow / RAMarket provides a RESTful API for interacting with the marketplace.
              All API endpoints require authentication via JWT tokens stored in httpOnly cookies.
            </p>
            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Base URL</h3>
            <code className="block bg-gray-800 p-3 rounded text-sm text-gray-300 mb-4">
              https://api.flow-ramarket.com
            </code>
            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Authentication</h3>
            <p className="text-gray-400 mb-4">
              After signing up or logging in, access tokens are automatically stored in httpOnly cookies.
              Refresh tokens are used to obtain new access tokens when they expire.
            </p>
          </section>

          <section className="card">
            <h2 className="text-2xl font-semibold text-white mb-4">x402 Payment Protocol</h2>
            <p className="text-gray-400 mb-4">
              Flow / RAMarket uses the Coinbase x402 protocol for micropayments. When a payment is required,
              the API returns HTTP 402 (Payment Required) with payment challenge details.
            </p>
            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Payment Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-400 mb-4">
              <li>Client requests a rental via POST /api/rentals</li>
              <li>Server responds with HTTP 402 and payment challenge</li>
              <li>Client completes payment and submits proof via POST /api/payments/complete</li>
              <li>Server verifies payment and activates rental</li>
            </ol>
            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Mock Implementation</h3>
            <p className="text-gray-400 mb-4">
              For MVP, we provide a mock x402 implementation that simulates the payment flow.
              In production, this can be replaced with a real Coinbase x402 provider.
            </p>
            <code className="block bg-gray-800 p-3 rounded text-sm text-gray-300">
              {`// Mock payment proof format
{
  "paymentId": "mock_...",
  "proof": "mock_proof_...",
  "timestamp": "2024-01-01T00:00:00Z"
}`}
            </code>
          </section>

          <section className="card">
            <h2 className="text-2xl font-semibold text-white mb-4">Node Agent</h2>
            <p className="text-gray-400 mb-4">
              Providers run a lightweight Flow Node agent that reports resource availability and
              receives rental assignments.
            </p>
            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Heartbeat Endpoint</h3>
            <code className="block bg-gray-800 p-3 rounded text-sm text-gray-300 mb-4">
              POST /api/nodes/:id/heartbeat
{`
{
  "status": "ONLINE",
  "availableRamGB": 128.0,
  "availableGpuCount": 2
}`}
            </code>
            <h3 className="text-xl font-semibold text-white mt-6 mb-2">Installation</h3>
            <p className="text-gray-400 mb-4">
              The Flow Node agent can be installed as a Docker container or systemd service.
              Documentation for the agent will be available in a separate repository.
            </p>
          </section>

          <section className="card">
            <h2 className="text-2xl font-semibold text-white mb-4">API Endpoints</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Authentication</h3>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>POST /api/auth/signup - Create account</li>
                  <li>POST /api/auth/login - Sign in</li>
                  <li>POST /api/auth/logout - Sign out</li>
                  <li>GET /api/auth/me - Get current user</li>
                  <li>POST /api/auth/refresh - Refresh access token</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Offers</h3>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>GET /api/offers - List offers (with filters)</li>
                  <li>POST /api/offers - Create offer</li>
                  <li>GET /api/offers/:id - Get offer details</li>
                  <li>PATCH /api/offers/:id - Update offer</li>
                  <li>DELETE /api/offers/:id - Delete offer</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Rentals</h3>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>GET /api/rentals - List user rentals</li>
                  <li>POST /api/rentals - Create rental (returns 402 if payment required)</li>
                  <li>GET /api/rentals/:id - Get rental details</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Payments</h3>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>POST /api/payments/quote - Get payment quote</li>
                  <li>POST /api/payments/authorize - Authorize payment</li>
                  <li>POST /api/payments/complete - Complete payment and activate rental</li>
                  <li>POST /api/payments/settle - Settle payment</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Nodes</h3>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>GET /api/nodes - List user nodes</li>
                  <li>POST /api/nodes - Create node</li>
                  <li>POST /api/nodes/:id/heartbeat - Update node status</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

