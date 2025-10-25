'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: { id: number; name: string };
  onSuccess: () => void;
}

export default function EditWalletModal({ isOpen, onClose, wallet, onSuccess }: EditWalletModalProps) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Populate form when wallet changes
  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
    }
  }, [wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Wallet name is required');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`/api/wallets/${wallet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update wallet');
      }

      // Success
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update wallet:', error);
      setValidationError(error instanceof Error ? error.message : 'Failed to update wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setValidationError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full max-w-[390px] rounded-[24px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-float)] border-[var(--color-divider)]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-[20px] font-semibold text-[var(--color-text)]">Edit Wallet</DialogTitle>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="text-[24px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            aria-label="Close"
          >
            ×
          </button>
        </DialogHeader>

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
              {submitting ? 'Menyimpan...' : 'Save'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
