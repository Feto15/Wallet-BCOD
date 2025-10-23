import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <h1 className="text-[48px] font-bold">404</h1>
      <p className="text-[16px] text-[var(--color-text-muted)]">Page not found</p>
      <Link
        href="/"
        className="rounded-full bg-[var(--color-accent)] px-6 py-2 text-[14px] font-semibold text-black transition-all duration-200 ease-in-out hover:brightness-110"
      >
        Go Home
      </Link>
    </div>
  );
}
