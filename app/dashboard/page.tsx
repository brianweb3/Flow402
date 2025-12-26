'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isProvider = user.role === 'PROVIDER' || user.role === 'ADMIN';
  const isConsumer = user.role === 'CONSUMER' || user.role === 'ADMIN';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user.name || user.email}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {isProvider && (
            <Link href="/provider" className="card hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-semibold text-white mb-2">Provider Portal</h2>
              <p className="text-gray-400 mb-4">Manage your offers, nodes, and earnings</p>
              <span className="text-blue-400">Go to Provider Portal →</span>
            </Link>
          )}

          {isConsumer && (
            <Link href="/consumer" className="card hover:border-gray-700 transition-colors">
              <h2 className="text-2xl font-semibold text-white mb-2">Consumer Portal</h2>
              <p className="text-gray-400 mb-4">View your rentals, costs, and receipts</p>
              <span className="text-blue-400">Go to Consumer Portal →</span>
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/market" className="block text-blue-400 hover:text-blue-300">
                Browse Market →
              </Link>
              {isProvider && (
                <Link href="/provider/offers/new" className="block text-blue-400 hover:text-blue-300">
                  Create Offer →
                </Link>
              )}
              <Link href="/docs" className="block text-blue-400 hover:text-blue-300">
                Documentation →
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Account</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div>Email: {user.email}</div>
              <div>Role: {user.role}</div>
              {user.walletAddress && (
                <div>Wallet: {user.walletAddress.slice(0, 10)}...</div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
            <div className="space-y-2 text-sm">
              <a href="/docs" className="block text-blue-400 hover:text-blue-300">
                Documentation
              </a>
              <a href="/docs/api" className="block text-blue-400 hover:text-blue-300">
                API Reference
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

