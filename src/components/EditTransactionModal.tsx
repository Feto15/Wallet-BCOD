'use client';

import { useState, useEffect } from 'react';
import { parseMoneyInput, formatIDR } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CustomSelect } from '@/components/ui/custom-select';

interface Wallet {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
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

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  wallets: Wallet[];
  categories: Category[];
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  wallets,
  categories,
  onSuccess,
  onError,
}: EditTransactionModalProps) {
  const [submitting, setSubmitting] = useState(false);
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
  const [loadingTransferData, setLoadingTransferData] = useState(false);

  // Populate form when transaction changes
  useEffect(() => {
    if (isOpen && transaction) {
      setAmount(transaction.amount.toString());
      setNote(transaction.note || '');
      
      // Convert occurredAt from "YYYY-MM-DD HH:mm:ss" to "YYYY-MM-DDTHH:mm" for datetime-local input
      const dateStr = transaction.occurredAt.replace(' ', 'T').substring(0, 16);
      setOccurredAt(dateStr);

      if (transaction.type === 'transfer') {
        // For transfer, we need to fetch both legs to determine from/to wallets
        fetchTransferLegs();
      } else {
        setWalletId(transaction.walletId.toString());
        // Use 'none' for null category to avoid empty string in Select
        setCategoryId(transaction.categoryId?.toString() || '');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, transaction]);

  const fetchTransferLegs = async () => {
    if (!transaction.transferGroupId) return;

    try {
      setLoadingTransferData(true);
      // Fetch transfer legs using lightweight endpoint
      const res = await fetch(`/api/transfer-groups/${transaction.transferGroupId}`);
      if (!res.ok) throw new Error('Failed to fetch transfer data');
      
      const legs: Array<{ id: number; walletId: number; amount: number; note: string | null; occurredAt: string }> = await res.json();
      
      // Legs are already sorted by id ASC (MIN(id) = outgoing)
      if (legs.length === 2) {
        setFromWalletId(legs[0].walletId.toString());
        setToWalletId(legs[1].walletId.toString());
      } else {
        // Fallback: use current transaction's wallet based on direction
        if (transaction.transferDirection === 'out') {
          setFromWalletId(transaction.walletId.toString());
          // For to wallet, we need to make an educated guess or leave empty
        } else if (transaction.transferDirection === 'in') {
          setToWalletId(transaction.walletId.toString());
          // For from wallet, we need to make an educated guess or leave empty
        }
      }
    } catch (error) {
      console.error('Failed to fetch transfer legs:', error);
      // Fallback: use current transaction's wallet
      if (transaction.transferDirection === 'out') {
        setFromWalletId(transaction.walletId.toString());
      } else {
        setToWalletId(transaction.walletId.toString());
      }
    } finally {
      setLoadingTransferData(false);
    }
  };

  const filteredCategories = categories.filter((cat) => cat.type === transaction.type);

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
    if (transaction.type === 'transfer' && fromWalletId === toWalletId) {
      setValidationError('Wallet asal dan tujuan tidak boleh sama');
      return;
    }

    try {
      setSubmitting(true);

      let body: Record<string, unknown>;

      // Convert datetime-local format to API format (YYYY-MM-DD HH:mm)
      const formattedDateTime = occurredAt.replace('T', ' ');

      if (transaction.type === 'transfer') {
        body = {
          from_wallet_id: parseInt(fromWalletId),
          to_wallet_id: parseInt(toWalletId),
          amount: parsedAmount,
          note: note || undefined,
          occurred_at: formattedDateTime,
        };
      } else {
        body = {
          wallet_id: parseInt(walletId),
          category_id: categoryId ? parseInt(categoryId) : null,
          amount: parsedAmount,
          note: note || undefined,
          occurred_at: formattedDateTime,
        };
      }

      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        onError(error.error || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
      onError('Failed to update transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setValidationError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-[24px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)] border-[var(--color-divider)]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-[20px] font-semibold text-[var(--color-text)]">Edit transaction</DialogTitle>
            <DialogDescription className="text-[12px] text-[var(--color-text-muted)]">Update transaction details</DialogDescription>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2D2D2D] text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
            aria-label="Close"
          >
            ✕
          </button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">

          {validationError && (
            <div className="rounded-[16px] border border-[var(--color-negative)] bg-[rgba(239,68,68,0.15)] px-4 py-3 text-[12px] text-[var(--color-negative)]">
              {validationError}
            </div>
          )}

          {/* Transaction Type (Locked/Display Only) */}
          <div className="space-y-2">
            <span className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
              Transaction type
            </span>
            <div className={`rounded-full px-4 py-2 text-center text-[14px] font-medium ${
              transaction.type === 'expense'
                ? 'bg-[rgba(239,68,68,0.15)] text-[var(--color-negative)]'
                : transaction.type === 'income'
                ? 'bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]'
                : 'bg-[rgba(167,139,250,0.15)] text-[var(--color-accent)]'
            }`}>
              {transaction.type === 'expense' ? 'Expense' : transaction.type === 'income' ? 'Income' : 'Transfer'}
            </div>
          </div>

          {transaction.type === 'transfer' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fromWallet" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
                  From wallet
                </label>
                <CustomSelect
                  id="fromWallet"
                  value={fromWalletId}
                  onValueChange={setFromWalletId}
                  options={wallets.map((w) => ({ value: w.id.toString(), label: w.name }))}
                  placeholder={loadingTransferData ? 'Loading...' : 'Select wallet'}
                  disabled={loadingTransferData || submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="toWallet" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
                  To wallet
                </label>
                <CustomSelect
                  id="toWallet"
                  value={toWalletId}
                  onValueChange={setToWalletId}
                  options={wallets
                    .filter((w) => w.id.toString() !== fromWalletId)
                    .map((w) => ({ value: w.id.toString(), label: w.name }))}
                  placeholder={loadingTransferData ? 'Loading...' : 'Select wallet'}
                  disabled={loadingTransferData || submitting}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="wallet" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
                  Wallet
                </label>
                <CustomSelect
                  id="wallet"
                  value={walletId}
                  onValueChange={setWalletId}
                  options={wallets.map((w) => ({ value: w.id.toString(), label: w.name }))}
                  placeholder="Select wallet"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
                  Category (optional)
                </label>
                <CustomSelect
                  id="category"
                  value={categoryId || 'none'}
                  onValueChange={(val) => setCategoryId(val === 'none' ? '' : val)}
                  options={[
                    { value: 'none', label: 'Uncategorized' },
                    ...filteredCategories.map((c) => ({ value: c.id.toString(), label: c.name }))
                  ]}
                  placeholder="Select category"
                  disabled={submitting}
                />
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={submitting || loadingTransferData}
              className="flex-1 rounded-full bg-[var(--color-accent)] px-4 py-3 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              {submitting ? 'Updating...' : 'Update transaction'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 rounded-full border border-[var(--color-divider)] bg-[#2D2D2D] px-4 py-3 text-[14px] font-semibold text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
