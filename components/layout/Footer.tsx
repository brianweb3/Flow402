export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Flow / RAMarket</h3>
            <p className="text-gray-400 text-sm">
              Decentralized compute marketplace for RAM and GPU resources.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/market" className="hover:text-white transition-colors">Marketplace</a></li>
              <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/#stats" className="hover:text-white transition-colors">Statistics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/docs/api" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="/docs/x402" className="hover:text-white transition-colors">x402 Payments</a></li>
              <li><a href="/docs/node-agent" className="hover:text-white transition-colors">Node Agent</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Flow / RAMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

