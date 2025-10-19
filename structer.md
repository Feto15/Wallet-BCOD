 # Struktur & Isi Proyek — Belanja COD Wallet (Web)

Dokumen ini merangkum struktur folder dan berkas utama dalam proyek ini agar cepat dipahami dan dinavigasi.

## Ringkasan
- Monorepo sederhana dengan dokumen perencanaan di root dan aplikasi web di `APP/`.
- Stack utama: Next.js (App Router) + TypeScript + Tailwind, REST API (route handler), PostgreSQL + Drizzle ORM, manajer paket `pnpm`.
- Single user; tanpa multi-tenant. Detail domain ada di `PROJECT_PLAN.md`.

## Struktur Direktori (tingkat tinggi)
- `PROJECT_PLAN.md` — Rencana produk/proyek.
- `IMPLEMENTATION_PLAN.md` — Tahapan implementasi teknis.
- `AGENTS.md` — Panduan untuk kontributor/agent (overview, command, style, testing, security).
- `APP/` — Seluruh source code aplikasi (Next.js + API + DB + scripts).

## APP/ — Isi dan Peran

Konfigurasi & metadata:
- `APP/package.json` — Skrip dan dependensi proyek app.
- `APP/pnpm-lock.yaml` — Lockfile package manager.
- `APP/tsconfig.json` — Konfigurasi TypeScript.
- `APP/eslint.config.mjs` — Aturan linting.
- `APP/postcss.config.mjs` — Konfigurasi Tailwind/PostCSS.
- `APP/next.config.ts` — Konfigurasi Next.js.
- `APP/README.md` — Catatan proyek app (bila ada).

Dokumen pendukung implementasi/QC:
- `APP/design.md` — Catatan desain.
- `APP/STEP14_CHECKLIST.md`, `APP/STEP15_QA_CHECKLIST.md`, `APP/STEP15_QA_RESULTS.md`, `APP/STEP18_RISKS_MITIGATION.md` — Checklist QA dan mitigasi risiko.
- `APP/test-modal.html` — Halaman uji mandiri untuk modal (non-Next, statis).

Aset publik & stylesheet global:
- `APP/public/*.svg` — Ikon publik (next, vercel, globe, file, window).
- `APP/src/app/globals.css` — Gaya global Tailwind/utility.
- `APP/src/app/favicon.ico` — Favicon aplikasi.

Kode aplikasi (Next.js App Router):
- `APP/src/app/layout.tsx` — Root layout aplikasi.
- `APP/src/app/page.tsx` — Dashboard (halaman utama).
- `APP/src/app/transactions/page.tsx` — Halaman daftar transaksi + filter.
- `APP/src/app/wallets/page.tsx` — Halaman Wallets (CRUD, archive toggle).
- `APP/src/app/categories/page.tsx` — Halaman Categories (CRUD, archive toggle).

Route API (REST, server-side):
- `APP/src/app/api/wallets/route.ts` — `GET /api/wallets`, `POST /api/wallets`.
- `APP/src/app/api/wallets/[id]/archive/route.ts` — `PATCH /api/wallets/:id/archive`.
- `APP/src/app/api/categories/route.ts` — `GET/POST /api/categories`.
- `APP/src/app/api/categories/[id]/archive/route.ts` — `PATCH /api/categories/:id/archive`.
- `APP/src/app/api/transactions/route.ts` — `GET/POST /api/transactions` (expense/income/transfer).
- `APP/src/app/api/balances/route.ts` — `GET /api/balances` (saldo per wallet).
- `APP/src/app/api/reports/monthly-summary/route.ts` — `GET /api/reports/monthly-summary`.

Komponen & hooks UI:
- `APP/src/components/AddTransactionModal.tsx` — Modal tambah transaksi (Expense/Income/Transfer).
- `APP/src/components/Toast.tsx` — Komponen toast notifikasi.
- `APP/src/components/BottomNav.tsx` — Navigasi bawah (mobile-first).
- `APP/src/hooks/useToast.ts` — Hook state & util untuk toast.

Library utilitas & validasi:
- `APP/src/lib/utils.ts` — Helper format IDR, parser input uang, helper umum.
- `APP/src/lib/validation.ts` — Skema Zod (wallet, category, transaksi, query filter).

Database (Drizzle + PostgreSQL):
- `APP/src/db/schema.ts` — Definisi skema (wallets, categories, transfer_groups, transactions) + index/constraint.
- `APP/src/db/client.ts` — Inisialisasi koneksi `pg` + `drizzle` (server-side).
- `APP/drizzle.config.ts` — Konfigurasi Drizzle Kit (generate/migrate/studio).
- `APP/drizzle/0000_daily_turbo.sql` — Migrasi SQL hasil generate.
- `APP/drizzle/meta/*.json` — Metadata migrasi (journal/snapshot).

Skrip dev/ops:
- `APP/scripts/migrate.js` — Helper menjalankan migrasi di lingkungan tertentu.
- `APP/scripts/seed.ts` — Seed data demo (wallets, categories, sample transaksi).

Environment (tidak dikomit, contoh):
- `APP/.env.local` — Konfigurasi lokal (mis: `DATABASE_URL`, `NEXT_PUBLIC_APP_NAME`).

## Hubungan Modul Utama
- UI (pages + components) memanggil REST API route di `src/app/api/*` menggunakan fetch/SWR.
- API route menjalankan validasi Zod (`src/lib/validation.ts`), kemudian query ke database via Drizzle (`src/db/*`).
- Format uang disiapkan di UI via helper (`src/lib/utils.ts`), sementara nilai disimpan sebagai integer rupiah di DB (`schema.ts`).
- Transfer dibuat atomic (group + 2 baris transaksi) di endpoint transaksi.

## Navigasi Cepat (file kunci)
- Rencana Proyek: `PROJECT_PLAN.md`
- Rencana Implementasi: `IMPLEMENTATION_PLAN.md`
- Panduan Kontributor/Agent: `AGENTS.md`
- Skema DB: `APP/src/db/schema.ts`
- API Transaksi: `APP/src/app/api/transactions/route.ts`
- Saldo Wallet: `APP/src/app/api/balances/route.ts`
- Ringkasan Bulanan: `APP/src/app/api/reports/monthly-summary/route.ts`
- Modal Tambah Transaksi: `APP/src/components/AddTransactionModal.tsx`
- Validasi Zod: `APP/src/lib/validation.ts`
- Util Format IDR: `APP/src/lib/utils.ts`

## Catatan
- Manajer paket: selalu gunakan `pnpm`.
- Default sorting di UI & API: `occurred_at desc`.
- Archived (`is_archived=true`) disembunyikan dari input baru, riwayat tetap tampil.

