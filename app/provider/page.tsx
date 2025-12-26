'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProviderPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/offers').then((r) => r.json()),
      fetch('/api/nodes').then((r) => r.json()),
    ]).then(([offersData, nodesData]) => {
      if (offersData.success) setOffers(offersData.data.offers || []);
      if (nodesData.success) setNodes(nodesData.data.nodes || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Provider Portal</h1>
            <p className="text-gray-400">Manage your offers and nodes</p>
          </div>
          <Link href="/provider/offers/new" className="btn-primary">
            Create Offer
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="text-2xl font-semibold text-white mb-4">Nodes</h2>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : nodes.length === 0 ? (
              <div className="text-gray-400 mb-4">No nodes registered</div>
            ) : (
              <div className="space-y-4">
                {nodes.map((node) => (
                  <div key={node.id} className="border border-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{node.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        node.status === 'ONLINE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {node.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Region: {node.region}</p>
                    <p className="text-gray-400 text-sm">
                      RAM: {node.availableRamGB}/{node.totalRamGB} GB • 
                      GPU: {node.availableGpuCount}/{node.totalGpuCount}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Link href="/provider/nodes/new" className="btn-outline w-full mt-4">
              Add Node
            </Link>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold text-white mb-4">Offers</h2>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : offers.length === 0 ? (
              <div className="text-gray-400 mb-4">No offers created</div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="border border-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {offer.amount} {offer.resourceType}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        offer.published && offer.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {offer.published && offer.active ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{offer.region}</p>
                    <p className="text-gray-400 text-sm">
                      {offer.pricePerUnitPerTime.toFixed(6)} {offer.currency} / 
                      {offer.resourceType === 'RAM' ? 'GB-hour' : 'GPU-min'}
                    </p>
                    <Link href={`/provider/offers/${offer.id}`} className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
                      Edit →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold text-white mb-4">Earnings</h2>
          <div className="text-gray-400">Earnings chart and statistics coming soon</div>
        </div>
      </div>
    </div>
  );
}

