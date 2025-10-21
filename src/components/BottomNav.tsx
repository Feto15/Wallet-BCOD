'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavigationMenu from '@/components/ui/navigation-menu';
import { ComponentType } from 'react';

type IconProps = { className?: string };

const DashboardIcon: ComponentType<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TransactionsIcon: ComponentType<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 8h10l-2.5-2.5M17 16H7l2.5 2.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WalletIcon: ComponentType<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3.5"
      y="7"
      width="17"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M17 12.5h1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M20.5 10V9a2 2 0 0 0-2-2h-9.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const TagIcon: ComponentType<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.5 12.5V6A1.5 1.5 0 0 1 6 4.5h6.5L20 12l-5.5 5.5L4.5 12.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle
      cx="9"
      cy="9"
      r="1"
      fill="currentColor"
    />
  </svg>
);

const NAV_ITEMS: Array<{ href: string; label: string; icon: ComponentType<IconProps> }> = [
  { href: '/', label: 'Dashboard', icon: DashboardIcon },
  { href: '/transactions', label: 'Transactions', icon: TransactionsIcon },
  { href: '/wallets', label: 'Wallets', icon: WalletIcon },
  { href: '/categories', label: 'Categories', icon: TagIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none sticky bottom-4 flex w-full justify-center px-4">
      <NavigationMenu.Root className="pointer-events-auto w-full max-w-[390px]">
        <NavigationMenu.List className="flex items-center justify-between rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <NavigationMenu.Item key={item.href} className="flex-1">
                <NavigationMenu.Link asChild>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={`flex flex-col items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-[rgba(255,255,255,0.12)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive
                          ? 'text-[var(--color-accent)]'
                          : 'text-[var(--color-text-muted)]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
        <NavigationMenu.Viewport className="hidden" />
      </NavigationMenu.Root>
    </nav>
  );
}
