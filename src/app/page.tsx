'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatIDR, getCurrentMonth } from '@/lib/utils';
import AddTransactionModal from '@/components/AddTransactionModal';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

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

type TransactionEntryType = 'expense' | 'income';

export default function Dashboard() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<TransactionEntryType>('expense');
  const {
    toasts,
    removeToast,
    success: showSuccessToast,
    error: showErrorToast,
  } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const balancesRes = await fetch('/api/balances');
      if (!balancesRes.ok) {
        throw new Error('Failed to fetch balances');
      }
      const balancesData = await balancesRes.json();
      setBalances(balancesData);

      const currentMonth = getCurrentMonth();
      const summaryRes = await fetch(`/api/reports/monthly-summary?month=${currentMonth}`);
      if (!summaryRes.ok) {
        throw new Error('Failed to fetch monthly summary');
      }
      const summaryData = await summaryRes.json();
      setMonthlySummary(summaryData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showErrorToast('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalBalance = useMemo(
    () => balances.reduce((acc, wallet) => acc + wallet.balance, 0),
    [balances],
  );

  const netTrend = monthlySummary?.summary.net ?? 0;
  const trendLabel = netTrend >= 0 ? `+${formatIDR(netTrend)}` : formatIDR(netTrend);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <AddTransactionModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={async () => {
          showSuccessToast('Transfer berhasil dibuat');
          await fetchDashboardData();
        }}
        onError={(message) => showErrorToast(message)}
        defaultType="transfer"
        lockType="transfer"
      />
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={async () => {
          showSuccessToast('Transaksi berhasil dibuat');
          await fetchDashboardData();
        }}
        onError={(message) => showErrorToast(message)}
        defaultType={addModalType}
        lockType={addModalType}
      />
      {isTypePickerOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[rgba(13,13,13,0.85)]"
            onClick={() => setIsTypePickerOpen(false)}
          />
          <div className="relative z-10 w-full max-w-[360px] rounded-[24px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
            <header className="space-y-1 text-center">
              <h3 className="text-[20px] font-semibold">Pilih jenis transaksi</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">
                Tentukan transaksi yang ingin kamu catat
              </p>
            </header>
            <div className="mt-6 grid gap-3">
              {(
                [
                  {
                    label: 'Expense',
                    description: 'Catat pengeluaran dari wallet',
                    color: 'bg-[rgba(239,68,68,0.15)] text-[var(--color-negative)]',
                    type: 'expense',
                  },
                  {
                    label: 'Income',
                    description: 'Catat pemasukan ke wallet',
                    color: 'bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]',
                    type: 'income',
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => {
                    setAddModalType(option.type);
                    setIsTypePickerOpen(false);
                    setIsAddModalOpen(true);
                  }}
                  className={`flex w-full items-center justify-between rounded-[20px] p-4 text-left transition-all duration-200 ease-in-out hover:scale-[1.01] ${option.color}`}
                >
                  <div>
                    <p className="text-[16px] font-semibold">{option.label}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)]">{option.description}</p>
                  </div>
                  <span className="text-[20px] text-[var(--color-text)]">→</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsTypePickerOpen(false)}
              className="mt-6 w-full rounded-full border border-[var(--color-divider)] bg-[#2D2D2D] px-4 py-3 text-[14px] font-semibold text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
            >
              Batal
            </button>
          </div>
        </div>
      )}
      {loading ? (
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
      ) : (
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

          <section className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="rounded-[16px] bg-purple-600 p-4 text-center text-[14px] font-semibold text-white shadow-[var(--shadow-md)] transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
              Transfer
            </button>
            <button
              onClick={() => setIsTypePickerOpen(true)}
              className="rounded-[16px] bg-purple-600 p-4 text-center text-[14px] font-semibold text-white shadow-[var(--shadow-md)] transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Tambah
            </button>
          </section>

          {monthlySummary && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-semibold">Monthly summary</h2>
                <span className="text-[12px] text-[var(--color-text-muted)]">{monthlySummary.month}</span>
              </div>

              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] bg-[rgba(34,197,94,0.15)] p-4 min-h-[90px] flex flex-col justify-between">
                    <p className="text-[12px] text-[var(--color-text-muted)] mb-1">Income</p>
                    <p className="text-[16px] font-bold text-[var(--color-text)] leading-tight break-words">
                      {formatIDR(monthlySummary.summary.totalIncome)}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-[rgba(239,68,68,0.15)] p-4 min-h-[90px] flex flex-col justify-between">
                    <p className="text-[12px] text-[var(--color-text-muted)] mb-1">Expense</p>
                    <p className="text-[16px] font-bold text-[var(--color-text)] leading-tight break-words">
                      {formatIDR(monthlySummary.summary.totalExpense)}
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
      )}
    </>
  );
}
