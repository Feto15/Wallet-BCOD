# AGENTS.md — Belanja COD Wallet (Web)

Scope: Berlaku untuk seluruh repository ini (semua subdirektori) kecuali ada AGENTS.md yang lebih dalam dan menimpa aturan di area tersebut.

## Project Overview
- Tujuan: Aplikasi web single user untuk mencatat pemasukan, pengeluaran, dan transfer antar-wallet dengan input cepat dan laporan dasar.
- Domain utama:
  - Mata uang default `IDR`; jumlah disimpan sebagai integer rupiah (minor units).
  - Format tanggal input `YYYY-MM-DD HH:mm`. Simpan UTC di DB; konversi di UI sesuai lokal.
  - Transfer = 1 event → 2 baris transaksi, diikat oleh `transfer_group_id`.
  - v1.2: Archive (`is_archived`) dihapus. Gunakan hard delete dengan FK: wallets → transactions ON DELETE CASCADE; categories → transactions ON DELETE SET NULL; transfer_groups → transactions ON DELETE CASCADE.
- Teknologi (aktual di repo `APP/`): Next.js 15 (App Router) + TypeScript + Tailwind v4, REST API (route handler), PostgreSQL + Drizzle ORM, SWR, dayjs. Paket manager: `pnpm` (wajib).
- Non-goals: Multi-tenant dan autentikasi kompleks (single user saja).

Catatan struktur: Aplikasi Next.js berada di folder `APP/`. Jalankan seluruh perintah (dev/build/migrasi/seed) dari dalam direktori `APP/`.

## Build and Test Commands
- Prasyarat: Node LTS, pnpm, akses database PostgreSQL (contoh: Supabase). Siapkan `.env.local`.
- Environment
  - `DATABASE_URL=postgres://...`
  - `NEXT_PUBLIC_APP_NAME=Belanja COD Wallet`
- Instalasi
  - Di dalam `APP/`: `pnpm install`
- Database (Drizzle)
  - Generate migrasi: `pnpm db:generate`
  - Apply migrasi: `pnpm db:migrate` (menjalankan `scripts/migrate.js` khusus repo ini)
  - Studio (opsional): `pnpm db:studio`
  - Seed (opsional): `pnpm db:seed`
- Development
  - Jalankan dev server: `pnpm dev`
- Production
  - Build: `pnpm build`
  - Start: `pnpm start`
- Testing
  - Lihat panduan cepat: `APP/QUICK_START_TESTING_GUIDE.md`
  - Dokumentasi v1.2: `APP/V1.2_MANUAL_TESTING_CHECKLIST.md`, `APP/V1.2_API_TEST_RESULTS.md`
  - Unit/Integration (opsional): belum disiapkan; rekomendasi alat di bagian “Testing Instructions”.

## Code Style Guidelines
- Bahasa & Type
  - Gunakan TypeScript ketat; hindari `any` tanpa alasan kuat.
  - Validasi semua input API dengan Zod. Jangan percaya input klien.
- Struktur & Penamaan
  - API routes (REST): `src/app/api/...`
  - Halaman: `src/app/...`
  - DB: `src/db/schema.ts`, `src/db/client.ts`
  - Util: `src/lib/*` (format uang/tanggal, skema Zod, helper umum)
  - Komponen UI: `src/components/*`
- Praktik Data
  - Simpan `amount` sebagai integer rupiah. Format tampilan via `Intl.NumberFormat('id-ID', { currency: 'IDR', style: 'currency' })`.
  - `occurred_at` untuk urutan bisnis; `created_at` untuk audit/tracking.
  - Normalisasi tanggal API: konversi string `occurred_at` (format `YYYY-MM-DD HH:mm`) menjadi `Date` (UTC) di server untuk semua operasi tulis (POST & PATCH) sebelum menyimpan ke DB.
  - Implementasikan transfer sebagai 2 baris terpisah dalam satu transaksi DB (atomic).
  - v1.2: Terapkan ON DELETE sesuai: walletId → CASCADE; categoryId → SET NULL; transferGroupId → CASCADE.
  - ID entity saat ini adalah integer (serial). Validasi input gunakan Zod dengan angka bilangan bulat positif.
