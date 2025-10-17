'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="flex min-w-[280px] items-center gap-3 rounded-[16px] border border-[var(--color-divider)] bg-[var(--color-surface)] px-5 py-4 text-[14px] text-[var(--color-text)] shadow-[var(--shadow-lg)]">
        <span className="text-[18px]">
          {type === 'success' && '✅'}
          {type === 'error' && '⚠️'}
          {type === 'info' && '💡'}
        </span>
        <span className="flex-1 leading-snug text-[var(--color-text-muted)]">{message}</span>
        <button
          onClick={onClose}
          className="text-[var(--color-text)] hover:text-[var(--color-accent)]"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
}
