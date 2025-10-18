'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  // Hide header on these pages
  const hideHeaderPages = ['/transactions', '/wallets', '/categories'];
  const shouldHideHeader = hideHeaderPages.includes(pathname);

  if (shouldHideHeader) return null;

  return (
    <header className="mx-auto flex w-full max-w-[390px] items-center justify-between px-4 py-4">
      <Link href="/" className="text-[24px] font-semibold tracking-[0.2px]">
        Belanja COD Wallet
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2E2E2E] text-[18px] text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
          aria-label="Add transaction"
        >
          +
        </button>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2E2E2E] text-[18px] text-[var(--color-text)] transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95"
          aria-label="Open settings"
        >
          ⚙
        </button>
      </div>
    </header>
  );
}
