'use client';

import { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import { formatIDR } from '@/lib/utils';
import { ToastContainer } from '@/components/Toast';
import AddTransactionModal from '@/components/AddTransactionModal';
import EditTransactionModal from '@/components/EditTransactionModal';
import TransactionOptionsModal from '@/components/TransactionOptionsModal';
import { useToast } from '@/hooks/useToast';

interface Wallet {
  id: number;
  name: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  createdAt: string;
  updatedAt: string;
}

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
  transferDirection?: 'out' | 'in' | null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [optionsTx, setOptionsTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showSkel, setShowSkel] = useState(true);
  const toast = useToast();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // AbortController ref for cancelling ongoing requests
  const abortRef = useRef<AbortController | null>(null);

  const fetchWallets = async () => {
    try {
      const res = await fetch('/api/wallets');
      if (!res.ok) throw new Error('Failed to fetch wallets');
      const data = await res.json();
      setWallets(data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTransactions = async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;
    
    // Abort previous request if exists
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      console.log('Fetching transactions...');
      if (!silent) {
        setLoading(true);
      }

      // Build query params (use debouncedSearch instead of searchQuery)
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (activeTab !== 'all') params.append('type', activeTab);
      if (selectedCategory !== 'all') params.append('category_id', selectedCategory);
      if (selectedWallet !== 'all') params.append('wallet_id', selectedWallet);
      params.append('sort', sortBy);

      const res = await fetch(`/api/transactions?${params.toString()}`, {
        signal: controller.signal,
      });
      console.log('Response status:', res.status);
      if (!res.ok) {
        throw new Error(`Failed to fetch transactions (${res.status})`);
      }
      const data = await res.json();
      console.log('Transactions data:', data);
      setTransactions(data);

      // Calculate total animation time and hide skeleton after
      const STAGGER = 50;
      const DURATION = 240;
      const count = Math.min(data.length, 8);
      const total = (count - 1) * STAGGER + DURATION;
      setShowSkel(true);
      setTimeout(() => setShowSkel(false), total);
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
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
    fetchWallets();
    fetchCategories();
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeTab, selectedCategory, selectedWallet, sortBy]);

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
          <div className="shimmer h-6 w-40 rounded-full" />
          <div className="shimmer h-4 w-52 rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((skeleton) => (
            <div 
              key={skeleton} 
              className="shimmer h-24 rounded-[20px] shadow-[var(--shadow-md)]" 
            />
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

      {optionsTx && (
        <TransactionOptionsModal
          isOpen={!!optionsTx}
          onClose={() => setOptionsTx(null)}
          transaction={optionsTx}
          onSelectEdit={(tx) => setEditingTx(tx)}
          onSelectDelete={(tx) => handleDelete(tx)}
        />
      )}

      {editingTx && (
        <EditTransactionModal
          isOpen={!!editingTx}
          onClose={() => setEditingTx(null)}
          transaction={editingTx}
          wallets={wallets}
          categories={categories}
          onSuccess={() => {
            setEditingTx(null);
            toast.success('Transaction updated successfully!');
            fetchTransactions();
          }}
          onError={(message) => toast.error(message)}
        />
      )}
      <div className="space-y-4 pb-16">
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

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[20px] bg-[var(--color-surface)] px-4 py-3 pl-11 text-[14px] text-white placeholder-[var(--color-text-muted)] shadow-[var(--shadow-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Type Tabs */}
        <div className="flex gap-2 rounded-[20px] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-md)]">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 rounded-[16px] px-4 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-[var(--color-accent)] text-black'
                : 'text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 rounded-[16px] px-4 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
              activeTab === 'income'
                ? 'bg-[var(--color-accent)] text-black'
                : 'text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 rounded-[16px] px-4 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
              activeTab === 'expense'
                ? 'bg-[var(--color-accent)] text-black'
                : 'text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            Pengeluaran
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-3 gap-3">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-[16px] bg-[var(--color-surface)] px-3 py-2.5 text-[13px] text-white shadow-[var(--shadow-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="all">Semua Kategori</option>
            {categories
              .filter((cat) => activeTab === 'all' || cat.type === activeTab)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>

          {/* Wallet Dropdown */}
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="rounded-[16px] bg-[var(--color-surface)] px-3 py-2.5 text-[13px] text-white shadow-[var(--shadow-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="all">Semua Wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
            className="rounded-[16px] bg-[var(--color-surface)] px-3 py-2.5 text-[13px] text-white shadow-[var(--shadow-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="highest">Terbesar</option>
            <option value="lowest">Terkecil</option>
          </select>
        </div>

        <div className="space-y-3">
          {transactions.map((tx, i) => {
            const STAGGER = 50;
            return (
              <div key={tx.id} className="relative rounded-[20px] overflow-hidden shadow-[var(--shadow-md)]">
                {/* Skeleton overlay (di bawah, tidak mengganggu klik) */}
                {showSkel && (
                  <div className="absolute inset-0 z-0 shimmer pointer-events-none" />
                )}
                {/* Konten final (bukan absolute), dengan fade-in dan delay */}
                <div
                  className="relative z-[1] bg-[var(--color-surface)] p-4 fade-in-up"
                  style={{ animationDelay: `${i * STAGGER}ms` }}
                >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <p className="text-[12px] text-[var(--color-text-muted)]">
                    {dayjs(tx.occurredAt).format('DD MMM YYYY, HH:mm')}
                  </p>
                  <p className="text-[16px] font-semibold">{tx.walletName}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] text-[var(--color-text-muted)]">
                      {tx.categoryName ?? 'No category'}
                    </p>
                    <span
                      className={`inline-flex items-center justify-center rounded-[16px] px-3 py-1 text-[12px] font-medium ${
                        tx.type === 'expense'
                          ? 'bg-[rgba(239,68,68,0.15)] text-[var(--color-negative)]'
                          : tx.type === 'income'
                          ? 'bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]'
                          : tx.transferDirection === 'out'
                          ? 'bg-[rgba(239,68,68,0.15)] text-[var(--color-negative)]'
                          : 'bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]'
                      }`}
                    >
                      {tx.type === 'transfer'
                        ? tx.transferDirection === 'out' ? 'transfer-out' : 'transfer-in'
                        : tx.type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <button
                    type="button"
                    onClick={() => setOptionsTx(tx)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 text-[20px] leading-none"
                    aria-label="Transaction options"
                  >
                    ⋮
                  </button>
                  <p
                    className={`text-[16px] font-semibold ${
                      tx.type === 'expense'
                        ? 'text-[var(--color-negative)]'
                        : tx.type === 'income'
                        ? 'text-[var(--color-positive)]'
                        : tx.transferDirection === 'out'
                        ? 'text-[var(--color-negative)]'
                        : 'text-[var(--color-positive)]'
                    }`}
                  >
                    {(tx.type === 'expense' || (tx.type === 'transfer' && tx.transferDirection === 'out')) ? '-' : '+'}
                    {formatIDR(tx.amount)}
                  </p>
                </div>
              </div>
              {tx.note && (
                <p className="mt-3 rounded-[16px] bg-[#2D2D2D] px-3 py-2 text-[12px] text-[var(--color-text-muted)]">
                  {tx.note}
                </p>
              )}
                </div>
              </div>
            );
          })}

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
