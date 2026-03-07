# AURORA CLINICAL — Design System V1.0
### V3.1 EHR Intelligence Simulator

---

## Autonomous Design Decision

**System: "Aurora Clinical"**
A dark-mode clinical intelligence aesthetic derived from the Radison template (deep navy, premium SaaS structure) and adapted for high-acuity healthcare environments. Clinicians work across variable-light settings — ORs, ICUs, dim night shifts — making dark mode a functional necessity, not a stylistic choice. The cyan/teal accent palette is medically grounded (clinical monitors, scrub colors, NHS blue-green heritage) and delivers exceptional contrast against deep navy without the alarm-state aggression of pure blue. Glassmorphism is applied **only** to the Intelligence Hub sidebar to create a clear visual separation between the AI layer and the patient record — precision over decoration.

Reference sources: Radison Framer template (dark navy, layered SaaS), Linear.app (information density), Vercel Dashboard (monospace precision), IBM Carbon for Healthcare (clinical semantic colors).

---

## 1. Color Tokens

### Canvas (Backgrounds)

| Token              | Value     | Usage                                  |
|--------------------|-----------|----------------------------------------|
| `--canvas`         | `#050A14` | Root page background                   |
| `--surface-0`      | `#0C1220` | Card base (vitals, conditions table)   |
| `--surface-1`      | `#101928` | Elevated card / hover state            |
| `--surface-2`      | `#141E30` | Table header, nested panels            |
| `--surface-hover`  | `#192338` | Row hover, interactive surface         |

### Borders

| Token              | Value                          | Usage                         |
|--------------------|--------------------------------|-------------------------------|
| `--border-subtle`  | `rgba(255,255,255,0.05)`       | Dividers, ghost borders       |
| `--border-default` | `rgba(255,255,255,0.09)`       | Card borders                  |
| `--border-strong`  | `rgba(255,255,255,0.16)`       | Focused inputs, active rows   |
| `--border-accent`  | `rgba(34,211,238,0.20)`        | Accent rule, sidebar border   |

### Text

| Token               | Value     | Usage                                 |
|---------------------|-----------|---------------------------------------|
| `--text-primary`    | `#E2E8F0` | Body, headings, data values           |
| `--text-secondary`  | `#94A3B8` | Metadata, timestamps, sub-labels      |
| `--text-tertiary`   | `#475569` | Placeholder text, disabled states     |
| `--text-inverse`    | `#050A14` | Text on light/accent backgrounds      |

### Accent — Clinical Teal

| Token            | Value                        | Usage                              |
|------------------|------------------------------|------------------------------------|
| `--accent`       | `#22D3EE`                    | Primary interactive, links, focus  |
| `--accent-dim`   | `rgba(34,211,238,0.12)`      | Accent backgrounds, tags           |
| `--accent-glow`  | `rgba(34,211,238,0.20)`      | Glow effects, active states        |
| `--accent-deep`  | `#0891B2`                    | Pressed/active accent              |

### Clinical Status (Semantic — Safety-Critical)

```
CRITICAL  — #F87171  (red-400)
  bg:       rgba(248,113,113,0.10)
  border:   rgba(248,113,113,0.28)
  glow:     rgba(248,113,113,0.20)

WARNING   — #FBBF24  (amber-400)
  bg:       rgba(251,191,36,0.10)
  border:   rgba(251,191,36,0.28)

NOMINAL   — #34D399  (emerald-400)
  bg:       rgba(52,211,153,0.08)
  border:   rgba(52,211,153,0.22)
```

> ⚠️ **Safety Rule:** These three statuses MUST map to three distinct colors. A `warning` state MUST NOT render green. The conditional logic must use a three-way map, not a binary ternary.

### Glassmorphism — Intelligence Hub Sidebar

```
background:       rgba(8, 14, 28, 0.82)
backdrop-filter:  blur(20px) saturate(160%)
border:           1px solid rgba(34, 211, 238, 0.09)
```

---

## 2. Typography

