# V3 Pro Max — Complete Design Overhaul + Slow Demo Prompt
## For Claude Code Opus — Full Autonomous Implementation

---

## CONTEXT: WHAT EXISTS

You are working on a **Next.js 16 + TypeScript + Tailwind v4** project located at the root of this repo. The app is a FHIR-MCP Bridge clinical intelligence simulator — it demonstrates AI-powered EHR (Electronic Health Record) workflows to technical audiences.

### Current File Structure
```
src/
├── app/
│   ├── globals.css           ← Design system CSS variables (to be fully replaced)
│   ├── layout.tsx            ← ThemeProvider setup
│   ├── page.tsx              ← Landing page (to be completely redesigned)
│   └── simulator/
│       └── page.tsx          ← Demo orchestration page (to be redesigned + slowed)
├── components/
│   ├── AgentPlan.tsx         ← Reasoning steps display
│   ├── CommandPalette.tsx    ← Cmd+K palette
│   ├── DataStream.tsx        ← Live search query display
│   ├── DemoProgressBar.tsx   ← Progress bar
│   ├── PatientTimeline.tsx   ← Timeline event cards
│   ├── Sparkline.tsx         ← Recharts vital trend lines
│   └── Sidebar/
│       ├── ErrorBoundary.tsx
│       ├── IntelligentSidebar.tsx
│       └── SuggestionCard.tsx
├── data/
│   └── clinicalScenarios.ts  ← 4 clinical scenarios (DO NOT MODIFY SCHEMA)
├── hooks/
│   └── useDemoOrchestrator.ts ← Demo state machine (timing needs overhaul)
└── lib/
    └── utils.ts              ← cn() utility
```

### Current package.json dependencies (already installed)
```json
{
  "framer-motion": "^12.35.0",
  "next": "^16.1.6",
  "next-themes": "^0.4.6",
  "react": "^19.2.4",
  "recharts": "^3.8.0",
  "cmdk": "^1.1.1",
  "lucide-react": "^0.577.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0",
  "@radix-ui/react-tooltip": "^1.2.8"
}
```

### Current Design System (globals.css tokens — to be replaced)
- Primary: `#4f46e5` (Indigo)
- Secondary: `#14b8a6` (Teal)
- Accent: `#f59e0b` (Amber)
- Background: `#f7f9f3` (light sage)
- Style: neo-brutalist (hard black borders, 3px offset shadows)
- **Problem**: Looks amateurish — flat, toy-like, no visual depth or premium feel

### Current Demo Orchestrator (useDemoOrchestrator.ts — timing to be replaced)
- Total demo duration: **16 seconds** (way too fast for a human audience)
- No explanatory narration between phases
- Events fire at overlapping intervals
- No natural human "reading" pauses
- Phases: idle → loading → narrative → intelligence → hitl → complete

---

## TASK 1: INSTALL NEW DEPENDENCIES

Run the following:
```bash
npm install @paper-design/shaders-react
```

`framer-motion` is already installed. Confirm it's at least v11+ (currently v12.35.0 — confirmed).

---

## TASK 2: CREATE THE SHADER HERO COMPONENT

Create the file `src/components/ui/shaders-hero-section.tsx` with this **exact** content:

```tsx
"use client"
import { PulsingBorder, MeshGradient } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import type React from "react"
import { useEffect, useRef, useState } from "react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)
    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }
    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen w-full relative overflow-hidden">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders — adapted for clinical/medical color palette */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#0f0a2e", "#1a0533", "#000000", "#0a1628"]}
        speed={0.3}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={["#4f46e5", "#14b8a6", "#000000", "#4f46e5"]}
        speed={0.15}
        wireframe="true"
        backgroundColor="transparent"
      />

      {children}
    </div>
  )
}

export function PulsingCircle() {
  return (
    <div className="absolute bottom-8 right-8 z-30">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <PulsingBorder
          colors={["#4f46e5", "#14b8a6", "#f59e0b", "#818cf8", "#2dd4bf"]}
          colorBack="#00000000"
          speed={1.5}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={5}
          spotsPerColor={5}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.5}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{ width: "60px", height: "60px", borderRadius: "50%" }}
        />
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="circle-text" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="text-sm fill-white/60" fontSize="9">
            <textPath href="#circle-text" startOffset="0%">
              FHIR-MCP BRIDGE • CLINICAL AI • FHIR-MCP BRIDGE • CLINICAL AI •
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}
```

