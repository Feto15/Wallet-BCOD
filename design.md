# Belanja COD Wallet — Design System

This document translates the provided design_system JSON into a practical, Tailwind-ready design spec for the Belanja COD Wallet web app. It captures tokens, usage guidance, and implementation snippets you can drop into the existing Next.js + Tailwind stack.

## 1) Foundations

### 1.1 Theme (Dark)
- Background: `#0D0D0D`
- Surface: `#1A1A1A`
- Card surface: `#1E1E1E`
- Accent: `#A78BFA`
- Positive: `#22C55E`
- Negative: `#EF4444`
- Text primary: `#FFFFFF`
- Text secondary: `#A3A3A3`
- Divider: `rgba(255,255,255,0.1)`
- Shadows:
  - Elevation L: `0 4px 16px rgba(0,0,0,0.3)`
  - Elevation M: `0 2px 12px rgba(0,0,0,0.4)`
  - Elevation Float: `0 8px 24px rgba(0,0,0,0.6)`

Recommended CSS variables (global.css) — already present in `APP/src/app/globals.css`:
```css
:root {
  /* Colors */
  --color-bg: #0D0D0D;
  --color-surface: #1A1A1A;
  --color-card: #1E1E1E;
  --color-accent: #A78BFA;
  --color-positive: #22C55E;
  --color-negative: #EF4444;
  --color-text: #FFFFFF;
  --color-text-muted: #A3A3A3;
  --color-divider: rgba(255,255,255,0.1);

  /* Shadows */
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.3);
  --shadow-md: 0 2px 12px rgba(0,0,0,0.4);
  --shadow-float: 0 8px 24px rgba(0,0,0,0.6);
}

html, body { background: var(--color-bg); color: var(--color-text); }
```

Tailwind config mapping (tailwind.config.ts):
```ts
export default {
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        accent: 'var(--color-accent)',
        positive: 'var(--color-positive)',
        negative: 'var(--color-negative)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        divider: 'var(--color-divider)'
      },
      boxShadow: {
        elev: 'var(--shadow-lg)',
        'elev-md': 'var(--shadow-md)',
        float: 'var(--shadow-float)'
      }
    }
  }
}
```

### 1.2 Typography
- Family: `Inter, SF Pro, sans-serif`
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Scale (px):
  - Heading LG: 32
  - Heading MD: 24
  - Body LG: 18
  - Body MD: 16
  - Body SM: 14
  - Caption: 12
- Letter spacing: `0.2px`
- Line height: `1.4`

Tailwind usage examples:
```html
<h1 class="text-[32px] leading-[1.4] tracking-[0.2px] font-semibold">Title</h1>
<h2 class="text-[24px] leading-[1.4] tracking-[0.2px] font-semibold">Section</h2>
<p class="text-[16px] leading-[1.4] tracking-[0.2px] text-text">Body</p>
<p class="text-[14px] leading-[1.4] tracking-[0.2px] text-muted">Secondary</p>
<small class="text-[12px] leading-[1.4] tracking-[0.2px] text-muted">Caption</small>
```

### 1.3 Layout
- Border radius: `8, 16, 24, 32` (sm/md/lg/xl)
- Padding: `8, 16, 24` (sm/md/lg)
- Spacing scale: `[4, 8, 12, 16, 24, 32]`
- Max content width: `390px` (mobile-first)
- Safe area insets: use env() for iOS notches

Snippets:
```html
<div class="mx-auto max-w-[390px] px-4"> ... </div>
```
```css
.page { padding: env(safe-area-inset-top) 16px env(safe-area-inset-bottom); }
```

### 1.4 Tailwind v4 Inline Theme
- Project uses Tailwind v4 with `@theme inline` in `APP/src/app/globals.css` to map CSS variables to utility tokens.
- Keep new tokens consistent with existing variables: `--color-*`, `--shadow-*`.

Example (already present):
```css
@theme inline {
  --color-background: var(--color-bg);
  --color-foreground: var(--color-text);
  --color-muted: var(--color-text-muted);
  --color-accent: var(--color-accent);
  --shadow-lg: var(--shadow-lg);
  --shadow-md: var(--shadow-md);
  --shadow-float: var(--shadow-float);
}
```


## 2) Components

### 2.1 Card
- Background: `var(--color-card)`
- Radius: `20px`
- Padding: `16px`
- Shadow: `var(--shadow-md)`

Usage:
```html
<div class="bg-card rounded-[20px] p-4 shadow-elev-md">
  <h3 class="text-[16px] font-semibold">Card title</h3>
  <p class="text-[14px] text-muted">Description</p>
</div>
```

### 2.2 Button
- Shape: circular/rounded
- Size: medium
- Icon alignment: center
- Color mode: filled
- Default color: `#2E2E2E` (neutral)
- Hover: `brightness(1.1)`
- Active: `scale(0.97)`

