'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RentalCalculator } from '@/components/calculator/RentalCalculator';

interface Offer {
  id: string;
  resourceType: 'RAM' | 'GPU';
  amount: number;
  region: string;
  pricePerUnitPerTime: number;
  currency: string;
  minDurationMinutes: number;
  reliabilityScore: number | null;
  user: {
    id: string;
    name: string | null;
  };
  node: {
    id: string;
    name: string;
    status: string;
  } | null;
  _count: {
    rentals: number;
  };
}

export default function MarketPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    resourceType: '' as '' | 'RAM' | 'GPU',
    region: '',
    sortBy: 'price' as 'price' | 'reliability' | 'createdAt',
    sortOrder: 'asc' as 'asc' | 'desc',
  });

  useEffect(() => {
    fetchOffers();
  }, [filters]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.region) params.append('region', filters.region);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const res = await fetch(`/api/offers?${params}`);
      const data = await res.json();
      if (data.success) {
        setOffers(data.data.offers);
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">Browse and rent RAM or GPU capacity</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Resource Type</label>
                  <select
                    value={filters.resourceType}
                    onChange={(e) => setFilters({ ...filters, resourceType: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="">All</option>
                    <option value="RAM">RAM</option>
                    <option value="GPU">GPU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Region</label>
                  <input
                    type="text"
                    value={filters.region}
                    onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                    placeholder="e.g., us-east-1"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="price">Price</option>
                    <option value="reliability">Reliability</option>
                    <option value="createdAt">Newest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                    className="input w-full"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>

            <RentalCalculator />
          </div>

          {/* Offers List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading offers...</div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No offers found</div>
            ) : (
              <div className="grid gap-6">
                {offers.map((offer) => (
                  <div key={offer.id} className="card hover:border-gray-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            offer.resourceType === 'RAM'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {offer.resourceType}
                          </span>
                          <span className="text-gray-400 text-sm">{offer.region}</span>
                          {offer.reliabilityScore && (
                            <span className="text-gray-400 text-sm">
                              ⭐ {offer.reliabilityScore.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {offer.amount} {offer.resourceType === 'RAM' ? 'GB RAM' : 'GPUs'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Provider: {offer.user.name || 'Anonymous'} • {offer._count.rentals} rentals
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-gray-400">Price: </span>
                            <span className="text-white font-semibold">
                              {offer.pricePerUnitPerTime.toFixed(6)} {offer.currency}
                            </span>
                            <span className="text-gray-400">
                              /{offer.resourceType === 'RAM' ? 'GB-hour' : 'GPU-min'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Min Duration: </span>
                            <span className="text-white">{offer.minDurationMinutes} min</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/rentals/new?offerId=${offer.id}`}
                        className="btn-primary ml-4"
                      >
                        Rent Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

