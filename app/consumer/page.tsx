'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConsumerPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rentals')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRentals(data.data.rentals || []);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Consumer Portal</h1>
            <p className="text-gray-400">Manage your rentals and payments</p>
          </div>
          <Link href="/market" className="btn-primary">
            Browse Market
          </Link>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Active Rentals</h2>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : rentals.length === 0 ? (
            <div className="text-gray-400">No active rentals</div>
          ) : (
            <div className="space-y-4">
              {rentals.map((rental) => (
                <div key={rental.id} className="border border-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {rental.amount} {rental.resourceType}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {rental.offer.user.name || 'Provider'} • {rental.offer.region}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      rental.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                      rental.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {rental.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                      Cost: {rental.totalPrice.toFixed(6)} {rental.currency}
                    </div>
                    {rental.accessToken && (
                      <Link href={`/rentals/${rental.id}`} className="text-blue-400 hover:text-blue-300 text-sm">
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-white mb-4">Receipts & Invoices</h2>
          <div className="text-gray-400">Invoice history coming soon</div>
        </div>
      </div>
    </div>
  );
}

