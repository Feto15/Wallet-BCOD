'use client';

import { useEffect, useState } from 'react';
import { deleteWalletAction } from '@/actions/wallets';
import { useRouter } from 'next/navigation';
import AddWalletModal from '@/components/AddWalletModal';

interface Wallet {
  id: number;
  name: string;
  currency: string;
  createdAt: string;
}

interface WalletSummary {
  income: number;
  expense: number;
  net: number;
  uncategorized: number;
}

export default function WalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletSummaries, setWalletSummaries] = useState<Record<number, WalletSummary>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallets');
      const data = await res.json();
      setWallets(data);
      
      // Fetch summary for each wallet
      const summaries: Record<number, WalletSummary> = {};
      await Promise.all(
        data.map(async (wallet: Wallet) => {
          try {
            const summaryRes = await fetch(`/api/wallets/${wallet.id}/summary`);
            if (summaryRes.ok) {
              summaries[wallet.id] = await summaryRes.json();
            }
          } catch (err) {
            console.error(`Failed to fetch summary for wallet ${wallet.id}:`, err);
          }
        })
      );
      setWalletSummaries(summaries);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleModalSuccess = async () => {
    await fetchWallets();
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const formData = new FormData();
      formData.append('id', id.toString());

      const result = await deleteWalletAction(formData);

      if (result.success) {
        // Show success message
        alert(result.message || 'Wallet deleted successfully');
        setDeleteConfirm(null);
        // Refresh the list
        await fetchWallets();
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete wallet');
      }
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      alert('Failed to delete wallet');
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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
    <>
      <AddWalletModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />
      
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[24px] font-semibold tracking-[0.2px]">Wallets</h1>
            <p className="text-[14px] text-[var(--color-text-muted)]">
              Manage where your money lives
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
        {wallets.map((wallet) => {
          const summary = walletSummaries[wallet.id];
          return (
            <div
              key={wallet.id}
              className="rounded-[20px] bg-[var(--color-card)] p-4 shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[16px] font-semibold">{wallet.name}</p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">{wallet.currency}</p>
                </div>
              </div>

              {/* Wallet Summary */}
              {summary && (
                <div className="mt-3 space-y-2 border-t border-[var(--color-divider)] pt-3">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[var(--color-text-muted)]">Income</span>
                    <span className="text-[var(--color-positive)] font-medium">
                      +{formatIDR(summary.income)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[var(--color-text-muted)]">Expense</span>
                    <span className="text-[var(--color-negative)] font-medium">
                      -{formatIDR(summary.expense)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px] font-semibold">
                    <span>Net</span>
                    <span className={summary.net >= 0 ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}>
                      {formatIDR(summary.net)}
                    </span>
                  </div>
                  {summary.uncategorized > 0 && (
                    <div className="flex justify-between text-[12px]">
                      <span className="text-[var(--color-text-muted)]">Uncategorized</span>
                      <span className="text-[var(--color-text-muted)]">
                        {formatIDR(summary.uncategorized)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Button */}
              <div className="mt-3 pt-3 border-t border-[var(--color-divider)]">
                {deleteConfirm === wallet.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(wallet.id, wallet.name)}
                      className="flex-1 rounded-full bg-[var(--color-negative)] px-3 py-2 text-[14px] font-semibold text-white transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 rounded-full bg-[#2E2E2E] px-3 py-2 text-[14px] font-semibold text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(wallet.id)}
                    className="text-[12px] text-[var(--color-negative)] underline"
                  >
                    Delete wallet
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {wallets.length === 0 && (
          <div className="rounded-[20px] bg-[var(--color-card)] p-6 text-center text-[var(--color-text-muted)] shadow-[var(--shadow-md)]">
            <p>No wallets yet. Tap &quot;+ Add&quot; to create one.</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