---

## TASK 3: COMPLETE DESIGN OVERHAUL OF globals.css

Replace `src/app/globals.css` entirely with the following. The goal is a **dark, premium, medical-grade aesthetic** — think Bloomberg Terminal meets Vercel/Linear's design language, not a student project. Deep blacks, precise Indigo/Teal accents, subtle glass panels, no cartoonish borders.

```css
/* globals.css — V3 Pro Max Overhaul: Premium Dark Medical UI */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ================================================================
   DESIGN TOKENS
   ================================================================ */

:root {
  /* Brand */
  --primary:        #4f46e5;
  --primary-hover:  #4338ca;
  --primary-glow:   rgba(79, 70, 229, 0.25);
  --secondary:      #14b8a6;
  --secondary-glow: rgba(20, 184, 166, 0.2);
  --accent:         #f59e0b;
  --accent-glow:    rgba(245, 158, 11, 0.2);
  --destructive:    #ef4444;

  /* Surfaces — dark by default (this design is dark-first) */
  --background:     #000000;
  --surface-0:      #050507;
  --surface-1:      #0d0d14;
  --surface-2:      #13131e;
  --surface-3:      #1a1a2e;
  --card:           #0d0d14;
  --card-hover:     #13131e;
  --popover:        #13131e;
  --sidebar:        #050507;

  /* Text */
  --foreground:         #ffffff;
  --foreground-muted:   rgba(255,255,255,0.7);
  --foreground-subtle:  rgba(255,255,255,0.4);
  --foreground-ghost:   rgba(255,255,255,0.2);

  /* Keep old aliases for backward compat */
  --muted-foreground: rgba(255,255,255,0.5);
  --text-tertiary:    rgba(255,255,255,0.35);

  /* Borders */
  --border:         rgba(255,255,255,0.08);
  --border-subtle:  rgba(255,255,255,0.05);
  --border-strong:  rgba(255,255,255,0.15);
  --border-accent:  rgba(79,70,229,0.4);

  /* Status colors */
  --status-critical: #ef4444;
  --status-warning:  #f59e0b;
  --status-normal:   #22c55e;
  --status-info:     #3b82f6;

  /* Typography */
  --font-sans:  'Inter', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', monospace;

  /* Radius */
  --radius:     0.75rem;
  --radius-sm:  0.375rem;
  --radius-lg:  1rem;

  /* Glow shadows */
  --shadow-primary: 0 0 40px rgba(79,70,229,0.15), 0 0 80px rgba(79,70,229,0.05);
  --shadow-card:    0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4);
  --shadow-glass:   0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);

  /* Misc */
  --muted: rgba(255,255,255,0.06);
  --input: rgba(255,255,255,0.1);
  --ring:  rgba(79,70,229,0.5);
}

/* Light mode kept minimal for compat — this app is dark-first */
.light {
  --background:        #f7f8fc;
  --surface-0:         #f1f2f8;
  --surface-1:         #eaedf5;
  --surface-2:         #e0e4f0;
  --surface-3:         #d4d9ea;
  --card:              #ffffff;
  --card-hover:        #f8f9fd;
  --foreground:        #0a0a14;
  --foreground-muted:  rgba(10,10,20,0.65);
  --foreground-subtle: rgba(10,10,20,0.4);
  --muted-foreground:  rgba(10,10,20,0.5);
  --text-tertiary:     rgba(10,10,20,0.35);
  --border:            rgba(0,0,0,0.08);
  --border-subtle:     rgba(0,0,0,0.05);
  --border-strong:     rgba(0,0,0,0.12);
  --muted:             rgba(0,0,0,0.04);
  --shadow-card:       0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
}

/* ================================================================
   BASE RESETS
   ================================================================ */

*, *::before, *::after { box-sizing: border-box; }

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  line-height: 1.6;
}

::selection {
  background: rgba(79, 70, 229, 0.3);
  color: #fff;
}

/* ================================================================
   TYPOGRAPHY UTILITIES
   ================================================================ */

.text-2xs         { font-size: 0.625rem; line-height: 1rem; }
.tracking-clinical { letter-spacing: 0.08em; }
.tracking-label   { letter-spacing: 0.05em; }
.tracking-widest  { letter-spacing: 0.15em; }
.font-mono        { font-family: var(--font-mono); }

/* ================================================================
   COMPONENT LIBRARY
   ================================================================ */

/* --- Glass Card: primary surface for all cards and panels --- */
.glass-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  pointer-events: none;
}

/* --- Premium Card: elevated glass with stronger top line --- */
.premium-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.premium-card:hover {
  border-color: rgba(79,70,229,0.3);
  box-shadow: var(--shadow-card), var(--shadow-primary);
}

.premium-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
}

/* --- Backward compat: neo-card maps to premium-card style --- */
.neo-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-glass);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.neo-card:hover {
  border-color: var(--border-strong);
}

/* --- Clinical card with status-colored left border --- */
.clinical-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  transition: background 0.15s;
}

.clinical-card:hover {
  background: rgba(255,255,255,0.04);
}

/* Status accent lines */
.status-line-critical {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #ef4444, #f97316);
}
.status-line-warning {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.status-line-nominal {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

/* --- Glow Button --- */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  background: var(--primary);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.2s;
}

.btn-primary:hover::before { opacity: 1; }
.btn-primary:hover {
  box-shadow: 0 0 20px rgba(79,70,229,0.4), 0 4px 12px rgba(0,0,0,0.3);
  transform: translateY(-1px);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  background: transparent;
  color: rgba(255,255,255,0.8);
  font-weight: 400;
  font-size: 0.875rem;
  border-radius: 9999px;
  border: 1px solid rgba(255,255,255,0.15);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.25);
  color: white;
}

/* --- Glass Panel (sidebar/overlay panels) --- */
.glass-panel {
  background: rgba(13,13,20,0.85);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: var(--shadow-glass);
}

/* --- Badge --- */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.badge-critical { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
.badge-warning  { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.3); }
.badge-success  { background: rgba(34,197,94,0.15);  color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
.badge-info     { background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.3); }
.badge-primary  { background: rgba(79,70,229,0.15);  color: #a5b4fc; border: 1px solid rgba(79,70,229,0.3); }
.badge-teal     { background: rgba(20,184,166,0.15); color: #5eead4; border: 1px solid rgba(20,184,166,0.3); }

/* --- Stagger animation helpers --- */
.stagger-1 { animation-delay: 0ms; }
.stagger-2 { animation-delay: 75ms; }
.stagger-3 { animation-delay: 150ms; }
.stagger-4 { animation-delay: 225ms; }

/* ================================================================
   ANIMATIONS
   ================================================================ */

@keyframes slide-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(100%); }
}

@keyframes pulse-critical {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(239,68,68,0); }
  50%       { box-shadow: 0 0 20px rgba(239,68,68,0.25); }
}

@keyframes ecg-draw {
  from { stroke-dashoffset: 800; }
  to   { stroke-dashoffset: 0; }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

@keyframes typewriter-cursor {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.animate-slide-in    { animation: slide-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
.animate-fade-in     { animation: fade-in 0.4s ease both; }
.animate-fade-in-up  { animation: fade-in-up 0.4s cubic-bezier(0.22,1,0.36,1) both; }
.animate-shimmer     { animation: shimmer 2s infinite; }
.animate-pulse-critical { animation: pulse-critical 1.5s ease-in-out infinite; }
.animate-glow-pulse  { animation: glow-pulse 2s ease-in-out infinite; }
.animate-spin-slow   { animation: spin-slow 20s linear infinite; }
.animate-float       { animation: float 4s ease-in-out infinite; }
.animate-cursor      { animation: typewriter-cursor 1s step-end infinite; }

.ecg-path {
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: ecg-draw 3s cubic-bezier(0.4, 0, 0.2, 1) forwards infinite;
}

/* ================================================================
   SCROLLBAR
   ================================================================ */

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
```

