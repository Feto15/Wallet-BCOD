'use client';

import { useState, useEffect } from 'react';
import { parseMoneyInput, formatIDR } from '@/lib/utils';

interface Wallet {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Form state
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  
  // Transfer specific
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchWallets();
      fetchCategories();
      // Set default date/time to now in datetime-local format
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setOccurredAt(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchWallets = async () => {
    try {
      setLoadingWallets(true);
      const res = await fetch('/api/wallets'); // Only active wallets
      const data = await res.json();
      setWallets(data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      onError('Gagal memuat daftar wallet');
    } finally {
      setLoadingWallets(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch('/api/categories'); // Only active categories
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      onError('Gagal memuat daftar kategori');
    } finally {
      setLoadingCategories(false);
    }
  };

  const filteredCategories = categories.filter((cat) => cat.type === transactionType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    // Validate amount
    const parsedAmount = parseMoneyInput(amount);
    if (parsedAmount <= 0) {
      setValidationError('Jumlah harus lebih dari 0');
      return;
    }

    // Validate transfer wallets are different
    if (transactionType === 'transfer' && fromWalletId === toWalletId) {
      setValidationError('Wallet asal dan tujuan tidak boleh sama');
      return;
    }

    try {
      setSubmitting(true);

      let body: Record<string, unknown>;

      // Convert datetime-local format to API format (YYYY-MM-DD HH:mm)
      const formattedDateTime = occurredAt.replace('T', ' ');

      if (transactionType === 'transfer') {
        body = {
          type: 'transfer',
          from_wallet_id: parseInt(fromWalletId),
          to_wallet_id: parseInt(toWalletId),
          amount: parsedAmount,
          note: note || undefined,
          occurred_at: formattedDateTime,
        };
      } else {
        body = {
          type: transactionType,
          wallet_id: parseInt(walletId),
          category_id: parseInt(categoryId),
          amount: parsedAmount,
          note: note || undefined,
          occurred_at: formattedDateTime,
        };
      }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
        resetForm();
        onClose();
      } else {
        const error = await res.json();
        onError(error.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Failed to create transaction:', error);
      onError('Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setWalletId('');
    setCategoryId('');
    setAmount('');
    setNote('');
    setFromWalletId('');
    setToWalletId('');
    setValidationError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[rgba(13,13,13,0.85)]"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-[24px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <header className="flex items-start justify-between">
            <div>
              <h3 className="text-[20px] font-semibold">Add transaction</h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">Capture income, expense, or transfer</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2D2D2D] text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
              aria-label="Close"
            >
              ✕
            </button>
          </header>

          {validationError && (
            <div className="rounded-[16px] border border-[var(--color-negative)] bg-[rgba(239,68,68,0.15)] px-4 py-3 text-[12px] text-[var(--color-negative)]">
              {validationError}
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
              Transaction type
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: 'expense', label: 'Expense', color: 'bg-[rgba(239,68,68,0.15)] text-[var(--color-negative)]' },
                  { value: 'income', label: 'Income', color: 'bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]' },
                  { value: 'transfer', label: 'Transfer', color: 'bg-[rgba(167,139,250,0.15)] text-[var(--color-accent)]' },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTransactionType(option.value)}
                  className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ease-in-out ${
                    transactionType === option.value
                      ? option.color
                      : 'bg-[#2D2D2D] text-[var(--color-text-muted)] hover:brightness-110'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {transactionType === 'transfer' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fromWallet" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
                  From wallet
                </label>
                <select
                  id="fromWallet"
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  required
                  disabled={loadingWallets}
                >
                  <option value="">{loadingWallets ? 'Loading...' : 'Select wallet'}</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="toWallet" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
                  To wallet
                </label>
                <select
                  id="toWallet"
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  required
                  disabled={loadingWallets}
                >
                  <option value="">{loadingWallets ? 'Loading...' : 'Select wallet'}</option>
                  {wallets
                    .filter((w) => w.id.toString() !== fromWalletId)
                    .map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="wallet" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
                  Wallet
                </label>
                <select
                  id="wallet"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  required
                  disabled={loadingWallets}
                >
                  <option value="">{loadingWallets ? 'Loading...' : 'Select wallet'}</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
                  Category
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  required
                  disabled={loadingCategories}
                >
                  <option value="">{loadingCategories ? 'Loading...' : 'Select category'}</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="amount" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
              Amount (Rp)
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="50000"
              required
            />
            {amount && (
              <p className="text-[12px] text-[var(--color-text-muted)]">
                = {formatIDR(parseMoneyInput(amount))}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="occurredAt" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
              Date &amp; time
            </label>
            <input
              type="datetime-local"
              id="occurredAt"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
              Note (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="Add context for this transaction"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-[var(--color-accent)] px-4 py-3 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create transaction'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-full border border-[var(--color-divider)] bg-[#2D2D2D] px-4 py-3 text-[14px] font-semibold text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