Variants:
```html
<!-- Neutral -->
<button class="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E2E2E] text-text px-4 py-2 transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95">
  <span>Button</span>
  </button>

<!-- Accent / Primary -->
<button class="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-black px-4 py-2 transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95">
  <span>Primary</span>
</button>

<!-- Positive / Negative -->
<button class="rounded-full bg-positive text-black px-4 py-2 hover:brightness-110 active:scale-95">Confirm</button>
<button class="rounded-full bg-negative text-white px-4 py-2 hover:brightness-110 active:scale-95">Delete</button>
```

### 2.3 Chip
- Background: `#2D2D2D`
- Text: `#FFFFFF`
- Radius: `16px`
- Font size: `12px`

Usage:
```html
<span class="inline-flex items-center rounded-[16px] bg-[#2D2D2D] text-white text-[12px] px-2 py-1">Chip</span>
```

### 2.4 Tab Bar (Floating)
- Background: `rgba(24,24,24,0.9)` with `backdrop-blur`
- Active icon: `#A78BFA` | Inactive: `#737373`
- Shape: pill, floating with shadow

Usage:
```html
<nav class="fixed left-1/2 bottom-4 -translate-x-1/2 w-[calc(100%-32px)] max-w-[390px] 
            rounded-full bg-[rgba(24,24,24,0.9)] backdrop-blur-xl shadow-float px-3 py-2">
  <ul class="grid grid-cols-3 items-center">
    <li class="text-accent">/* active icon */</li>
    <li class="text-[#737373]">/* inactive icon */</li>
    <li class="text-[#737373]">/* inactive icon */</li>
  </ul>
</nav>
```

### 2.5 Iconography
- Style: line + fill hybrid
- Stroke: `1.8`
- Primary: `#FFFFFF`
- Muted: `#A3A3A3`
- Corners: smooth/rounded

Usage:
```html
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-white">
  <!-- icon paths -->
</svg>
```

### 2.6 Options Modal (Dialog)
- Pola opsi per-item (Edit / Hapus) menggunakan Dialog (Radix) agar konsisten dan aksesibel.
- Surface: `var(--color-surface)`; Radius: `24px`; Shadow: `var(--shadow-float)`; Padding: `24px`
- Backdrop: `rgba(13,13,13,0.85)`; Transisi lembut (lihat bagian Motion)

Usage (sejalan dengan WalletOptionsModal/TransactionOptionsModal):
```html
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="absolute inset-0 bg-[rgba(13,13,13,0.85)]" />
  <div class="relative z-10 w-full max-w-[390px] rounded-[24px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-float)]">
    <header class="flex items-center justify-between pb-4">
      <h3 class="text-[18px] font-semibold">Opsi</h3>
      <button class="text-[24px] text-[var(--color-text-muted)]" aria-label="Close">×</button>
    </header>
    <div class="space-y-2">
      <button class="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left hover:bg-[var(--color-divider)]">Edit</button>
      <button class="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-[var(--color-negative)] hover:bg-[rgba(239,68,68,0.1)]">Hapus</button>
    </div>
  </div>
</div>
```

### 2.7 Radix/Shadcn UI Primitives
- Radix-based primitives live under `src/components/ui/*` (e.g., `dialog.tsx`, `select.tsx`).
- They are styled with the same CSS variables; keep dark-mode contrast and focus states.
- Prefer these primitives for modals/overlays and selects for consistency.

### 2.8 Kebab Button Pattern
- Letakkan tombol kebab `⋮` di kanan atas kartu item.
- A11y: `aria-label="... options"`;
- Size: `text-[20px]`; Spacing: `p-1`; Color: muted → hover text normal.

Usage:
```html
<button
  class="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 text-[20px] leading-none"
  aria-label="Wallet options"
>
  ⋮
</button>
```

## 3) Motion & Loading

### 3.1 Soft Shimmer (Skeleton)
- Kelas: `.shimmer` (didefinisikan di `globals.css`).
- Gunakan untuk placeholder kartu saat loading agar terasa hidup, namun tetap subtle.
 - Jangan kombinasikan dengan `.fade-in-up`; fade-in khusus untuk konten final agar skeleton tidak menghilang saat menunggu delay.

Usage:
```html
<div class="shimmer h-24 rounded-[20px] shadow-[var(--shadow-md)]"></div>
```

### 3.2 Dialog Transitions (Lembut)
- Transisi dikendalikan oleh atribut Radix `data-state="open|closed"` pada overlay dan content.
- Efek: fade + micro-translate; durasi ~120–160ms.
- Reduced-motion: nonaktifkan animasi untuk pengguna yang memilih preferensi ini.

Catatan Implementasi:
```css
/* contoh ringkas, lihat globals.css untuk versi lengkap */
[data-state="open"][data-slot="dialog-overlay"] { animation: dialogOverlayIn 140ms ease-out }
[data-state="closed"][data-slot="dialog-overlay"] { animation: dialogOverlayOut 120ms ease-in }
[data-radix-dialog-content][data-state="open"] { animation: dialogContentIn 140ms cubic-bezier(.22,.61,.36,1) both }
[data-radix-dialog-content][data-state="closed"] { animation: dialogContentOut 120ms ease-in both }
@media (prefers-reduced-motion: reduce) { .shimmer, [data-slot="dialog-overlay"], [data-radix-dialog-content], .fade-in-up { animation: none !important } }
```

