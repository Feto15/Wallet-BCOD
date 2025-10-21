# Migrasi shadcn/ui - Dokumentasi

## Ringkasan
Berhasil mengintegrasikan shadcn/ui ke dalam aplikasi Next.js wallet dengan mengganti modal custom dan native `<select>` dengan komponen shadcn/ui yang lebih accessible dan konsisten.

## Perubahan yang Dilakukan

### 1. Setup shadcn/ui
- ✅ Initialized shadcn/ui dengan `shadcn@latest init -y`
- ✅ Installed komponen: **Dialog**, **Select**, dan **Sonner** (toast)
- ✅ Dependencies baru ditambahkan:
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-select`
  - `clsx`, `tailwind-merge`
  - `lucide-react` (untuk icons)

### 2. Komponen yang Dibuat
#### `src/components/ui/custom-select.tsx`
Custom wrapper untuk shadcn/ui Select dengan styling yang sesuai tema aplikasi:
- Background gelap (`var(--color-bg)`)
- Border custom (`var(--color-divider)`)
- Focus ring ungu (`var(--color-accent)`)
- Rounded corners 16px (sesuai design system)
- Hover effects dengan brightness

### 3. Migrasi Modal Components

#### AddTransactionModal (`src/components/AddTransactionModal.tsx`)
**Perubahan:**
- ❌ Removed: Custom modal backdrop dan container
- ✅ Added: shadcn/ui `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`
- ✅ Replaced: Semua `<select>` dengan `CustomSelect` component
- ✅ Props tetap sama: `isOpen`, `onClose`, `onSuccess`, `onError`, `defaultType`, `lockType`
- ✅ Focus trap: Otomatis dari Radix Dialog
- ✅ Keyboard navigation: ESC untuk close, Tab untuk navigasi
- ✅ Animasi: Fade & zoom dari Radix (data-state animations)

**Select Components yang diganti:**
- From wallet select (transfer mode)
- To wallet select (transfer mode)
- Wallet select (expense/income mode)
- Category select (expense/income mode)

#### AddWalletModal (`src/components/AddWalletModal.tsx`)
**Perubahan:**
- ❌ Removed: Custom modal wrapper
- ✅ Added: shadcn/ui Dialog components
- ✅ Props tetap sama: `isOpen`, `onClose`, `onSuccess`
- ✅ Maintain existing validation dan submission logic
- ✅ Custom close button tetap (di-integrate dengan Dialog)

#### AddCategoryModal (`src/components/AddCategoryModal.tsx`)
**Perubahan:**
- ❌ Removed: Custom modal wrapper
- ✅ Added: shadcn/ui Dialog components
- ✅ Props tetap sama: `isOpen`, `onClose`, `onSuccess`
- ✅ Type selector buttons tetap (tidak perlu diganti, sudah accessible)

### 4. Utility Functions (`src/lib/utils.ts`)
**Issue:** shadcn init me-replace file utils.ts
**Fix:** Restore semua utility functions original + tambah `cn` dari shadcn:
- ✅ `formatIDR()` - Format currency ke Rupiah
- ✅ `parseMoneyInput()` - Parse input currency
- ✅ `formatDateTime()` - Format datetime-local
- ✅ `formatDate()` - Format date
- ✅ `getCurrentMonth()` - Get current month
- ✅ `cn()` - Shadcn className merger (clsx + tailwind-merge)

### 5. Toast Component
**Keputusan:** Tetap menggunakan custom Toast implementation
**Alasan:**
1. Custom toast sudah berfungsi dengan baik
2. Lebih ringan dari Sonner (tidak perlu next-themes)
3. Styling sudah perfect match dengan tema aplikasi
4. Tidak ada kebutuhan untuk fitur advanced dari Sonner

**Opsi Future:** Sonner sudah ter-install dan siap digunakan jika dibutuhkan fitur lebih advanced (promise toast, loading state, dll).

## Manfaat Upgrade

### Accessibility (a11y)
- ✅ **Focus trap**: Modal otomatis trap focus, tidak bisa tab keluar
- ✅ **Keyboard navigation**: ESC untuk close, Arrow keys di select
- ✅ **ARIA attributes**: Proper role, aria-label, aria-describedby
- ✅ **Screen reader support**: Dialog announcements dan focus management

### iOS/Mobile Compatibility
- ✅ **Native-like select**: Radix Select render proper UI di iOS (bukan native select yang sulit di-style)
- ✅ **Touch-friendly**: Proper hit areas dan touch interactions
- ✅ **Viewport handling**: Dialog position dan scroll handling di mobile

### Styling Consistency
- ✅ **Theming**: Semua komponen pakai CSS variables yang sama
- ✅ **Dark mode ready**: Sudah support dark mode dari Radix
- ✅ **Animation**: Consistent fade & zoom animations
- ✅ **Border radius**: Unified 16px rounded corners

### Developer Experience
- ✅ **Type-safe**: Full TypeScript support dari Radix
- ✅ **Composable**: Komponen bisa di-customize lebih mudah
- ✅ **Maintained**: Radix UI actively maintained
- ✅ **Documentation**: Official docs dari shadcn + Radix

## Testing Checklist

### Manual Testing Required
Jalankan `pnpm dev` dan test hal-hal berikut:

#### 1. AddTransactionModal
- [ ] Open modal dari homepage "Add Transaction" button
- [ ] Test transaction type tabs (Expense/Income/Transfer)
- [ ] Select wallet dari dropdown - pastikan options muncul
- [ ] Select category dari dropdown - pastikan filter by type
- [ ] Transfer mode: pilih from & to wallet berbeda
- [ ] Validation: transfer ke wallet yang sama harus error
- [ ] Submit form - pastikan transaction tersimpan
- [ ] ESC key untuk close modal
- [ ] Click backdrop untuk close modal
- [ ] Tab navigation dalam modal

#### 2. AddWalletModal
- [ ] Open modal dari wallets page
- [ ] Input wallet name
- [ ] Input initial balance (optional)
- [ ] Submit form - pastikan wallet terbuat
- [ ] Initial balance > 0 harus create income transaction
- [ ] Close modal dan verify state reset

#### 3. AddCategoryModal
- [ ] Open modal dari categories page
- [ ] Input category name
- [ ] Toggle type (Expense/Income)
- [ ] Submit form - pastikan category terbuat
- [ ] Validation: nama kategori required

#### 4. Select Component (iOS Testing)
- [ ] **PENTING**: Test di iPhone/iPad Safari
- [ ] Select dropdown harus bisa di-style (bukan native select)
- [ ] Touch interaction smooth
- [ ] Options list readable dan scrollable
- [ ] Selected value tampil dengan benar

#### 5. Focus & Keyboard
- [ ] Focus trap dalam modal (tidak bisa tab keluar)
- [ ] ESC close modal
- [ ] Arrow keys navigate select options
- [ ] Enter/Space select option
- [ ] Tab order logis

## Build Status
✅ **Production build successful**
```bash
pnpm build --turbopack
# ✓ Compiled successfully
# No TypeScript errors
# No build errors
```

## Known Issues
⚠️ **ESLint Configuration**
ESLint saat ini ada issue dengan `@rushstack/eslint-patch`. Ini adalah known issue dengan ESLint 9.x dan Next.js 15.5.6. Build dan development tetap berfungsi normal.

**Workaround:** Skip linting saat ini atau downgrade ESLint jika diperlukan.

## File Changes Summary
```
Modified:
- src/components/AddTransactionModal.tsx (Dialog + Select)
- src/components/AddWalletModal.tsx (Dialog)
- src/components/AddCategoryModal.tsx (Dialog)
- src/lib/utils.ts (Restored + cn)
- src/app/globals.css (shadcn variables added)

