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
      {/* Glassmorphism style: semi-transparent bg, strong blur, subtle border */}
      <div className="pointer-events-auto flex w-full max-w-[390px] items-center justify-between rounded-full bg-[rgba(255,255,255,0.05)] px-4 py-2 backdrop-blur-2xl border border-[rgba(255,255,255,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium transition-all duration-200 ease-in-out ${
                isActive 
                  ? 'text-[var(--color-accent)] bg-[rgba(255,255,255,0.1)]' 
                  : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.05)]'
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
