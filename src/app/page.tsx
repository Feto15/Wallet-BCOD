'use client';

import { useEffect, useState } from 'react';
import { formatIDR, getCurrentMonth } from '@/lib/utils';
import Link from 'next/link';

interface Balance {
  walletId: number;
  walletName: string;
  currency: string;
  balance: number;
}

interface MonthlySummary {
  month: string;
  summary: {
    totalExpense: number;
    totalIncome: number;
    net: number;
  };
  byCategory: Array<{
    categoryId: number;
    categoryName: string;
    categoryType: string;
    type: string;
    total: number;
  }>;
}

export default function Dashboard() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch balances
        const balancesRes = await fetch('/api/balances');
        const balancesData = await balancesRes.json();
        setBalances(balancesData);

        // Fetch monthly summary
        const currentMonth = getCurrentMonth();
        const summaryRes = await fetch(`/api/reports/monthly-summary?month=${currentMonth}`);
        const summaryData = await summaryRes.json();
        setMonthlySummary(summaryData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your wallets and monthly summary
        </p>
      </div>

      {/* Balance Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Balances</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {balances.map((balance) => (
            <div
              key={balance.walletId}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {balance.walletName}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatIDR(balance.balance)}
                  </p>
                </div>
                <div className="text-3xl">💳</div>
              </div>
            </div>
          ))}
          
          {balances.length === 0 && (
            <div className="col-span-full bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">No wallets found. Create one to get started!</p>
              <Link
                href="/wallets"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Wallet
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      {monthlySummary && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Monthly Summary ({monthlySummary.month})
          </h2>
          
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800">Total Income</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {formatIDR(monthlySummary.summary.totalIncome)}
              </p>
            </div>
            
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-800">Total Expense</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {formatIDR(monthlySummary.summary.totalExpense)}
              </p>
            </div>
            
            <div className={`p-6 rounded-lg border ${
              monthlySummary.summary.net >= 0 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <p className={`text-sm font-medium ${
                monthlySummary.summary.net >= 0 ? 'text-blue-800' : 'text-orange-800'
              }`}>
                Net
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                monthlySummary.summary.net >= 0 ? 'text-blue-900' : 'text-orange-900'
              }`}>
                {formatIDR(monthlySummary.summary.net)}
              </p>
            </div>
          </div>

          {/* By Category */}
          {monthlySummary.byCategory.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
              <div className="space-y-3">
                {monthlySummary.byCategory.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{cat.categoryName}</p>
                      <p className="text-sm text-gray-500 capitalize">{cat.type}</p>
                    </div>
                    <p className={`font-semibold ${
                      cat.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {cat.type === 'expense' ? '-' : '+'}{formatIDR(cat.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthlySummary.byCategory.length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">No transactions this month yet.</p>
              <Link
                href="/transactions"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Transaction
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
