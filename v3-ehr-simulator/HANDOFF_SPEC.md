# Developer Handoff Specification
### V3.1 EHR Intelligence Simulator — Aurora Clinical Redesign

---

## Files Changed

| File | Type | Reason |
|------|------|--------|
| `src/app/globals.css` | Full rewrite | Design token layer, keyframes, base styles |
| `tailwind.config.js` | Extended | Design tokens exposed as Tailwind utilities |
| `src/app/layout.tsx` | Updated | `next/font` for Inter + JetBrains Mono |
| `src/app/page.tsx` | Full rewrite | Aurora Clinical dark dashboard |
| `src/components/Sidebar/IntelligentSidebar.tsx` | Full rewrite | Glassmorphism + **300ms debounce fix** |
| `src/components/Sidebar/SuggestionCard.tsx` | Full rewrite | Dark premium cards, Lucide icons |
| `src/components/Sidebar/ErrorBoundary.tsx` | Updated | Dark theme match |
| `src/lib/utils.ts` | New file | `cn()` via clsx + tailwind-merge |

---

## Bug Fixes Applied (from Audit)

### Fix 1 — Missing 300ms Debounce (CRITICAL)
**File:** `IntelligentSidebar.tsx`
**Before:** `onChange` fired `getSemanticSuggestions()` on every keystroke with no delay.
**After:** `useRef<ReturnType<typeof setTimeout>>` holds the timer. Every keystroke clears and resets a 300ms timer before triggering the API call. This matches the briefing specification exactly.

```typescript
// Pattern used:
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleSearch = (val: string) => {
    setQuery(val);
    if (val.length < 3) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
        // API call here — fires 300ms after last keystroke
    }, 300);
};
```

### Fix 2 — Vitals Tri-State Color Logic (MEDIUM, Clinical Safety)
**File:** `page.tsx`
**Before:** Binary ternary `critical ? red : green` — warning status rendered green.
**After:** Object map with explicit fallback:

```typescript
const STATUS_CONFIG = {
    critical: {
        value: 'text-red-400',
        card: 'border-red-400/30 shadow-[0_0_20px_rgba(248,113,113,0.18)]',
        badge: 'bg-red-400/10 text-red-400 border-red-400/25',
        dot: 'bg-red-400 animate-pulse',
    },
    warning: {
        value: 'text-amber-400',
        card: 'border-amber-400/25',
        badge: 'bg-amber-400/10 text-amber-400 border-amber-400/22',
        dot: 'bg-amber-400',
    },
    normal: {
        value: 'text-emerald-400',
        card: 'border-emerald-400/20',
        badge: 'bg-emerald-400/8 text-emerald-400 border-emerald-400/18',
        dot: 'bg-emerald-400',
    },
} as const;
```

### Fix 3 — Touch Target Violations (MEDIUM, Clinical Safety)
**File:** `page.tsx`
**Before:** Header buttons used `h-10` (40px) — below the 44px clinical mandate.
**After:** All interactive elements use minimum `h-12` (48px). Verified list:

| Element | Before | After | Status |
|---------|--------|-------|--------|
| "View History" button | `h-10` (40px) | `h-12` (48px) | ✓ Fixed |
| "Stat Request" button | `h-10` (40px) | `h-12` (48px) | ✓ Fixed |
| Search input | `h-[56px]` (56px) | `h-14` (56px) | ✓ Was OK |
| Approve button | `h-12` (48px) | `h-12` (48px) | ✓ Was OK |

### Fix 4 — Raw SVG → Lucide React Icons
**Files:** `IntelligentSidebar.tsx`, `SuggestionCard.tsx`, `ErrorBoundary.tsx`
**Before:** All icons were inline SVG path strings (verbose, unmaintainable).
**After:** Named Lucide imports. `lucide-react` was already installed but unused.

### Fix 5 — cn() Utility Wired Up
**Files:** All components
**Before:** `clsx` and `tailwind-merge` installed but never imported anywhere.
**After:** `src/lib/utils.ts` exports `cn()`. All components use it for conditional class merging.

---

## Component Specs

### 1. VitalCard
```
Container:    relative overflow-hidden rounded-[14px] border p-5
              border and shadow derive from STATUS_CONFIG[vital.status]
Label:        text-[10px] font-bold uppercase tracking-[0.12em] text-secondary
Value:        text-3xl font-extrabold tracking-tight STATUS_CONFIG[status].value
              + animate-pulse ONLY when status === 'critical'
Unit badge:   text-[10px] font-bold px-2 py-0.5 rounded-full
              derives bg/text/border from STATUS_CONFIG[status].badge
Status dot:   w-2 h-2 rounded-full STATUS_CONFIG[status].dot (inline with unit badge)
Accent line:  absolute top-0 left-0 w-full h-[2px] derive color from status
```

