'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: { id: number; name: string };
  onDelete: (id: number, name: string) => Promise<void>;
}

export default function DeleteWalletModal({ isOpen, onClose, wallet, onDelete }: DeleteWalletModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onDelete(wallet.id, wallet.name);
      onClose();
    } catch (error) {
      console.error('Failed to delete wallet:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full max-w-[390px] rounded-[24px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-float)] border-[var(--color-divider)]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-[20px] font-semibold text-[var(--color-text)]">Hapus Dompet</DialogTitle>
          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="text-[24px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            aria-label="Close"
          >
            ×
          </button>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-[14px] text-[var(--color-text-muted)]">
            Apakah Anda yakin ingin menghapus dompet <span className="font-semibold text-[var(--color-text)]">{wallet.name}</span>?
          </p>
          <p className="text-[14px] text-[var(--color-negative)]">
            Semua transaksi terkait akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={deleting}
              className="flex-1 rounded-full bg-[var(--color-divider)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-full bg-[var(--color-negative)] px-4 py-2.5 text-[14px] font-semibold text-white transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