---

## TASK 4: REDESIGN src/app/layout.tsx

Replace with:

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'FHIR-MCP Bridge | Clinical Intelligence Platform',
  description: 'AI-powered clinical intelligence infrastructure connecting FHIR R4 records to MCP agents.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## TASK 5: REDESIGN src/app/page.tsx (Landing Page)

The landing page must use the `ShaderBackground` from Task 2 as the hero background. Take strong visual inspiration from 21st.dev — dark, premium, shader-driven hero with minimal elegant typography, full-screen immersion, then scroll down into feature sections with glass cards.

**Design requirements:**
- Full-screen hero using `ShaderBackground` with `MeshGradient` behind it
- Navigation: fixed top bar, near-transparent with subtle blur — logo left, nav links center, CTA right. Identical structure to the Header component provided.
- Hero content positioned in bottom-left like the reference (not centered)
- Badge pill at top of hero copy: `✦ FHIR R4 + Model Context Protocol`
- Hero headline (light-weight, large): `Clinical Intelligence` on line 1, `for the AI Era` on line 2 — first word italic/medium, rest light
- Hero sub-copy: one short, punchy paragraph (max 2 lines)
- Two CTA buttons (pill-shaped): "Launch Demo" (filled, primary) and "Learn More" (ghost/outline)
- `PulsingCircle` bottom-right of hero with clinical text on orbit
- Scroll-down indicator at the bottom center
- Below the fold: horizontal stats bar with 4 metrics using large numbers — `20+` FHIR Resources, `<300ms` Latency, `94%` Accuracy, `SMART` Compliant
- Feature section (3-col grid of glass-cards): 6 capabilities, each with a minimal icon (use lucide-react), short headline, 1-line description, animated bottom border on hover
- Full-width demo CTA banner with primary gradient background, large headline, one paragraph, and the "Launch Demo" button
- Tech stack section: 6 pill badges in a row, centered
- Footer: single line, centered, muted text

