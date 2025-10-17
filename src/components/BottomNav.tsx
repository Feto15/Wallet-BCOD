'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/transactions', label: 'Transactions', icon: '⇄' },
  { href: '/wallets', label: 'Wallets', icon: '👛' },
  { href: '/categories', label: 'Categories', icon: '🏷' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none sticky bottom-4 flex w-full justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-[390px] items-center justify-between rounded-full bg-[rgba(24,24,24,0.9)] px-4 py-2 backdrop-blur-xl shadow-[var(--shadow-float)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium transition-colors duration-200 ease-in-out ${
                isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
              }`}
              aria-label={item.label}
            >
              <span className="text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
