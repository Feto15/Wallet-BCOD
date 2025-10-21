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

### 2.6 Bottom Sheet (Action Menu)
- Surface: `var(--color-surface)` with rounded top `24px`
- Backdrop: `bg-black/60`
- Handle: `--color-divider` pill
- Motion: slide-up `300ms`

Usage (matches Wallets page options):
```html
<div class="fixed inset-0 z-50 flex items-end justify-center">
  <div class="absolute inset-0 bg-black/60" />
  <div class="relative w-full max-w-[390px] rounded-t-[24px] bg-[var(--color-surface)] pb-6 animate-slide-up">
    <div class="flex justify-center py-3">
      <div class="h-1 w-12 rounded-full bg-[var(--color-divider)]" />
    </div>
    <div class="px-6 pb-2">
      <h3 class="text-[18px] font-semibold">Opsi</h3>
    </div>
    <div class="border-t border-[var(--color-divider)]">
      <button class="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-[rgba(255,255,255,0.05)]">Edit</button>
      <button class="flex w-full items-center gap-3 px-6 py-4 text-left text-[var(--color-negative)] hover:bg-[rgba(239,68,68,0.1)]">Hapus</button>
    </div>
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
