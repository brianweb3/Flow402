'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeRentals: 0,
    totalCapacity: 0,
    providers: 0,
  });

  useEffect(() => {
    // Fetch stats (mock for now)
    setStats({
      totalOffers: 1247,
      activeRentals: 342,
      totalCapacity: 45678,
      providers: 89,
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Decentralized Compute
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Rent or provide RAM and GPU capacity on demand. Powered by x402 micropayments
              and decentralized infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/market" className="btn-primary text-lg px-8 py-3">
                Browse Market
              </Link>
              <Link href="/signup" className="btn-secondary text-lg px-8 py-3">
                Become a Provider
              </Link>
            </div>
          </div>

          {/* Network Visualization */}
          <div className="flex justify-center items-center">
            <div className="relative w-full max-w-4xl h-96 mx-auto">
              <div className="absolute inset-0 bg-purple-600/20 rounded-3xl blur-3xl" />
              <div className="relative w-full h-full bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-purple-600/10" />
                <div className="text-center relative z-10">
                  <div className="w-32 h-32 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" />
                    <div className="absolute inset-4 bg-blue-500/40 rounded-full animate-ping" />
                    <div className="absolute inset-8 bg-blue-500 rounded-full" />
                  </div>
                  <p className="text-gray-400 text-sm">Network Visualization</p>
                  <p className="text-gray-500 text-xs mt-2">Connected Nodes: {stats.providers}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 justify-items-center">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-3">{stats.totalOffers.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Active Offers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-3">{stats.activeRentals.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Active Rentals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-3">{stats.totalCapacity.toLocaleString()} GB</div>
              <div className="text-gray-400 text-sm">Total Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-3">{stats.providers}</div>
              <div className="text-gray-400 text-sm">Providers</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-20">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 justify-items-center">
            <div className="card text-center max-w-sm w-full">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Create Offer</h3>
              <p className="text-gray-400">
                Providers list their RAM or GPU resources with pricing, availability, and SLA terms.
              </p>
            </div>
            <div className="card text-center max-w-sm w-full">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Browse & Rent</h3>
              <p className="text-gray-400">
                Consumers browse offers, filter by price and region, and rent resources on demand.
              </p>
            </div>
            <div className="card text-center max-w-sm w-full">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Pay & Access</h3>
              <p className="text-gray-400">
                Payment via x402 protocol, instant access credentials, and automatic usage metering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DePIN Section */}
      <section id="depin" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold text-white mb-8">Decentralized Physical Infrastructure</h2>
              <p className="text-gray-400 text-lg mb-6">
                Flow / RAMarket connects idle compute resources across the globe, creating a decentralized
                network of RAM and GPU capacity.
              </p>
              <p className="text-gray-400 mb-8">
                Providers run lightweight Flow Node agents that report availability and handle rental assignments.
                Consumers get instant access to distributed compute resources with transparent pricing and
                automatic billing.
              </p>
              <div className="flex justify-center md:justify-start">
                <Link href="/docs" className="btn-primary">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="card max-w-lg mx-auto md:mx-0">
              <h3 className="text-xl font-semibold text-white mb-6">Key Features</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 mt-1">✓</span>
                  <span>HTTP 402 micropayments via Coinbase x402 protocol</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 mt-1">✓</span>
                  <span>Per-second usage metering and settlement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 mt-1">✓</span>
                  <span>Global network of providers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 mt-1">✓</span>
                  <span>Transparent pricing and SLA guarantees</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
