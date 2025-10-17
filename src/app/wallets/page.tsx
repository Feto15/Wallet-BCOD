'use client';

import { useEffect, useState } from 'react';

interface Wallet {
  id: number;
  name: string;
  currency: string;
  isArchived: boolean;
  createdAt: string;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallets?include_archived=true');
      const data = await res.json();
      setWallets(data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWalletName }),
      });

      if (res.ok) {
        setNewWalletName('');
        setShowForm(false);
        await fetchWallets();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create wallet');
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
      alert('Failed to create wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm('Are you sure you want to archive this wallet?')) return;

    try {
      const res = await fetch(`/api/wallets/${id}/archive`, {
        method: 'PATCH',
      });

      if (res.ok) {
        await fetchWallets();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to archive wallet');
      }
    } catch (error) {
      console.error('Failed to archive wallet:', error);
      alert('Failed to archive wallet');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 rounded-full bg-[var(--color-divider)]" />
        <div className="space-y-3">
          {[1, 2].map((s) => (
            <div key={s} className="h-20 rounded-[20px] bg-[rgba(30,30,30,0.6)] shadow-[var(--shadow-md)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-[24px] font-semibold tracking-[0.2px]">Wallets</h1>
          <p className="text-[14px] text-[var(--color-text-muted)]">
            Manage where your money lives
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
        >
          {showForm ? 'Close' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-[20px] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-md)]">
          <h3 className="text-[16px] font-semibold">Create new wallet</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="wallet-name"
                className="text-[12px] font-medium uppercase tracking-[0.2px] text-[var(--color-text-muted)]"
              >
                Wallet name
              </label>
              <input
                type="text"
                id="wallet-name"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                className="w-full rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-bg)] px-4 py-3 text-[14px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="e.g., BCA, Cash, Mandiri"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create wallet'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="rounded-[20px] bg-[var(--color-card)] p-4 shadow-[var(--shadow-md)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[16px] font-semibold">{wallet.name}</p>
                <p className="text-[12px] text-[var(--color-text-muted)]">{wallet.currency}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${
                  wallet.isArchived
                    ? 'bg-[rgba(115,115,115,0.2)] text-[var(--color-text-muted)]'
                    : 'bg-[rgba(34,197,94,0.15)] text-[var(--color-positive)]'
                }`}
              >
                {wallet.isArchived ? 'Archived' : 'Active'}
              </span>
            </div>
            {!wallet.isArchived && (
              <button
                onClick={() => handleArchive(wallet.id)}
                className="mt-3 text-[12px] text-[var(--color-negative)] underline"
              >
                Archive wallet
              </button>
            )}
          </div>
        ))}

        {wallets.length === 0 && (
          <div className="rounded-[20px] bg-[var(--color-card)] p-6 text-center text-[var(--color-text-muted)] shadow-[var(--shadow-md)]">
            <p>No wallets yet. Tap &quot;+ Add&quot; to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