**Visual rules (non-negotiable):**
- Background is near-black everywhere except inside the shader hero
- All cards use `glass-card` or `premium-card` class — NO solid colored backgrounds, NO chunky borders
- Typography is Inter — NOT bold everywhere, use weight contrast (900 headline vs 300/400 body)
- Buttons are pill-shaped (border-radius: 9999px) with glow on hover
- Spacing is generous — at least `py-24` between major sections
- No emojis as icons — use lucide-react icons only
- Text colors use opacity variants: `text-white/90`, `text-white/60`, `text-white/40`
- Accent borders (when used) are 1px rgba with low opacity, not thick solid black

---

## TASK 6: REDESIGN src/app/simulator/page.tsx

This page is the autonomous demo runner. The redesign must:

1. **Match the dark premium aesthetic** — no white backgrounds, use glass-card panels, dark surfaces
2. **Replace inline component placeholders** with the real imports from `src/components/`
3. **Use the new slow demo orchestrator** from Task 7 (see below)
4. **Layout**: Two-column split — left 65% is the patient dashboard/timeline, right 35% is the intelligence sidebar
5. **Header**: sticky dark top bar with breadcrumb back to `/`, scenario selector chips (one per scenario), and Start/Reset demo buttons
6. **Phase announcement banner**: a prominent animated strip at the top of the content area that clearly states what phase is active and what the audience should be watching, e.g.:
   - idle: "Select a scenario and press Start to begin the walkthrough"
   - loading: "Loading patient record from FHIR server..."
   - narrative: "Reading the patient's clinical timeline — watch for critical alerts"
   - intelligence: "AI engine is performing semantic ICD-10 analysis"
   - hitl: "AI recommendations ready — a clinician must review and approve before any record changes"
   - complete: "Workflow complete — all changes committed to the FHIR record"
