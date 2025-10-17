import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Belanja COD Wallet",
  description: "Simple wallet management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} font-sans bg-[var(--color-bg)] text-[var(--color-text)] antialiased`}
      >
        <div className="flex min-h-screen flex-col items-center">
          <div className="safe-area-padded flex w-full flex-1 flex-col">
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

            <main className="mx-auto w-full max-w-[390px] flex-1 px-4 pb-24">
              {children}
            </main>
          </div>

          <BottomNav />
        </div>
      </body>
    </html>
  );
}