- Konsistensi UI
  - Gunakan Tailwind; komponen form dengan aksesibilitas dasar (label, focus ring, keyboard).
  - Default sorting data di UI: `occurred_at desc`.
  - Animasi: gunakan `.shimmer` hanya untuk skeleton saat loading; gunakan `.fade-in-up` untuk konten final. Jangan kombinasikan fade-in pada skeleton agar tidak invisible saat delay.
  - Pola layering konten: bungkus tiap kartu dalam wrapper `relative rounded-[20px] overflow-hidden`; render skeleton sebagai overlay `absolute inset-0 shimmer pointer-events-none z-0`; render konten sebagai `relative z-10 ... fade-in-up` dengan `animationDelay` untuk stagger.
  - Aksesibilitas motion: hormati `prefers-reduced-motion` (matikan animasi pada `.shimmer`/`.fade-in-up`).
  - Pola aksi per-item: gunakan tombol kebab `⋮` untuk membuka modal opsi (Edit / Hapus); hindari bottom sheet kecuali diperlukan.

## Testing Instructions
- Alat (disarankan)
  - Unit: Vitest
  - API: Supertest atau Next.js request test helpers
  - Util tanggal/uang: unit test murni
- Cakupan Minimum
  - Utils: parsing/formatting uang dan tanggal.
  - Validasi: skema Zod untuk semua endpoint (nilai positif, enum type, larangan `category_id` untuk transfer, dll.).
  - API Transactions:
    - Expense/Income: buat 1 baris.
    - Transfer: buat `transfer_group` + 2 baris; kedua baris share `occurred_at` dan `note`.
  - Deletion (v1.2):
    - Hapus wallet → transaksi ikut hilang (cascade).
    - Hapus kategori → transaksi tetap ada & `category_id` menjadi NULL.
  - Agregasi:
    - `/api/balances`: saldo per wallet benar untuk kombinasi expense/income/transfer.
    - `/api/reports/monthly-summary`: total per kategori per bulan filter `type in ('expense','income')`.
  - Summary per wallet (v1.2):
    - `/api/wallets/[id]/summary` menghitung income, expense, net, uncategorized dengan exclude transfer.
- Manual testing cepat: ikuti `APP/QUICK_START_TESTING_GUIDE.md`.
- QA Manual (Acceptance)
  - Delete wallet memerlukan konfirmasi; setelah dihapus, transaksi terkait ikut hilang.
  - Delete category memerlukan konfirmasi; transaksi terkait menjadi “Uncategorized”.
  - Summary per wallet tampil 4 angka (income, expense, net, uncategorized); exclude transfer.
  - Filter transaksi (tanggal, wallet, kategori, type) bekerja.

## Security Considerations
- Cakupan & Model
  - Single user; tidak ada multi-tenant. Jangan menambahkan konsep `user_id` di data model kecuali disetujui eksplisit.
- Validasi & Logika
  - Validasi ketat di server: `amount > 0`, `type` valid, `category_id` null untuk transfer.
  - v1.2: Hard delete aktif; cegah hapus wallet default (jika konsep itu ada).
  - Gunakan Drizzle (query parametrik) untuk mencegah SQL injection.
  - Bungkus pembuatan transfer (group + 2 baris) dalam transaksi DB (BEGIN/COMMIT) agar atomic.
- Rahasia & Konfigurasi
  - Simpan kredensial hanya di server-side. Jangan expose `DATABASE_URL` ke klien.
  - Env melalui Vercel/Supabase secrets; jangan commit `.env*`.
- Hardening API
  - Sanitasi error (jangan bocorkan detail stack/SQL ke klien; balas pesan singkat).
  - Rate limit (opsional) untuk endpoint tulis jika dibutuhkan.
- Data & Kinerja
  - Buat index pada kolom query/aggregasi: `(wallet_id, created_at)`, `(category_id)`, `transfer_group_id`; opsional `occurred_at` untuk sorting UI.
  - Gunakan batasan DB: FK (dengan ON DELETE seperti di atas), `check (amount > 0)`, `check (type in (...))`, dan constraint `category_id is null when type='transfer'`.

---
Catatan untuk kontributor/agent: Patuhi panduan ini saat menambah file atau mengubah logic. Jika ada konflik dengan instruksi langsung pengguna, ikuti instruksi pengguna. Jika Anda menambah file baru, gunakan struktur direktori di atas dan simpan scope single-user tanpa menambah autentikasi kecuali diminta.