7. **Patient card** (visible during narrative+): shows name, DOB, sex, MRN, primary condition as a large glass-card hero card — not tiny text
8. **Vitals row** (4 cards): blood pressure, heart rate, SpO₂, glucose — each card uses the `clinical-card` class with status-colored top border, the value in large monospace font, and a Sparkline trend chart underneath the value
9. **Timeline area**: uses `PatientTimeline` component, events reveal one at a time with 300ms slide-in animation
10. **Right panel** (intelligence sidebar): `DataStream` for the live search query, `AgentPlan` for the reasoning steps — only visible during intelligence/hitl phases
11. **HITL approval panel**: a full-width banner that appears during hitl phase with large explanation text and the approval button pulsing with a green glow

---

## TASK 7: REWRITE src/hooks/useDemoOrchestrator.ts (SLOW DEMO)

**Core requirement: The demo must be slow enough for a human audience to follow. Target total runtime is 60 seconds.** Each phase must have enough time for the audience to read, understand, and appreciate what's happening.

### New Phase Timeline

```
Phase: idle       → Press "Start Demo" button
Phase: loading    → T+0s  to T+4s   (4 seconds) — "Loading patient record from FHIR server..."
Phase: narrative  → T+4s  to T+28s  (24 seconds) — Timeline events stream in slowly
Phase: intelligence→ T+28s to T+44s (16 seconds) — AI search auto-types + reasoning steps appear
Phase: hitl       → T+44s to T+56s  (12 seconds) — Approval panel, HITL explanation
Phase: complete   → T+56s to T+60s  (4 seconds)  — Success state
Total: ~60 seconds
```

### New Timeline Event Schedule

Events within the narrative phase fire with long, readable pauses between them. Map the 6 events of each scenario to these relative delays (added to the T+4s narrative start):

```
Event 1: narrativeStart + 0ms     (immediately on entering narrative)
Event 2: narrativeStart + 4000ms  (4 seconds after event 1)
Event 3: narrativeStart + 8000ms  (4 seconds after event 2)
Event 4: narrativeStart + 13000ms (5 seconds after event 3)
Event 5: narrativeStart + 18000ms (5 seconds after event 4)
Event 6: narrativeStart + 22000ms (4 seconds after event 5)
```

This means events fire at absolute times: 4s, 8s, 12s, 17s, 22s, 26s.

### Auto-typing Speed

Start auto-typing at T+28s (intelligence phase). Character typing delay: **40ms per character** (slower for readability). The full query should finish around T+33–35s, leaving time for the reasoning steps to appear.

### Reasoning Steps

After auto-typing completes (~T+34s), each reasoning step flips from `pending` to `complete` with a 1500ms delay between them (6 steps × 1.5s = 9 seconds). This makes the reasoning feel deliberate, not instant.

### New DemoState Interface (add narration field)

```ts
export interface DemoState {
  phase:             DemoPhase;
  scenario:          ClinicalScenario | null;
  visibleEvents:     TimelineEvent[];
  demoSearchQuery:   string;
  progressPct:       number;
  showTimeline:      boolean;
  isActive:          boolean;
  narration:         string;       // NEW: human-readable explanation of current phase
  completedSteps:    number;       // NEW: count of reasoning steps marked complete
  activeEventIndex:  number;       // NEW: which timeline event is currently "active"/highlighted
}
```

### Narration strings per phase:

```ts
const NARRATIONS: Record<DemoPhase, string> = {
  idle:         '',
  loading:      'Connecting to FHIR R4 server and loading patient record...',
  narrative:    'Reading the patient\'s clinical timeline. Watch for critical alerts highlighted in red.',
  intelligence: 'The MCP agent is performing semantic analysis — mapping clinical text to ICD-10 codes.',
  hitl:         'AI recommendations are ready. A licensed clinician must review and approve before any data is committed.',
  complete:     'Workflow complete. Conditions confirmed, HCC risk captured, record updated in the FHIR store.',
};
```

