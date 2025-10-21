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
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const toast = useToast();

  const fetchTransactions = async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;
    try {
      console.log('Fetching transactions...');
      if (!silent) {
        setLoading(true);
      }
      const res = await fetch('/api/transactions');
      console.log('Response status:', res.status);
      if (!res.ok) {
        throw new Error(`Failed to fetch transactions (${res.status})`);
      }
      const data = await res.json();
      console.log('Transactions data:', data);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      console.log('Setting loading to false');
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('Render - loading:', loading, 'transactions:', transactions.length);

  const handleDelete = async (tx: Transaction) => {
    const confirmationMessage =
      tx.type === 'transfer'
        ? 'Delete this transfer? Both legs of the transfer will be removed.'
        : 'Delete this transaction?';

    const confirmed = typeof window === 'undefined' ? false : window.confirm(confirmationMessage);
    if (!confirmed) {
      return;
    }

    setDeletingId(tx.id);
    try {
      const res = await fetch(`/api/transactions/${tx.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = data?.error ?? 'Failed to delete transaction';
        toast.error(message);
        return;
      }

      toast.success(
        tx.type === 'transfer'
          ? 'Transfer deleted successfully'
          : 'Transaction deleted successfully'
      );
      await fetchTransactions({ silent: true });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

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
                <div className="flex flex-col items-end gap-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(tx)}
                    disabled={deletingId === tx.id}
                    className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] px-3 py-1 text-[12px] font-medium text-[var(--color-text-muted)] transition-colors duration-150 hover:border-[var(--color-negative)] hover:text-[var(--color-negative)] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Delete transaction"
                  >
                    {deletingId === tx.id ? 'Deleting...' : 'Delete'}
                  </button>
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
