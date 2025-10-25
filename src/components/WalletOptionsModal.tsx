'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Wallet {
  id: number;
  name: string;
  currency: string;
  createdAt: string;
}

interface WalletOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet;
  onSelectEdit: (wallet: Wallet) => void;
  onSelectDelete: (wallet: Wallet) => void;
}

export default function WalletOptionsModal({
  isOpen,
  onClose,
  wallet,
  onSelectEdit,
  onSelectDelete,
}: WalletOptionsModalProps) {
  const handleEdit = () => {
    onSelectEdit(wallet);
    onClose();
  };

  const handleDelete = () => {
    onSelectDelete(wallet);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[390px] rounded-[24px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-float)] border-[var(--color-divider)]" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-[20px] font-semibold text-[var(--color-text)]">Opsi Dompet</DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="text-[24px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            aria-label="Close"
          >
            ×
          </button>
        </DialogHeader>

        <div className="space-y-2">
          {/* Edit Option */}
          <button
            type="button"
            onClick={handleEdit}
            className="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left transition-colors hover:bg-[var(--color-divider)]"
          >
            <svg className="h-5 w-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-[14px] font-medium text-[var(--color-text)]">Edit Dompet</span>
          </button>

          {/* Delete Option */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left transition-colors hover:bg-[rgba(239,68,68,0.1)]"
          >
            <svg className="h-5 w-5 text-[var(--color-negative)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-[14px] font-medium text-[var(--color-negative)]">Hapus Dompet</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
