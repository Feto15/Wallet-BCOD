'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavigationMenu from '@/components/ui/navigation-menu';
import {
  HomeIcon,
  ShuffleIcon,
  CardStackIcon,
  TokensIcon,
} from '@radix-ui/react-icons';
import { ComponentType } from 'react';

type IconType = ComponentType<{ className?: string }>;

const NAV_ITEMS: Array<{ href: string; label: string; icon: IconType }> = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/transactions', label: 'Transactions', icon: ShuffleIcon },
  { href: '/wallets', label: 'Wallets', icon: CardStackIcon },
  { href: '/categories', label: 'Categories', icon: TokensIcon },
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