**Primary Font:** `Inter` (loaded via `next/font/google`)
**Monospace Font:** `JetBrains Mono` (loaded via `next/font/google` — for ICD-10 codes)

### Type Scale

| Token       | Size    | Weight | Line Height | Usage                          |
|-------------|---------|--------|-------------|--------------------------------|
| `text-2xs`  | 10px    | 700    | 1.2         | Uppercase labels, micro-tags   |
| `text-xs`   | 12px    | 500    | 1.4         | Secondary metadata             |
| `text-sm`   | 14px    | 500    | 1.5         | Body copy, table cells         |
| `text-base` | 16px    | 500    | 1.6         | Default body                   |
| `text-lg`   | 18px    | 600    | 1.4         | Card section titles            |
| `text-xl`   | 20px    | 700    | 1.3         | Panel headings                 |
| `text-2xl`  | 24px    | 700    | 1.2         | Section titles                 |
| `text-3xl`  | 30px    | 800    | 1.1         | Vital values (data-heavy)      |
| `text-4xl`  | 36px    | 800    | 1.0         | Patient name hero              |

### Typography Rules

- `font-black` (900) is reserved **exclusively** for patient name and critical alert numerals
- ICD-10 codes always render in `font-mono` (JetBrains Mono fallback chain)
- Uppercase labels use `letter-spacing: 0.1em` minimum
- No mixed-weight headings in the same line unless one is `text-secondary`

---

## 3. Spacing Scale

Follows a 4px base grid.

| Token       | Value | Usage                              |
|-------------|-------|------------------------------------|
| `space-1`   | 4px   | Icon gap, micro padding            |
| `space-2`   | 8px   | Inline elements, badge padding     |
| `space-3`   | 12px  | Dense component internal padding   |
| `space-4`   | 16px  | Card padding (compact)             |
| `space-5`   | 20px  | Card padding (default)             |
| `space-6`   | 24px  | Section gap, panel padding         |
| `space-8`   | 32px  | Section spacing                    |
| `space-10`  | 40px  | Large section gap                  |
| `space-12`  | 48px  | Hero section padding               |

---

## 4. Border Radius

| Token        | Value   | Usage                               |
|--------------|---------|-------------------------------------|
| `radius-sm`  | 6px     | Tags, badges, micro elements        |
| `radius-md`  | 10px    | Inputs, small cards                 |
| `radius-lg`  | 14px    | Standard cards, panels              |
| `radius-xl`  | 18px    | Large cards, modals                 |
| `radius-2xl` | 24px    | Sidebar top, section containers     |
| `radius-full`| 9999px  | Pills, avatars, status indicators   |

---

## 5. Shadows & Elevation

| Level       | Value                                                          | Usage                      |
|-------------|----------------------------------------------------------------|----------------------------|
| `shadow-sm` | `0 1px 4px rgba(0,0,0,0.50)`                                   | Subtle lift (tags, badges) |
| `shadow-md` | `0 4px 20px rgba(0,0,0,0.45)`                                  | Cards, dropdowns           |
| `shadow-lg` | `0 8px 40px rgba(0,0,0,0.55)`                                  | Modals, sidebar            |
| `glow-critical` | `0 0 20px rgba(248,113,113,0.18)`                          | Critical vital cards       |
| `glow-accent`   | `0 0 24px rgba(34,211,238,0.14)`                           | Active intelligence panel  |

---

## 6. Motion & Animation

| Animation         | Duration | Easing              | Usage                          |
|-------------------|----------|---------------------|--------------------------------|
| `fade-in`         | 200ms    | `ease-out`          | Card entrance, dropdowns       |
| `slide-in-right`  | 250ms    | `cubic-bezier(0.22,1,0.36,1)` | Sidebar cards, results  |
| `pulse-critical`  | 2s       | `ease-in-out`       | Critical vital values          |
| `spin-slow`       | 3s       | `linear`            | Loading search icon            |
| `shimmer`         | 1.5s     | `ease-in-out`       | Skeleton loading state         |

> **Rule:** No animation should exceed 300ms for interactive elements. Informational pulses (critical vitals) use 2s cycles to avoid anxiety without losing urgency.

