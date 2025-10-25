'use client';

import { useEffect, useState } from 'react';
import { deleteWalletAction } from '@/actions/wallets';
import { useRouter } from 'next/navigation';
import AddWalletModal from '@/components/AddWalletModal';
import EditWalletModal from '@/components/EditWalletModal';
import DeleteWalletModal from '@/components/DeleteWalletModal';
import WalletOptionsModal from '@/components/WalletOptionsModal';

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

interface WalletBalance {
  walletId: number;
  balance: number;
}

export default function WalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletSummaries, setWalletSummaries] = useState<Record<number, WalletSummary>>({});
  const [walletBalances, setWalletBalances] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editWallet, setEditWallet] = useState<Wallet | null>(null);
  const [deleteWallet, setDeleteWallet] = useState<Wallet | null>(null);
  const [optionsWallet, setOptionsWallet] = useState<Wallet | null>(null);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallets');
      const data = await res.json();
      setWallets(data);
      
      // Batch fetch balances and summaries in parallel (only 2 requests total)
      try {
        const [balancesRes, summariesRes] = await Promise.all([
          fetch('/api/balances'),
          fetch('/api/wallets/summaries'),
        ]);

        if (balancesRes.ok) {
          const balancesData: WalletBalance[] = await balancesRes.json();
          const balanceMap: Record<number, number> = {};
          for (const b of balancesData) {
            balanceMap[b.walletId] = b.balance;
          }
          setWalletBalances(balanceMap);
        }

        if (summariesRes.ok) {
          const summariesData: Array<WalletSummary & { walletId: number }> = await summariesRes.json();
          const summaryMap: Record<number, WalletSummary> = {};
          for (const s of summariesData) {
            summaryMap[s.walletId] = {
              income: s.income,
              expense: s.expense,
              net: s.net,
              uncategorized: s.uncategorized,
            };
          }
          setWalletSummaries(summaryMap);
        }
      } catch (err) {
        console.error('Failed to fetch balances or summaries:', err);
      }
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
    router.refresh();
  };

  const handleEditSuccess = async () => {
    await fetchWallets();
    router.refresh();
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const formData = new FormData();
      formData.append('id', id.toString());

      const result = await deleteWalletAction(formData);

      if (result.success) {
        // Show success message
        alert(result.message || 'Wallet deleted successfully');
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
        <div className="shimmer h-6 w-32 rounded-full" />
        <div className="space-y-3">
          {[1, 2].map((s) => (
            <div key={s} className="shimmer h-20 rounded-[20px] shadow-[var(--shadow-md)]" />
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
      
      {editWallet && (
        <EditWalletModal
          isOpen={!!editWallet}
          onClose={() => setEditWallet(null)}
          wallet={editWallet}
          onSuccess={handleEditSuccess}
        />
      )}

      {deleteWallet && (
        <DeleteWalletModal
          isOpen={!!deleteWallet}
          onClose={() => setDeleteWallet(null)}
          wallet={deleteWallet}
          onDelete={handleDelete}
        />
      )}

      {optionsWallet && (
        <WalletOptionsModal
          isOpen={!!optionsWallet}
          onClose={() => setOptionsWallet(null)}
          wallet={optionsWallet}
          onSelectEdit={(w) => setEditWallet(w)}
          onSelectDelete={(w) => setDeleteWallet(w)}
        />
      )}
      
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
              {/* Header: Icon, Name & Buttons */}
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
                    <p className="text-[12px] text-[var(--color-text-muted)]"></p>
                  </div>
                </div>

                {/* Kebab Menu Button */}
                <button
                  onClick={() => setOptionsWallet(wallet)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 text-[20px] leading-none"
                  aria-label="Wallet options"
                >
                  ⋮
                </button>
              </div>

              {/* Balance */}
              {summary && (
                <>
                  <div className="mb-3">
                    <p className="text-[28px] font-bold leading-tight">
                      {formatIDR(walletBalances[wallet.id] ?? 0)}
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
