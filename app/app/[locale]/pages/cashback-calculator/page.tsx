'use client';

import { useState } from 'react';
import type { Metadata } from 'next';

export default function CashbackCalculatorPage() {
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<string>('5');
  const [result, setResult] = useState<number | null>(null);

  const calculateCashback = () => {
    const purchaseAmount = parseFloat(amount);
    const cashbackRate = parseFloat(rate);

    if (!isNaN(purchaseAmount) && !isNaN(cashbackRate)) {
      const cashback = (purchaseAmount * cashbackRate) / 100;
      setResult(cashback);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Cashback Calculator</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Calculate your potential cashback rewards
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {/* Purchase Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2">
                Purchase Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>

            {/* Cashback Rate */}
            <div>
              <label htmlFor="rate" className="block text-sm font-medium mb-2">
                Cashback Rate (%)
              </label>
              <input
                id="rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Enter rate"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateCashback}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Calculate
            </button>

            {/* Result */}
            {result !== null && (
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Your Cashback
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${result.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Tip:</strong> Different campaigns offer different cashback rates.
              Check our active campaigns to maximize your rewards!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
