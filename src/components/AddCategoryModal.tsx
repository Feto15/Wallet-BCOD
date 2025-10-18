'use client';

import { useState } from 'react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Category name is required');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(),
          type 
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create category');
      }

      // Success
      setName('');
      setType('expense');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create category:', error);
      setValidationError(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setName('');
      setType('expense');
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
          <h2 className="text-[20px] font-semibold">Create New Category</h2>
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
              htmlFor="category-name"
              className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]"
            >
              Category Name
            </label>
            <input
              type="text"
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              placeholder="e.g., Transport, Salary"
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <span className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]">
              Type
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                disabled={submitting}
                className={`rounded-full px-4 py-2.5 text-[14px] font-medium transition-all duration-200 ease-in-out ${
                  type === 'expense'
                    ? 'bg-[rgba(239,68,68,0.15)] text-[var(--color-negative)]'
                    : 'bg-[#2D2D2D] text-[var(--color-text-muted)] hover:brightness-110'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                disabled={submitting}
                className={`rounded-full px-4 py-2.5 text-[14px] font-medium transition-all duration-200 ease-in-out ${
                  type === 'income'
                    ? 'bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]'
                    : 'bg-[#2D2D2D] text-[var(--color-text-muted)] hover:brightness-110'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 rounded-full bg-[var(--color-divider)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
