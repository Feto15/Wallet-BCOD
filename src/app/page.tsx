'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatIDR, getCurrentMonth } from '@/lib/utils';

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

  const totalBalance = useMemo(
    () => balances.reduce((acc, wallet) => acc + wallet.balance, 0),
    [balances],
  );

  const netTrend = monthlySummary?.summary.net ?? 0;
  const trendLabel = netTrend >= 0 ? `+${formatIDR(netTrend)}` : formatIDR(netTrend);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-6 w-32 rounded-full bg-[var(--color-divider)]" />
          <div className="mx-auto h-10 w-52 rounded-full bg-[var(--color-divider)]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((key) => (
            <div
              key={key}
              className="h-28 rounded-[20px] bg-[rgba(30,30,30,0.6)] shadow-[var(--shadow-md)] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <section className="space-y-3 text-center">
        <p className="text-[14px] text-[var(--color-text-muted)]">Total Balance</p>
        <h1 className="text-[32px] font-bold tracking-[0.2px]">
          {formatIDR(totalBalance)}
        </h1>
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-[16px] bg-[#2D2D2D] px-3 py-1 text-[12px] text-[var(--color-text)]">
            <span className={netTrend >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}>
              {netTrend >= 0 ? '▲' : '▼'}
            </span>
            <span className="text-[var(--color-text-muted)]">Net this month {trendLabel}</span>
          </span>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Receive', href: '/transactions?type=income' },
          { label: 'Send', href: '/transactions?type=expense' },
          { label: 'Transfer', href: '/transactions?type=transfer' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="rounded-[16px] bg-[var(--color-card)] p-4 text-center text-[14px] font-medium text-[var(--color-text)] shadow-[var(--shadow-md)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
          >
            {action.label}
          </Link>
        ))}
      </section>

      <section className="rounded-[24px] border border-[var(--color-divider)] bg-[var(--color-card)] p-6 shadow-[var(--shadow-md)]">
        <div className="space-y-3 text-left">
          <h2 className="text-[18px] font-semibold">Add transaction</h2>
          <p className="text-[14px] text-[var(--color-text-muted)]">
            Record income, expense, or wallet transfers to keep your balance up to date.
          </p>
          <Link
            href="/transactions"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
          >
            Go to transactions
          </Link>
        </div>
      </section>

      {monthlySummary && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Monthly summary</h2>
            <span className="text-[12px] text-[var(--color-text-muted)]">{monthlySummary.month}</span>
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[16px] bg-[rgba(34,197,94,0.15)] p-4">
                <p className="text-[12px] text-[var(--color-text-muted)]">Income</p>
                <p className="mt-1 text-[18px] font-semibold text-[var(--color-text)]">
                  {formatIDR(monthlySummary.summary.totalIncome)}
                </p>
              </div>
              <div className="rounded-[16px] bg-[rgba(239,68,68,0.15)] p-4">
                <p className="text-[12px] text-[var(--color-text-muted)]">Expense</p>
                <p className="mt-1 text-[18px] font-semibold text-[var(--color-text)]">
                  {formatIDR(monthlySummary.summary.totalExpense)}
                </p>
              </div>
              <div className="rounded-[16px] bg-[rgba(167,139,250,0.15)] p-4">
                <p className="text-[12px] text-[var(--color-text-muted)]">Net</p>
                <p className={`mt-1 text-[18px] font-semibold ${netTrend >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}>
                  {formatIDR(monthlySummary.summary.net)}
                </p>
              </div>
            </div>

            {monthlySummary.byCategory.length > 0 ? (
              <div className="rounded-[20px] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-md)]">
                <h3 className="text-[16px] font-semibold">By category</h3>
                <div className="mt-3 space-y-3">
                  {monthlySummary.byCategory.map((cat) => (
                    <div
                      key={cat.categoryId ?? cat.categoryName}
                      className="flex items-center justify-between border-b border-[var(--color-divider)] pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-[14px] font-medium">{cat.categoryName}</p>
                        <p className="text-[12px] text-[var(--color-text-muted)] capitalize">{cat.type}</p>
                      </div>
                      <p
                        className={`text-[14px] font-semibold ${
                          cat.type === 'expense'
                            ? 'text-[var(--color-negative)]'
                            : 'text-[var(--color-positive)]'
                        }`}
                      >
                        {cat.type === 'expense' ? '-' : '+'}
                        {formatIDR(cat.total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] bg-[var(--color-surface)] p-6 text-center text-[var(--color-text-muted)] shadow-[var(--shadow-md)]">
                <p>No transactions this month yet.</p>
                <Link
                  href="/transactions"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
                >
                  Add transaction
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