### 2. Current Conditions Table
```
Wrapper:      rounded-2xl border border-[--border-default] overflow-hidden
Header row:   bg-[--surface-2] border-b border-[--border-subtle]
              th: text-[11px] font-bold uppercase tracking-widest text-secondary px-6 py-4
Data rows:    bg-[--surface-0] hover:bg-[--surface-hover] transition-colors
              td ICD code: font-mono font-bold text-lg text-accent
              td desc:     text-sm font-medium text-primary
              td status:   badge with bg-emerald-400/10 text-emerald-400 text-[10px] uppercase
Row min-height: 56px (touch accessible)
```

### 3. Intelligence Hub Sidebar
```
Aside:        w-[30%] min-w-[350px] sticky top-0 h-screen overflow-y-auto
              bg: rgba(8,14,28,0.82) backdrop-blur-xl backdrop-saturate-150
              border-left: 1px solid rgba(34,211,238,0.09)
              shadow: -8px 0 40px rgba(0,0,0,0.40)
              z-index: 50

Header:       "INTELLIGENCE" plain + "HUB" in text-accent
              Sub-label: text-[10px] font-bold uppercase tracking-[0.15em] text-secondary

Search input: See SearchInput spec in Design System

Results list: flex-1 overflow-y-auto
              Empty state: centered, icon + text, dashed accent border
              Loading:     3× skeleton cards using shimmer animation

Status bar:   Bottom, border-top border-[--border-subtle]
              Status pill: ShieldCheck icon + "Secured" or warning text
```

### 4. SuggestionCard
```
Card:         relative p-4 rounded-[12px] border border-[--border-default]
              bg-[--surface-0] hover:border-[--border-strong]
              hover:shadow-[0_4px_20px_rgba(0,0,0,0.45)]
              transition: all 200ms ease-out
              mb-3

Left bar:     absolute left-0 top-0 w-[3px] h-full rounded-l-[12px]
              bg-red-400 if hcc_impact else bg-emerald-400

Source label: text-[10px] font-bold uppercase tracking-widest text-secondary
Source value: text-base font-semibold text-primary

HCC badge:    (conditional) bg-red-400/10 border border-red-400/25
              text-red-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full

Data grid:    2 columns
  Left:       Label "ICD-10" + value in font-mono text-2xl font-bold text-accent
  Right:      Label "HCC Weight" + value in text-2xl font-bold text-primary

Description:  text-xs text-secondary mb-4 (truncated to 2 lines)

Approve btn:  h-12 w-full rounded-[10px] bg-accent text-[--text-inverse]
              font-semibold text-sm uppercase tracking-wide
              hover: bg-[--accent-deep]  active: scale-[0.97]
              flex items-center justify-center gap-2
              icon: <Check size={16} strokeWidth={2.5} />
```

### 5. ErrorBoundary Fallback
```
Aside:        Same dimensions as live sidebar (w-[30%] min-w-[350px])
              bg: rgba(248,113,113,0.06) backdrop-blur-xl
              border-left: 1px solid rgba(248,113,113,0.20)

Icon:         AlertCircle from lucide-react, text-red-400, size 24

Heading:      "Systems Offline" text-xl font-bold text-red-300
Body:         text-sm text-red-400/80 max-w-[240px] text-center
Error code:   font-mono text-[10px] text-red-500/60 mt-auto
```

---

## Animation Keyframes Required in globals.css

```css
@keyframes shimmer {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.8; }
}

@keyframes slide-in-right {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
}

@keyframes fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}
```

---

## ESM Conformity Checklist

- [x] `package.json` has `"type": "module"`
- [x] `tailwind.config.js` uses `export default {}`
- [x] `postcss.config.mjs` uses `.mjs` extension
- [x] All new files use `import/export` syntax — no `require()`
- [x] `src/lib/utils.ts` uses named exports only

---

## Preserved Invariants (Must Never Be Removed)

| Invariant | Location | Verified |
|-----------|----------|---------|
| 70/30 split layout | `page.tsx` root flex | ✓ |
| `w-[30%] min-w-[350px]` on sidebar | `IntelligentSidebar.tsx` + `ErrorBoundary.tsx` | ✓ |
| `sticky top-0 h-screen` on sidebar | `IntelligentSidebar.tsx` + `ErrorBoundary.tsx` | ✓ |
| `<ErrorBoundary>` wraps `<IntelligentSidebar>` | `page.tsx` lines 75–77 | ✓ |
| `X-API-KEY` header injection | `api.ts` — untouched | ✓ |
| `suggestionCache` client-side cache | `api.ts` — untouched | ✓ |
| Mock fallback on API error | `api.ts` + `IntelligentSidebar.tsx` | ✓ |
| `validateClinicalData` HITL pipeline | `api.ts` — untouched | ✓ |
| 300ms debounce | `IntelligentSidebar.tsx` — **ADDED** | ✓ |
| Tri-state vitals color | `page.tsx` — **FIXED** | ✓ |
| ≥44px touch targets | All buttons — **FIXED** | ✓ |