### 3.3 Wrapper & Layering (Shimmer + Stagger)
- Pola untuk menjaga shimmer terlihat sampai konten muncul, tanpa teks “keluar” dari kartu:
  - Wrapper: `relative rounded-[20px] overflow-hidden shadow-[var(--shadow-md)]`
  - Skeleton (overlay bawah): `absolute inset-0 z-0 shimmer pointer-events-none`
  - Konten final: `relative z-10 ... fade-in-up` + `style={{ animationDelay: '...ms' }}`

Contoh pola kartu:
```html
<div class="relative rounded-[20px] overflow-hidden shadow-[var(--shadow-md)]">
  <div class="absolute inset-0 shimmer pointer-events-none"></div>
  <div class="relative z-10 bg-[var(--color-card)] p-4 fade-in-up" style="animation-delay: 120ms">
    <!-- isi kartu -->
  </div>
</div>
```


## 3) Composition & Patterns

### 3.1 Page Structure (Mobile-first)
- Top navigation: title + icons
- Balance summary: large number + growth chip
- Quick actions: Receive, Send, Swap
- Referral banner: optional promo block
- Asset list: cards grid (2-column)
- Bottom: floating navigation bar

Layout scaffold:
```html
<header class="mx-auto max-w-[390px] px-4 py-4 flex items-center justify-between">
  <h1 class="text-[24px] font-semibold">Belanja COD Wallet</h1>
  <div class="flex items-center gap-3">/* icons */</div>
</header>

<main class="mx-auto max-w-[390px] px-4 space-y-4">
  <!-- Balance summary -->
  <section class="text-center space-y-2">
    <div class="text-[32px] font-bold">Rp 12.345.678</div>
    <div>
      <span class="inline-flex items-center gap-1 rounded-[16px] bg-[#2D2D2D] text-[12px] px-2 py-1">
        <span class="text-positive">▲</span>
        <span class="text-muted">+3.2%</span>
      </span>
    </div>
  </section>

  <!-- Quick actions -->
  <section class="grid grid-cols-3 gap-3">
    <button class="rounded-[16px] bg-card p-4 shadow-elev-md active:scale-95 transition">Receive</button>
    <button class="rounded-[16px] bg-card p-4 shadow-elev-md active:scale-95 transition">Send</button>
    <button class="rounded-[16px] bg-card p-4 shadow-elev-md active:scale-95 transition">Swap</button>
  </section>

  <!-- Assets grid -->
  <section class="grid grid-cols-2 gap-3">
    <div class="bg-card rounded-[20px] p-4 shadow-elev-md">Asset A</div>
    <div class="bg-card rounded-[20px] p-4 shadow-elev-md">Asset B</div>
  </section>
</main>
```

### 3.2 Alignment
- Main axis: vertical
- Cross axis: centered for summaries; left-aligned for lists
- Text alignment: center for overview, left for detail

### 3.3 Motion
- Transitions: `ease-in-out`
- Duration: `200–300ms`
- Micro-interactions: button press scale (`active:scale-95`), tab selection fade

Tailwind helpers:
```html
<div class="transition-all duration-200 ease-in-out">...</div>
```


## 4) Accessibility & Quality
- Color contrast: ensure accent on dark passes WCAG AA for text or provide solid backgrounds.
- Focus states: visible ring on interactive elements.
- Hit targets: min 44×44 px for touch.
- Reduced motion: respect `prefers-reduced-motion` where animations are non-essential.

Focus ring example:
```html
<button class="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0">Click</button>
```

Reduced motion (global.css):
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```


## 5) Implementation Notes
- Use Tailwind classes backed by CSS variables above to keep theme centralized.
- Default sorting and other product rules remain as per AGENTS.md; this spec only covers UI visuals.
- Keep components keyboard accessible (labels, focus management, semantic HTML).

Suggested directory conventions:
- Design tokens and globals: `src/app/globals.css`
- Reusable UI primitives: `src/components/ui/*`
- Feature components (e.g., AddTransactionModal): `src/components/*`

 Files:
 - Bottom navigation: `APP/src/components/BottomNav.tsx`
 - Wallets page (uses Bottom Sheet): `APP/src/app/wallets/page.tsx`


## 6) Brand Tone
- Keywords: minimal, premium, crypto-fintech, dark-mode, trustworthy, tech-luxury
- Personality: balanced contrast, soft glow, clean geometric UI
- Practical guidance:
  - Prefer clean, high-contrast surfaces with subtle shadows.
  - Avoid visual clutter; use space and clear hierarchy.
  - Accent is reserved for primary actions and key highlights.


## 7) Quick Checklist
- [ ] Global CSS variables added
- [ ] Tailwind config extended for colors and shadows
- [ ] Buttons use `transition` + `active:scale-95`
- [ ] Cards use `bg-card + rounded-[20px] + shadow-elev-md`
- [ ] Tab bar uses `backdrop-blur` and floating layout
- [ ] Focus rings visible on interactives

---
This design.md mirrors the provided JSON and adapts it to Tailwind/Next.js so it’s easy to apply across components like `APP/src/components/AddTransactionModal.tsx` and future screens.
