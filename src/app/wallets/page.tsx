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
              {/* Header: Icon, Name & Menu */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {/* Wallet Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  
                  {/* Wallet Name & Type */}
                  <div>
                    <h3 className="text-[16px] font-semibold">{wallet.name}</h3>
                    <p className="text-[12px] text-[var(--color-text-muted)]">Rekening Bank</p>
                  </div>
                </div>

                {/* Three-dot Menu Button (Kebab Menu) */}
                <button
                  onClick={() => setDeleteConfirm(deleteConfirm === wallet.id ? null : wallet.id)}
                  className="text-[20px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] -mt-1"
                >
                  ⋮
                </button>
              </div>

              {/* Balance */}
              {summary && (
                <>
                  <div className="mb-3">
                    <p className="text-[28px] font-bold leading-tight">
                      {formatIDR(summary.net)}
                    </p>
                  </div>

                  {/* Income & Expense Row */}
                  <div className="flex gap-4">
                    {/* Income */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[var(--color-positive)] text-[14px]">↗</span>
                        <span className="text-[12px] text-[var(--color-positive)]">Pemasukan</span>
                      </div>
                      <p className="text-[15px] font-medium">{formatIDR(summary.income)}</p>
                    </div>

                    {/* Expense */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[var(--color-negative)] text-[14px]">↘</span>
                        <span className="text-[12px] text-[var(--color-negative)]">Pengeluaran</span>
                      </div>
                      <p className="text-[15px] font-medium">{formatIDR(summary.expense)}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Bottom Sheet Options */}
              {deleteConfirm === wallet.id && (
                <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setDeleteConfirm(null)}>
                  {/* Backdrop */}
                  <div className="absolute inset-0 bg-black/60" />
                  
                  {/* Bottom Sheet */}
                  <div 
                    className="relative w-full max-w-[390px] rounded-t-[24px] bg-[var(--color-surface)] pb-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Handle Bar */}
                    <div className="flex justify-center py-3">
                      <div className="h-1 w-12 rounded-full bg-[var(--color-divider)]" />
                    </div>

                    {/* Title */}
                    <div className="px-6 pb-2">
                      <h3 className="text-[18px] font-semibold">Opsi</h3>
                    </div>

                    {/* Options */}
                    <div className="border-t border-[var(--color-divider)]">
                      {/* Edit Option */}
                      <button
                        className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-[rgba(255,255,255,0.05)]"
                        onClick={() => {
                          alert('Edit feature coming soon!');
                          setDeleteConfirm(null);
                        }}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-[16px]">Edit Dompet</span>
                      </button>

                      {/* Delete Option */}
                      <button
                        className="flex w-full items-center gap-3 px-6 py-4 text-left text-[var(--color-negative)] hover:bg-[rgba(239,68,68,0.1)]"
                        onClick={() => handleDelete(wallet.id, wallet.name)}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="text-[16px]">Hapus Dompet</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
