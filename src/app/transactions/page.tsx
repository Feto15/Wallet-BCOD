'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { formatIDR } from '@/lib/utils';
import { ToastContainer } from '@/components/Toast';
import AddTransactionModal from '@/components/AddTransactionModal';
import { useToast } from '@/hooks/useToast';

interface Transaction {
  id: number;
  walletId: number;
  walletName: string;
  categoryId: number | null;
  categoryName: string | null;
  categoryType: string | null;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  note: string | null;
  occurredAt: string;
  createdAt: string;
  transferGroupId: number | null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      setLoading(true);
      const res = await fetch('/api/transactions');
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Transactions data:', data);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('Render - loading:', loading, 'transactions:', transactions.length);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-full bg-[var(--color-divider)]" />
          <div className="h-4 w-52 rounded-full bg-[var(--color-divider)]" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((skeleton) => (
            <div key={skeleton} className="h-24 rounded-[20px] bg-[rgba(30,30,30,0.6)] shadow-[var(--shadow-md)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          toast.success('Transaction created successfully!');
          fetchTransactions();
        }}
        onError={(message) => toast.error(message)}
      />
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[24px] font-semibold tracking-[0.2px]">Transactions</h1>
            <p className="text-[14px] text-[var(--color-text-muted)]">
              Track every income, expense, and transfer
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
          >
            + Add
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="rounded-[20px] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-md)]"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[12px] text-[var(--color-text-muted)]">
                    {dayjs(tx.occurredAt).format('DD MMM YYYY, HH:mm')}
                  </p>
                  <p className="text-[16px] font-semibold">{tx.walletName}</p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">
                    {tx.categoryName ?? 'No category'}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center justify-center rounded-[16px] px-3 py-1 text-[12px] font-medium ${
                      tx.type === 'expense'
                        ? 'bg-[rgba(239,68,68,0.15)] text-[var(--color-negative)]'
                        : tx.type === 'income'
                        ? 'bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]'
                        : 'bg-[rgba(167,139,250,0.15)] text-[var(--color-accent)]'
                    }`}
                  >
                    {tx.type}
                  </span>
                  <p
                    className={`mt-3 text-[16px] font-semibold ${
                      tx.type === 'expense'
                        ? 'text-[var(--color-negative)]'
                        : tx.type === 'income'
                        ? 'text-[var(--color-positive)]'
                        : 'text-[var(--color-accent)]'
                    }`}
                  >
                    {tx.type === 'expense' ? '-' : '+'}{formatIDR(tx.amount)}
                  </p>
                </div>
              </div>
              {tx.note && (
                <p className="mt-3 rounded-[16px] bg-[#2D2D2D] px-3 py-2 text-[12px] text-[var(--color-text-muted)]">
                  {tx.note}
                </p>
              )}
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="rounded-[20px] bg-[var(--color-surface)] p-6 text-center text-[var(--color-text-muted)] shadow-[var(--shadow-md)]">
              <p>No transactions yet. Tap &quot;+ Add&quot; to create your first entry.</p>
            </div>
          )}
        </div>

        {transactions.length > 0 && (
          <p className="text-right text-[12px] text-[var(--color-text-muted)]">
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </>
  );
}
