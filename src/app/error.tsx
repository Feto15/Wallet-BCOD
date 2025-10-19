'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <h1 className="text-[48px] font-bold">Error</h1>
      <p className="text-[16px] text-[var(--color-text-muted)]">
        {error.message || 'Something went wrong'}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-[var(--color-accent)] px-6 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110"
      >
        Try Again
      </button>
    </div>
  );
}
