import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
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
            <Header />

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