---

## 7. Component Tokens

### VitalCard

```
Structure:       card > label + value + unit-row
Padding:         20px (space-5)
Border Radius:   14px (radius-lg)
Border:          1px solid [status-border]
Background:      [status-bg] layered on --surface-0
Shadow (crit):   glow-critical
Min Height:      120px
Touch Target:    full card is interactive ≥ 44px tap zone
```

Status variants:
- `critical`: red border + red value + glow + 2s pulse
- `warning`: amber border + amber value (NO pulse, no glow)
- `nominal`: emerald border + emerald value (subtle only)

### IntelligenceHub Sidebar

```
Width:           w-[30%] min-w-[350px]
Position:        sticky top-0 h-screen
Background:      glassmorphism (rgba(8,14,28,0.82) + blur(20px))
Border-left:     1px solid rgba(34,211,238,0.09)
Box-shadow:      -8px 0 40px rgba(0,0,0,0.40)
Padding:         24px (space-6)
Z-index:         50
```

### SearchInput

```
Height:          56px (h-14) — exceeds 44px touch target ✓
Border Radius:   12px (radius-md)
Background:      --surface-1
Border:          1px solid --border-default
Focus Border:    1px solid --accent (+ accent glow box-shadow)
Padding Left:    48px (icon space)
Font:            Inter 500 14px
Placeholder:     --text-tertiary
```

### SuggestionCard

```
Padding:         16px (space-4)
Border Radius:   12px (radius-md)
Border:          1px solid --border-default
Background:      --surface-0
Hover:           border --border-strong + shadow-md
Left accent bar: 3px solid [hcc_impact ? --critical : --nominal]
Margin bottom:   12px
```

### ActionButton (Primary / Approve)

```
Height:          48px (h-12) — exceeds 44px touch target ✓
Border Radius:   10px (radius-md)
Background:      --accent
Color:           --text-inverse
Font:            600 14px uppercase tracking-wide
Hover:           --accent-deep (darken)
Active:          scale(0.97)
```

### ActionButton (Ghost / Secondary)

```
Height:          48px (h-12) — exceeds 44px touch target ✓
Border:          1px solid --border-strong
Background:      transparent → --surface-hover on hover
Color:           --text-primary
```

### StatusBadge (STAT / Critical)

```
Height:          48px (h-12) — exceeds 44px ✓
Background:      --critical + ring rgba(248,113,113,0.25)
Font:            700 12px uppercase tracking-widest
```

---

## 8. Accessibility

- All interactive elements maintain **≥ 44px** touch targets (clinical mandate)
- Color is **never** the sole differentiator — status labels accompany all colored states
- Focus rings use `--accent` at 2px offset, always visible on dark background
- Critical vitals include both color AND animation AND text label
- Contrast ratios:
  - `--text-primary` on `--canvas`: **12.6:1** ✓ (AAA)
  - `--text-secondary` on `--surface-0`: **5.8:1** ✓ (AA)
  - `--accent` on `--canvas`: **7.3:1** ✓ (AA Large)
  - `--critical` on `--critical-bg`: **4.9:1** ✓ (AA)

---

## 9. Layout Rules

```
Root:         flex row, min-h-screen, bg-canvas
Patient Panel (70%): flex-1, overflow-y-auto, p-8
Intelligence Sidebar (30%): w-[30%] min-w-[350px], sticky, glassmorphism

Mobile (<768px): Sidebar collapses to icon-only drawer [FUTURE V4]
Breakpoint:   1280px+ = full 70/30 split enforced
```

---

## 10. Icon System

All icons use `lucide-react` (installed). Raw SVG paths are **deprecated** and must be migrated to named Lucide imports for maintainability and bundle optimization.

Key icon mappings:
- Search → `<Search />`
- Shield check → `<ShieldCheck />`
- Alert circle → `<AlertCircle />`
- Trending up → `<TrendingUp />`
- Check → `<Check />`
- Activity → `<Activity />`
- User → `<User />`
- Clock → `<Clock />`
