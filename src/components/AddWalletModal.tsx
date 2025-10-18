'use client';

import { useState } from 'react';
import { parseMoneyInput, formatIDR } from '@/lib/utils';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWalletModal({ isOpen, onClose, onSuccess }: AddWalletModalProps) {
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Wallet name is required');
      return;
    }

    const parsedBalance = parseMoneyInput(initialBalance || '0');
    if (parsedBalance < 0) {
      setValidationError('Initial balance cannot be negative');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Create wallet
      const walletRes = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!walletRes.ok) {
        const error = await walletRes.json();
        throw new Error(error.error || 'Failed to create wallet');
      }

      const newWallet = await walletRes.json();

      // 2. If initial balance > 0, create initial transaction
      if (parsedBalance > 0) {
        console.log('Creating initial balance transaction:', parsedBalance);
        const transactionRes = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletId: newWallet.id,
            categoryId: null, // Uncategorized
            type: 'income',
            amount: parsedBalance,
            note: 'Saldo awal',
            occurredAt: new Date().toISOString(),
          }),
        });

        if (!transactionRes.ok) {
          const errorData = await transactionRes.json();
          console.error('Failed to create initial balance transaction:', errorData);
          // Don't fail the whole operation, wallet is already created
          alert(`Wallet created but failed to add initial balance: ${errorData.error || 'Unknown error'}`);
        } else {
          console.log('Initial balance transaction created successfully');
        }
      } else {
        console.log('No initial balance specified, parsedBalance:', parsedBalance);
      }

      // Success
      setName('');
      setInitialBalance('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create wallet:', error);
      setValidationError(error instanceof Error ? error.message : 'Failed to create wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setName('');
      setInitialBalance('');
      setValidationError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[390px] rounded-[24px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-float)]">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">Create New Wallet</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="text-[24px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {validationError && (
          <div className="mb-4 rounded-[16px] border border-[var(--color-negative)] bg-[rgba(239,68,68,0.15)] px-4 py-3 text-[12px] text-[var(--color-negative)]">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="wallet-name"
              className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]"
            >
              Wallet Name
            </label>
            <input
              type="text"
              id="wallet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="e.g., BCA, Cash, Mandiri"
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="initial-balance"
              className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]"
            >
              Initial Balance (Rp) - Optional
            </label>
            <input
              type="text"
              id="initial-balance"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="0"
              disabled={submitting}
            />
            {initialBalance && (
              <p className="text-[12px] text-[var(--color-text-muted)]">
                = {formatIDR(parseMoneyInput(initialBalance))}
              </p>
            )}
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Initial balance will be added as an income transaction
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 rounded-full bg-[var(--color-divider)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Membuat...' : 'Buat Wallet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
