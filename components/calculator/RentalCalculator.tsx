'use client';

import { useState } from 'react';
import { calculateRentalCost } from '@/lib/payments/calculator';

interface CalculatorProps {
  defaultResourceType?: 'RAM' | 'GPU';
  defaultPrice?: number;
  onSubmit?: (result: ReturnType<typeof calculateRentalCost>) => void;
}

export function RentalCalculator({ defaultResourceType = 'RAM', defaultPrice, onSubmit }: CalculatorProps) {
  const [resourceType, setResourceType] = useState<'RAM' | 'GPU'>(defaultResourceType);
  const [amount, setAmount] = useState<string>('1');
  const [durationMinutes, setDurationMinutes] = useState<string>('60');
  const [pricePerUnitPerTime, setPricePerUnitPerTime] = useState<string>(defaultPrice?.toString() || '0.01');
  const [result, setResult] = useState<ReturnType<typeof calculateRentalCost> | null>(null);

  const handleCalculate = () => {
    try {
      const calcResult = calculateRentalCost({
        resourceType,
        amount: parseFloat(amount),
        durationMinutes: parseInt(durationMinutes),
        pricePerUnitPerTime: parseFloat(pricePerUnitPerTime),
      });
      setResult(calcResult);
      if (onSubmit) {
        onSubmit(calcResult);
      }
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-white mb-4">Cost Calculator</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Resource Type</label>
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as 'RAM' | 'GPU')}
            className="input w-full"
          >
            <option value="RAM">RAM</option>
            <option value="GPU">GPU</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Amount ({resourceType === 'RAM' ? 'GB' : 'GPUs'})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input w-full"
            min="0.1"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Duration (minutes)</label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="input w-full"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Price per {resourceType === 'RAM' ? 'GB-hour' : 'GPU-minute'} (USDC)
          </label>
          <input
            type="number"
            value={pricePerUnitPerTime}
            onChange={(e) => setPricePerUnitPerTime(e.target.value)}
            className="input w-full"
            min="0.001"
            step="0.001"
          />
        </div>

        <button onClick={handleCalculate} className="btn-primary w-full">
          Calculate Cost
        </button>

        {result && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h4 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Resource Cost:</span>
                <span className="text-white">{result.subtotal.toFixed(6)} {result.currency}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Platform Fee (5%):</span>
                <span className="text-white">{result.platformFee.toFixed(6)} {result.currency}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-gray-800">
                <span>Total:</span>
                <span>{result.total.toFixed(6)} {result.currency}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

