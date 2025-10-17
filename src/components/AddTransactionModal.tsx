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

      let body: any;

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
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add New Transaction
                </h3>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{validationError}</p>
                </div>
              )}

              {/* Transaction Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransactionType('expense')}
                    className={`px-4 py-2 rounded-md font-medium ${
                      transactionType === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('income')}
                    className={`px-4 py-2 rounded-md font-medium ${
                      transactionType === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('transfer')}
                    className={`px-4 py-2 rounded-md font-medium ${
                      transactionType === 'transfer'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Transfer
                  </button>
                </div>
              </div>

              {/* Conditional Fields */}
              {transactionType === 'transfer' ? (
                <>
                  {/* From Wallet */}
                  <div className="mb-4">
                    <label htmlFor="fromWallet" className="block text-sm font-medium text-gray-700 mb-1">
                      From Wallet
                    </label>
                    <select
                      id="fromWallet"
                      value={fromWalletId}
                      onChange={(e) => setFromWalletId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  {/* To Wallet */}
                  <div className="mb-4">
                    <label htmlFor="toWallet" className="block text-sm font-medium text-gray-700 mb-1">
                      To Wallet
                    </label>
                    <select
                      id="toWallet"
                      value={toWalletId}
                      onChange={(e) => setToWalletId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </>
              ) : (
                <>
                  {/* Wallet */}
                  <div className="mb-4">
                    <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet
                    </label>
                    <select
                      id="wallet"
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  {/* Category */}
                  <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </>
              )}

              {/* Amount */}
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (Rp)
                </label>
                <input
                  type="text"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                  required
                />
                {amount && (
                  <p className="mt-1 text-sm text-gray-500">
                    = {formatIDR(parseMoneyInput(amount))}
                  </p>
                )}
              </div>

              {/* Date & Time */}
              <div className="mb-4">
                <label htmlFor="occurredAt" className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="occurredAt"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Note */}
              <div className="mb-4">
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a note..."
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Transaction'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}