Created:
- src/components/ui/dialog.tsx (shadcn)
- src/components/ui/select.tsx (shadcn)
- src/components/ui/sonner.tsx (shadcn)
- src/components/ui/custom-select.tsx (custom wrapper)
- components.json (shadcn config)

Unchanged:
- src/components/Toast.tsx (kept custom implementation)
- src/hooks/useToast.ts (kept custom hook)
- All API routes
- All page components (only modal usage stays same)
```

## Rollback Instructions
Jika ada issue serius:
```bash
git checkout HEAD -- src/components/AddTransactionModal.tsx
git checkout HEAD -- src/components/AddWalletModal.tsx
git checkout HEAD -- src/components/AddCategoryModal.tsx
git checkout HEAD -- src/lib/utils.ts
git checkout HEAD -- src/app/globals.css
rm -rf src/components/ui
rm components.json
pnpm install
```

## Next Steps (Optional Enhancements)
1. **Sonner Migration**: Jika ingin advanced toast features
2. **Command Palette**: Add `cmdk` untuk quick actions (Cmd+K)
3. **Form Validation**: Add `react-hook-form` + `zod` integration
4. **Date Picker**: Replace datetime-local dengan shadcn Calendar
5. **Tabs Component**: Replace transaction type selector dengan shadcn Tabs

## Credits
- shadcn/ui: https://ui.shadcn.com/
- Radix UI: https://www.radix-ui.com/
- Lucide Icons: https://lucide.dev/