---

## TASK 8: REDESIGN COMPONENT VISUAL STYLES

### src/components/PatientTimeline.tsx

- Card background: `rgba(255,255,255,0.03)` with `1px solid var(--border)`
- Left border: 2px solid color based on event type (`alert`→red, `order`→indigo, `result`→teal, `assessment`→violet, `fhir`→cyan)
- Event type shown as a colored badge (use `.badge` classes)
- FHIR resource shown in monospace font below the body
- The **active** (most recently revealed) event should have a subtle glow ring and scale-up entrance animation
- No emoji icons — use a colored dot instead

### src/components/AgentPlan.tsx

- Full glass-card panel
- Complete steps: green checkmark icon (lucide `CheckCircle2`), text at full opacity
- Pending steps: muted circle (lucide `Circle`), text at 35% opacity
- Active step (the one currently flipping): has a spinning loader icon (lucide `Loader2` with `animate-spin`)
- Approval button: pill-shaped, green gradient (`from-green-500 to-emerald-600`), pulsing glow when `highlightApprove` is true

### src/components/DataStream.tsx

- Terminal-style panel: dark background (`rgba(0,0,0,0.5)`), `JetBrains Mono` font
- Green top border accent (`var(--secondary)`)
- Query text in bright white, cursor blinks using `.animate-cursor`
- Results section uses animated rows that slide up

### src/components/DemoProgressBar.tsx

- Full-width thin bar (height: 2px) at the very top of the page
- Gradient: indigo → teal → amber
- No percentage label needed (keep it subtle and unobtrusive)
- Shimmer sweep effect on the filled portion

### src/components/Sparkline.tsx

- No changes to logic, but default color should be `rgba(79,70,229,0.8)` for normal, `rgba(239,68,68,0.8)` for critical, `rgba(245,158,11,0.8)` for warning

---

## TASK 9: FINAL CHECKS

After all changes:

1. Run `npm run build` — fix any TypeScript errors before finishing
2. Confirm the Shader background renders without console errors (MeshGradient from `@paper-design/shaders-react` must be client-only — ensure `'use client'` is at the top of any file importing it)
3. Confirm the landing page `/` renders the full-screen shader hero with nav, hero content, and pulsing circle
4. Confirm the simulator `/simulator` starts in idle state, runs the full 60-second demo on button press, and each phase is clearly visible with narration text
5. Confirm dark mode is the default (ThemeProvider `defaultTheme="dark"`)
6. Confirm no `neo-card` class uses hard black borders or colored box-shadows — all should use the new glass styles

---

## VISUAL REFERENCE SUMMARY

The design target is the 21st.dev/vaib215/shaders-hero-section component:
- **Full-screen dark hero** with live WebGL/shader background (MeshGradient)
- **Near-transparent nav** with blur, minimal links
- **Hero content in bottom-left** (not centered) — italic + light font weight contrast
- **Pill buttons** — one filled, one ghost/outline
- **Pulsing orbital circle** bottom-right
- **Below fold**: clean dark sections with glass cards, generous whitespace
- **No hard borders** — everything uses subtle rgba borders or no border at all
- **Typography**: large, weight-contrasted, minimal — not every word is bold
- **Overall feel**: premium SaaS product page, not a student project

---

## SCOPE CONSTRAINTS

- Do NOT modify `src/data/clinicalScenarios.ts` — the schema is locked
- Do NOT modify `src/lib/utils.ts`
- Do NOT modify `src/services/api.ts`
- Do NOT modify `src/components/Sidebar/ErrorBoundary.tsx`
- The Sidebar components (`IntelligentSidebar.tsx`, `SuggestionCard.tsx`) can be visually updated to match the dark theme but their logic must remain intact
- Preserve all existing TypeScript interfaces — only extend them, never remove fields
