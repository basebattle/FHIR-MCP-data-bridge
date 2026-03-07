# V3 EHR Simulator — "Pro Max" Full Implementation Prompt (V2)
> **Supersedes** `V3_PRO_MAX_IMPLEMENTATION_PROMPT.md`. This document is self-contained — a developer can follow it from top to bottom without any prior context.

---

## 0. ORIENTATION — CURRENT STATE & INVARIANTS

**Stack** (do not change versions unless specified)
- Next.js 16 (App Router), React 19, TypeScript 5.9
- Tailwind CSS v4 via `@tailwindcss/postcss` in `postcss.config.mjs`
- Axios 1.x with `X-API-KEY` header injection and simulation fallback
- Lucide React for icons
- Inter + JetBrains Mono currently loaded via `next/font/google`

**Invariants that survive every phase — never touch these**
1. `src/services/api.ts` — its path, the 300ms debounce, and the simulation fallback
2. `src/components/Sidebar/ErrorBoundary.tsx` — must wrap `IntelligentSidebar`
3. `w-[30%] min-w-[350px] sticky top-0 h-screen` on the sidebar
4. All interactive elements must be ≥ 44px tall (use `h-12` = 48px minimum)
5. `X-API-KEY` header injection in Axios client
6. `"use client"` on every component using hooks — this is Next.js App Router

---

## 1. DEPENDENCY INSTALLATION

```bash
# Run from inside v3-ehr-simulator/
npm install framer-motion cmdk @radix-ui/react-tooltip recharts next-themes
```

> Rationale per package:
> - `framer-motion` — layout animations, AnimatePresence for timeline, page transitions
> - `cmdk` — Command Palette (Cmd+K)
> - `@radix-ui/react-tooltip` — accessible tooltip primitive for suggestion cards
> - `recharts` — sparkline trend lines on vital cards
> - `next-themes` — dark/light mode toggle without flash-of-unstyled-content

After install, confirm all five appear in `package.json` `dependencies`.

---

## 2. DESIGN SYSTEM — FULL `globals.css` REPLACEMENT

Replace the entire contents of `src/app/globals.css` with the following. This replaces the Twitter-blue theme with the new Indigo/Teal/Amber clinical system while preserving all animation keyframes.

```css
/* globals.css — V3 Pro Max Design System */

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ================================================================
   DESIGN TOKENS — Light Mode
   ================================================================ */

:root {
  /* Brand palette */
  --primary:     #4f46e5;   /* Indigo */
  --secondary:   #14b8a6;   /* Teal */
  --accent:      #f59e0b;   /* Amber — used on CTA buttons */
  --destructive: #ef4444;

  /* Surfaces */
  --background:  #f7f9f3;   /* Sage-tinted white */
  --card:        #ffffff;
  --popover:     #ffffff;
  --sidebar:     #f7f9f3;

  /* Text */
  --foreground:       #000000;
  --muted-foreground: #333333;
  --card-foreground:  #000000;

  /* Borders */
  --border:       #000000;  /* Hard black borders — flat/neo-brutalist */
  --input:        #737373;
  --ring:         #a5b4fc;

  /* Utility */
  --muted:   #f0f0f0;
  --radius:  1rem;

  /* Chart colors */
  --chart-1: #4f46e5;
  --chart-2: #14b8a6;
  --chart-3: #f59e0b;
  --chart-4: #ec4899;
  --chart-5: #22c55e;

  /* Typography */
  --font-sans:  'DM Sans', sans-serif;
  --font-mono:  'Space Mono', monospace;
  --font-serif: 'DM Sans', sans-serif;

  /* Shadows — flat by default */
  --shadow-offset-x: 3px;
  --shadow-offset-y: 3px;
  --shadow-color:    #1a1a1a;
  --shadow-opacity:  0.12;

  /* Semantic aliases used by existing code */
  --text-tertiary: #6b7280;
  --surface-0:     #f9fafb;
  --surface-1:     #f3f4f6;
  --surface-2:     #e5e7eb;
  --border-subtle: #e5e7eb;
  --border-strong: #9ca3af;
}

/* ================================================================
   DESIGN TOKENS — Dark Mode
   ================================================================ */

.dark {
  --primary:   #818cf8;
  --secondary: #2dd4bf;
  --accent:    #fcd34d;
  --destructive: #f87171;

  --background: #000000;
  --card:       #1a212b;
  --popover:    #1a212b;
  --sidebar:    #000000;

  --foreground:       #ffffff;
  --muted-foreground: #cccccc;
  --card-foreground:  #ffffff;

  --border: #545454;
  --input:  #ffffff;
  --ring:   #818cf8;
  --muted:  #333333;

  --chart-1: #818cf8;
  --chart-2: #2dd4bf;
  --chart-3: #fcd34d;
  --chart-4: #f472b6;
  --chart-5: #4ade80;

  --text-tertiary: #9ca3af;
  --surface-0:     #111827;
  --surface-1:     #1f2937;
  --surface-2:     #374151;
  --border-subtle: #374151;
  --border-strong: #6b7280;
}

/* ================================================================
   BASE
   ================================================================ */

*, *::before, *::after { box-sizing: border-box; }

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100dvh;
}

/* ================================================================
   SCROLLBAR
   ================================================================ */

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--muted); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: var(--primary); }

/* ================================================================
   FOCUS
   ================================================================ */

*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* ================================================================
   KEYFRAMES
   ================================================================ */

@keyframes spin-slow   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes shimmer     { 0%, 100% { opacity: 0.50; } 50% { opacity: 0.85; } }
@keyframes slide-in    { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slide-up    { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fade-in     { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse-crit  { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@keyframes glow-pulse  { 0%, 100% { box-shadow: 0 0 8px rgba(239,68,68,0.15); } 50% { box-shadow: 0 0 20px rgba(239,68,68,0.30); } }
@keyframes ecg-draw    { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
@keyframes float       { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes marquee     { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* ================================================================
   UTILITY CLASSES — keep all existing names intact
   ================================================================ */

.animate-spin-slow       { animation: spin-slow 3s linear infinite; }
.animate-shimmer         { animation: shimmer 1.5s ease-in-out infinite; }
.animate-slide-in        { animation: slide-in 0.25s cubic-bezier(0.22,1,0.36,1) both; }
.animate-fade-in-up      { animation: slide-up 0.20s ease-out both; }
.animate-pulse-critical  { animation: pulse-crit 2s ease-in-out infinite; }
.animate-glow-pulse      { animation: glow-pulse 2.5s ease-in-out infinite; }
.animate-float           { animation: float 3s ease-in-out infinite; }
.animate-marquee         { animation: marquee 18s linear infinite; }

.stagger-1 { animation-delay: 0ms; }
.stagger-2 { animation-delay: 60ms; }
.stagger-3 { animation-delay: 120ms; }
.stagger-4 { animation-delay: 180ms; }

/* ================================================================
   GLASS PANEL (sidebar)
   ================================================================ */

.glass-panel {
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(10px) saturate(130%);
  -webkit-backdrop-filter: blur(10px) saturate(130%);
  border-left: 1px solid var(--border-subtle);
}

.dark .glass-panel {
  background: rgba(26,33,43,0.96);
  border-left: 1px solid var(--border-subtle);
}

/* ================================================================
   CLINICAL CARD
   ================================================================ */

.clinical-card {
  background: var(--card);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.clinical-card:hover {
  border-color: var(--primary);
  box-shadow: 3px 3px 0 var(--primary);
}

/* ================================================================
   NEO-BRUTALIST CARD (landing page components)
   Solid black border + offset shadow — signature look
   ================================================================ */

.neo-card {
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 3px 3px 0px var(--border);
  transition: box-shadow 120ms ease, transform 120ms ease;
}

.neo-card:hover {
  box-shadow: 5px 5px 0px var(--border);
  transform: translate(-1px, -1px);
}

.dark .neo-card { box-shadow: 3px 3px 0px var(--border); }

/* ================================================================
   STATUS ACCENT LINES (preserved from V3.1)
   ================================================================ */

.status-line-critical {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, #ef4444, transparent);
  border-radius: 10px 10px 0 0;
}

.status-line-warning {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, #f59e0b, transparent);
  border-radius: 10px 10px 0 0;
}

.status-line-nominal {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, #22c55e, transparent);
  border-radius: 10px 10px 0 0;
}

/* ================================================================
   ECG WAVEFORM (landing page decoration)
   ================================================================ */

.ecg-path {
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  animation: ecg-draw 2.5s cubic-bezier(0.22,1,0.36,1) forwards;
}

/* ================================================================
   FONT UTILITIES
   ================================================================ */

.font-mono  { font-family: var(--font-mono); }
.text-2xs   { font-size: 0.65rem; line-height: 1rem; }
.tracking-clinical { letter-spacing: 0.08em; }

/* ================================================================
   DEMO PROGRESS BAR
   ================================================================ */

@keyframes demo-progress { from { width: 0%; } to { width: 100%; } }

.demo-progress-fill {
  animation: demo-progress var(--demo-duration, 15s) linear forwards;
}
```

---

## 3. UPDATE `src/app/layout.tsx` — FONTS + THEME PROVIDER

Replace the entire file:

```typescript
// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: 'FHIR-MCP Bridge | Clinical Intelligence Platform',
  description: 'High-fidelity Clinical Intelligence Infrastructure — Powered by FHIR R4 + MCP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

> Note: Fonts are now loaded via `@import url(...)` in `globals.css` to reduce JS overhead. DM Sans + Space Mono.

---

## 4. ROUTE ARCHITECTURE CHANGE

The current file at `src/app/page.tsx` becomes the **landing page**. The EHR simulator moves to a sub-route.

**Exact steps:**
```bash
# From inside v3-ehr-simulator/
mkdir -p src/app/simulator
cp src/app/page.tsx src/app/simulator/page.tsx
```

Then completely replace `src/app/page.tsx` with the Landing Page code in §5.
The existing simulator page at `src/app/simulator/page.tsx` will be refactored in §8.

---

## 5. LANDING PAGE — `src/app/page.tsx`

This is the welcome page. Visitors see it first. It introduces the project, shows feature cards, displays stats, and presents the "Launch Demo" CTA.

Create the complete file:

```typescript
// src/app/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  Activity, Brain, Shield, Zap, Database, GitBranch,
  Moon, Sun, ArrowRight, ExternalLink, Check, Server,
  Clock, ChevronRight, Cpu, Lock,
} from 'lucide-react';
import { cn } from '../lib/utils';

/* ── ECG Waveform SVG path ──────────────────────────────────── */
function EcgWaveform({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 60"
      className={cn('w-full', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="ecg-path"
        d="M0 30 L40 30 L55 30 L60 10 L65 50 L72 5 L80 55 L88 30 L100 30 L140 30 L155 30 L160 10 L165 50 L172 5 L180 55 L188 30 L200 30 L240 30 L255 30 L260 10 L265 50 L272 5 L280 55 L288 30 L300 30 L340 30 L355 30 L360 10 L365 50 L372 5 L380 55 L388 30 L400 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Dark mode toggle ───────────────────────────────────────── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'w-10 h-10 rounded-full border-2 border-[var(--border)]',
        'bg-[var(--card)] hover:bg-[var(--muted)]',
        'flex items-center justify-center',
        'transition-all duration-150 active:scale-95',
      )}
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

/* ── Feature cards data ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: Database,
    color: 'text-[#4f46e5]',
    bg:    'bg-indigo-50 dark:bg-indigo-950/40',
    title: 'Universal FHIR CRUD',
    body:  'Full read, create, update, and delete across 20+ FHIR R4 resources. Paginated bundles, atomic transactions.',
    tag:   'FHIR R4',
  },
  {
    icon: Brain,
    color: 'text-[#14b8a6]',
    bg:    'bg-teal-50 dark:bg-teal-950/40',
    title: 'Semantic ICD-10 Matching',
    body:  'SNOMED CT + cosine similarity. Type a free-text diagnosis, get back ranked ICD-10 codes with confidence scores.',
    tag:   'NLP Engine',
  },
  {
    icon: Activity,
    color: 'text-[#ef4444]',
    bg:    'bg-red-50 dark:bg-red-950/40',
    title: 'HCC Risk Scoring',
    body:  'Hierarchical Condition Category weighting. Every ICD-10 suggestion carries a CMS RAF adjustment weight.',
    tag:   'CMS RAF',
  },
  {
    icon: Shield,
    color: 'text-[#22c55e]',
    bg:    'bg-green-50 dark:bg-green-950/40',
    title: 'HITL Validation',
    body:  'Human-in-the-loop approval workflow. Clinician confirms, rejects, or overrides every AI suggestion.',
    tag:   'Clinical Safety',
  },
  {
    icon: Server,
    color: 'text-[#f59e0b]',
    bg:    'bg-amber-50 dark:bg-amber-950/40',
    title: 'Dual-Protocol Gateway',
    body:  'FastAPI REST + FastMCP AI protocol on the same server. Path isolation prevents latency collision.',
    tag:   'Architecture',
  },
  {
    icon: Zap,
    color: 'text-[#ec4899]',
    bg:    'bg-pink-50 dark:bg-pink-950/40',
    title: 'Simulation Fallback',
    body:  'Zero-config demo mode. If the API key is absent, the system serves realistic mock data automatically.',
    tag:   'Demo-Ready',
  },
];

/* ── Stats bar data ─────────────────────────────────────────── */
const STATS = [
  { value: '20+',   label: 'FHIR Resources' },
  { value: '<300ms',label: 'API Latency' },
  { value: '94%',   label: 'ICD-10 Accuracy' },
  { value: 'SMART', label: 'on-FHIR Compliant' },
];

/* ── Tech stack badges ──────────────────────────────────────── */
const STACK = ['FHIR R4', 'FastAPI', 'FastMCP', 'Next.js 16', 'Tailwind v4', 'Axios', 'Python 3.11'];

/* ── Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  const [demoHovered, setDemoHovered] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b-2 border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">FHIR-MCP Bridge</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded">
                V3.1
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/basebattle/FHIR-MCP-data-bridge"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <GitBranch size={13} />
              GitHub
              <ExternalLink size={11} />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Label */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border-2 border-[var(--border)] bg-[var(--card)]">
            <span className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              Clinical Intelligence Infrastructure
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl font-black tracking-tight leading-[1.05] mb-6 max-w-3xl">
            The Bridge Between
            <br />
            <span className="text-[var(--primary)]">AI Agents</span> and
            <br />
            <span className="text-[var(--secondary)]">Clinical Records.</span>
          </h1>

          {/* Sub */}
          <p className="text-xl text-[var(--muted-foreground)] font-medium max-w-2xl mb-10 leading-relaxed">
            A Dual-Protocol gateway connecting any AI agent to EHR systems via FHIR R4 and the Model Context Protocol — with semantic ICD-10 matching, HCC risk scoring, and full HITL validation.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/simulator">
              <motion.button
                onHoverStart={() => setDemoHovered(true)}
                onHoverEnd={() => setDemoHovered(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'h-14 px-8 rounded-xl',
                  'bg-[var(--accent)] hover:bg-amber-500',
                  'text-black font-extrabold text-sm uppercase tracking-widest',
                  'border-2 border-[var(--border)]',
                  'shadow-[3px_3px_0px_#000]',
                  'hover:shadow-[5px_5px_0px_#000]',
                  'hover:-translate-x-[1px] hover:-translate-y-[1px]',
                  'transition-all duration-120',
                  'flex items-center gap-3',
                )}
              >
                <Zap size={16} fill="currentColor" />
                Launch Interactive Demo
                <motion.div
                  animate={{ x: demoHovered ? 4 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ArrowRight size={16} />
                </motion.div>
              </motion.button>
            </Link>

            <a
              href="https://github.com/basebattle/FHIR-MCP-data-bridge"
              target="_blank"
              rel="noreferrer"
              className={cn(
                'h-14 px-8 rounded-xl',
                'bg-[var(--card)] hover:bg-[var(--muted)]',
                'text-[var(--foreground)] font-bold text-sm',
                'border-2 border-[var(--border)]',
                'shadow-[3px_3px_0px_var(--border)]',
                'hover:shadow-[5px_5px_0px_var(--border)]',
                'hover:-translate-x-[1px] hover:-translate-y-[1px]',
                'transition-all duration-120',
                'flex items-center gap-2',
              )}
            >
              <GitBranch size={15} />
              View Source
            </a>
          </div>
        </motion.div>

        {/* ECG decoration */}
        <div className="mt-16 text-[var(--primary)] opacity-30">
          <EcgWaveform />
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="border-y-2 border-[var(--border)] bg-[var(--card)] py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-4 divide-x-2 divide-[var(--border)]">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className="flex flex-col items-center py-2"
              >
                <span className="font-black text-3xl text-[var(--primary)] font-mono">
                  {stat.value}
                </span>
                <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest mt-1">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-black tracking-tight mb-3">
            Six Capabilities, One Bridge.
          </h2>
          <p className="text-[var(--muted-foreground)] font-medium max-w-xl">
            Every feature maps to a real FHIR R4 endpoint and an MCP tool that AI agents can call directly.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: [0.22,1,0.36,1] }}
              className="neo-card p-6 group"
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-4', feat.bg)}>
                <feat.icon size={18} className={feat.color} />
              </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-base leading-tight">{feat.title}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] shrink-0 ml-2">
                  {feat.tag}
                </span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {feat.body}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <Check size={12} />
                Available in live demo
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Demo CTA Banner ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className={cn(
          'neo-card p-10 flex items-center justify-between gap-8',
          'bg-[var(--primary)] border-[var(--border)] text-white',
          'shadow-[6px_6px_0px_#000]',
        )}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-2">
              Interactive Demo
            </p>
            <h3 className="text-2xl font-black leading-tight mb-2">
              See the 24-Hour Shift.
            </h3>
            <p className="text-sm opacity-80 max-w-md leading-relaxed">
              Generate a random clinical case — Heart Failure, COPD, DKA, or Sepsis — and watch the full intelligence pipeline execute in real time.
            </p>
          </div>
          <div className="shrink-0">
            <Link href="/simulator">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  'h-14 px-8 rounded-xl',
                  'bg-[var(--accent)] hover:bg-amber-400',
                  'text-black font-extrabold text-sm uppercase tracking-widest',
                  'border-2 border-black',
                  'shadow-[3px_3px_0px_#000]',
                  'hover:shadow-[5px_5px_0px_#000]',
                  'hover:-translate-x-[1px] hover:-translate-y-[1px]',
                  'transition-all duration-120',
                  'flex items-center gap-3',
                )}
              >
                <Zap size={15} fill="currentColor" />
                Generate a Case
                <ChevronRight size={15} />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ───────────────────────────────────────── */}
      <section className="border-t-2 border-[var(--border)] py-8 bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-6 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            Built with
          </span>
          {STACK.map((tech) => (
            <span
              key={tech}
              className="text-xs font-bold px-3 py-1.5 rounded-full border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            >
              {tech}
            </span>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <Cpu size={12} />
            V3.1 Dual-Protocol Architecture
          </div>
        </div>
      </section>

    </div>
  );
}
```

---

## 6. CLINICAL SCENARIOS DATA — `src/data/clinicalScenarios.ts`

This is the master data file. It exports 4 complete clinical scenarios, each with patient demographics, vitals, conditions, timeline events, and an auto-type query for the Intelligence Hub.

```typescript
// src/data/clinicalScenarios.ts
"use client";

export type VitalStatus = 'critical' | 'warning' | 'normal';

export interface VitalSign {
  label:   string;
  value:   string;
  unit:    string;
  status:  VitalStatus;
  history: number[];  // [oldest → newest] for sparklines
}

export interface Condition {
  code:   string;
  desc:   string;
  status: string;
  hcc:    boolean;
}

export interface TimelineEvent {
  id:            string;
  delayMs:       number;
  time:          string;
  type:          'alert' | 'order' | 'result' | 'assessment' | 'fhir';
  title:         string;
  body:          string;
  severity:      'critical' | 'warning' | 'info';
  fhirResource?: string;
  mcpTool?:      string;
}

export interface ReasoningStep {
  id:     number;
  label:  string;
  detail: string;
  status: 'complete' | 'pending';
}

export interface ClinicalScenario {
  id:              string;
  name:            string;
  tagline:         string;
  color:           string;   // tailwind text color
  patient: {
    name:      string;
    firstName: string;
    dob:       string;
    sex:       string;
    mrn:       string;
  };
  vitals:          VitalSign[];
  conditions:      Condition[];
  timelineEvents:  TimelineEvent[];
  reasoningSteps:  ReasoningStep[];
  demoSearchQuery: string;  // auto-typed into Intelligence Hub
}

/* ── Scenario 1: Heart Failure ──────────────────────────────── */
const HEART_FAILURE: ClinicalScenario = {
  id:      'hf',
  name:    'Heart Failure',
  tagline: 'I50.9 — Acute Decompensated HF',
  color:   'text-red-600',
  patient: { name: 'DOE', firstName: 'JANE', dob: '12/05/1982', sex: 'Female', mrn: '9988776655' },
  vitals: [
    { label: 'Blood Pressure', value: '182/118', unit: 'mmHg', status: 'critical', history: [140,145,152,160,168,175,182] },
    { label: 'Heart Rate',     value: '108',     unit: 'bpm',  status: 'warning',  history: [80,84,88,92,96,102,108]     },
    { label: 'Oxygen Sat.',    value: '91',      unit: '%',    status: 'critical', history: [98,97,96,95,93,92,91]       },
    { label: 'Glucose',        value: '128',     unit: 'mg/dL',status: 'warning',  history: [110,112,116,120,124,126,128]},
  ],
  conditions: [
    { code: 'I50.9', desc: 'Heart failure, unspecified',                           status: 'Active', hcc: true },
    { code: 'I10',   desc: 'Essential (primary) hypertension',                     status: 'Active', hcc: true },
  ],
  timelineEvents: [
    { id:'hf-01', delayMs:0,     time:'08:00', type:'assessment', severity:'critical', title:'Patient Admitted — Heart Failure Intake',     body:'Jane Doe, 43F. Acute shortness of breath, bilateral lower extremity edema, 48h onset.', fhirResource:'Encounter/HF-ADMIT-001', mcpTool:'fhir_create_encounter' },
    { id:'hf-02', delayMs:2000,  time:'08:14', type:'alert',      severity:'critical', title:'Critical BP Alert: 182/118 mmHg',              body:'Exceeds critical threshold (>180/120). Beta-blocker consideration flagged by MCP engine.', fhirResource:'Observation/BP-001', mcpTool:'fhir_read_observation' },
    { id:'hf-03', delayMs:4000,  time:'08:16', type:'order',      severity:'warning',  title:'Intelligence: Metoprolol Succinate 25mg',      body:'HCC weight: 0.331 (I50.9). HITL validation required before order is placed.', fhirResource:'MedicationRequest/METRO-001', mcpTool:'fhir_create_medicationrequest' },
    { id:'hf-04', delayMs:6500,  time:'08:22', type:'result',     severity:'critical', title:'BNP Lab: 1,840 pg/mL (Ref: <100)',             body:'Consistent with severe HF decompensation. Loop diuretic protocol initiated.', fhirResource:'Observation/BNP-001', mcpTool:'fhir_read_observation' },
    { id:'hf-05', delayMs:9000,  time:'08:35', type:'assessment', severity:'info',     title:'ICD-10 Confirmed: I50.9 — HCC Captured',      body:'HCC Category: Heart Failure. RAF weight: 0.331. Awaiting HITL approval.', fhirResource:'Condition/HF-001', mcpTool:'fhir_create_condition' },
    { id:'hf-06', delayMs:12000, time:'09:01', type:'fhir',       severity:'info',     title:'FHIR Bundle Pushed — 5 Resources Synced',     body:'Encounter, 2x Observation, Condition, MedicationRequest pushed to FHIR R4 endpoint.', fhirResource:'Bundle/HF-BUNDLE-001', mcpTool:'fhir_create_bundle' },
  ],
  reasoningSteps: [
    { id:1, label:'FHIR Read',       detail:'Fetched Encounter + Observation bundle via fhir_read_observation',    status:'complete' },
    { id:2, label:'Semantic Parse',  detail:'Extracted: "shortness of breath", "edema", "bilateral"',              status:'complete' },
    { id:3, label:'ICD-10 Match',    detail:'I50.9 (Heart Failure, unspecified) — confidence: 94%',                status:'complete' },
    { id:4, label:'HCC Calc',        detail:'HCC Category confirmed. CMS RAF weight: 0.331',                       status:'complete' },
    { id:5, label:'Drug Suggestion', detail:'Metoprolol Succinate 25mg via clinical protocol engine',              status:'complete' },
    { id:6, label:'HITL Capture',    detail:'Awaiting clinician validation. Status: pending',                      status:'pending'  },
  ],
  demoSearchQuery: 'heart failure edema',
};

/* ── Scenario 2: COPD Exacerbation ─────────────────────────── */
const COPD_EXACERBATION: ClinicalScenario = {
  id:      'copd',
  name:    'COPD Exacerbation',
  tagline: 'J44.1 — COPD with Acute Exacerbation',
  color:   'text-amber-600',
  patient: { name: 'CHEN', firstName: 'ROBERT', dob: '04/17/1958', sex: 'Male', mrn: '7761234890' },
  vitals: [
    { label: 'Blood Pressure', value: '148/94', unit: 'mmHg', status: 'warning',  history: [135,138,140,144,146,147,148] },
    { label: 'Heart Rate',     value: '112',    unit: 'bpm',  status: 'warning',  history: [78,82,88,96,104,108,112]     },
    { label: 'Oxygen Sat.',    value: '84',     unit: '%',    status: 'critical', history: [95,93,91,89,87,86,84]        },
    { label: 'Resp. Rate',     value: '28',     unit: '/min', status: 'critical', history: [16,18,20,22,24,26,28]        },
  ],
  conditions: [
    { code: 'J44.1', desc: 'Chronic obstructive pulmonary disease with (acute) exacerbation', status: 'Active', hcc: true },
    { code: 'J96.01',desc: 'Acute respiratory failure with hypoxia',                           status: 'Active', hcc: true },
  ],
  timelineEvents: [
    { id:'copd-01', delayMs:0,     time:'10:15', type:'assessment', severity:'critical', title:'COPD Exacerbation — ED Intake',              body:'Robert Chen, 67M. Progressive dyspnea 3 days, increased sputum production, worsening cough.', fhirResource:'Encounter/COPD-001', mcpTool:'fhir_create_encounter' },
    { id:'copd-02', delayMs:2000,  time:'10:22', type:'alert',      severity:'critical', title:'Critical SpO₂: 84% on Room Air',             body:'Target: SpO₂ ≥ 90%. High-flow O₂ at 4L/min initiated via nasal cannula.', fhirResource:'Observation/SPO2-001', mcpTool:'fhir_read_observation' },
    { id:'copd-03', delayMs:4000,  time:'10:28', type:'order',      severity:'warning',  title:'Intelligence: Salbutamol + Ipratropium',     body:'Dual bronchodilator nebulization ordered. MCP confidence: 91%. HCC weight: 0.335.', fhirResource:'MedicationRequest/SALB-001', mcpTool:'fhir_create_medicationrequest' },
    { id:'copd-04', delayMs:6500,  time:'10:40', type:'result',     severity:'critical', title:'ABG Result: pH 7.31, PaCO₂ 58 mmHg',        body:'Hypercapnic respiratory failure confirmed. BiPAP consideration initiated.', fhirResource:'Observation/ABG-001', mcpTool:'fhir_read_observation' },
    { id:'copd-05', delayMs:9000,  time:'10:55', type:'assessment', severity:'info',     title:'ICD-10 Confirmed: J44.1 + J96.01',           body:'Dual HCC capture. Total RAF impact: 0.670. HITL validation pending.', fhirResource:'Condition/COPD-001', mcpTool:'fhir_create_condition' },
    { id:'copd-06', delayMs:12000, time:'11:20', type:'fhir',       severity:'info',     title:'FHIR Bundle Synced — 6 Resources',           body:'Encounter, 3x Observation, 2x Condition pushed to endpoint.', fhirResource:'Bundle/COPD-BUNDLE-001', mcpTool:'fhir_create_bundle' },
  ],
  reasoningSteps: [
    { id:1, label:'FHIR Read',      detail:'Fetched Encounter + Observation via fhir_read_observation',            status:'complete' },
    { id:2, label:'Semantic Parse', detail:'Extracted: "dyspnea", "sputum", "SpO₂ 84%"',                          status:'complete' },
    { id:3, label:'ICD-10 Match',   detail:'J44.1 + J96.01 — dual-code strategy, confidence: 91%',                status:'complete' },
    { id:4, label:'HCC Calc',       detail:'Combined RAF weight: 0.670 (two HCC captures)',                        status:'complete' },
    { id:5, label:'Drug Suggestion',detail:'Salbutamol + Ipratropium via GOLD guidelines engine',                  status:'complete' },
    { id:6, label:'HITL Capture',   detail:'Awaiting dual-code clinician sign-off',                                status:'pending'  },
  ],
  demoSearchQuery: 'COPD exacerbation dyspnea',
};

/* ── Scenario 3: Diabetic Ketoacidosis ──────────────────────── */
const DKA: ClinicalScenario = {
  id:      'dka',
  name:    'Diabetic Ketoacidosis',
  tagline: 'E13.10 — DKA without Coma',
  color:   'text-orange-600',
  patient: { name: 'SANTOS', firstName: 'MARIA', dob: '09/23/1994', sex: 'Female', mrn: '5541987320' },
  vitals: [
    { label: 'Blood Pressure', value: '100/62', unit: 'mmHg', status: 'critical', history: [118,114,110,106,104,102,100] },
    { label: 'Heart Rate',     value: '122',    unit: 'bpm',  status: 'critical', history: [88,94,100,108,114,118,122]   },
    { label: 'Oxygen Sat.',    value: '97',     unit: '%',    status: 'normal',   history: [99,98,98,97,97,97,97]        },
    { label: 'Glucose',        value: '487',    unit: 'mg/dL',status: 'critical', history: [210,280,340,400,440,465,487] },
  ],
  conditions: [
    { code: 'E13.10', desc: 'Other specified diabetes mellitus with ketoacidosis without coma', status: 'Active', hcc: true },
    { code: 'E86.0',  desc: 'Dehydration',                                                       status: 'Active', hcc: false },
  ],
  timelineEvents: [
    { id:'dka-01', delayMs:0,     time:'14:30', type:'assessment', severity:'critical', title:'DKA Intake — Metabolic Emergency',            body:'Maria Santos, 31F. Nausea, vomiting, abdominal pain, polyuria/polydipsia × 2 days. T1DM hx.', fhirResource:'Encounter/DKA-001', mcpTool:'fhir_create_encounter' },
    { id:'dka-02', delayMs:2000,  time:'14:38', type:'alert',      severity:'critical', title:'Glucose 487 mg/dL — Ketosis Confirmed',       body:'Serum ketones: 6.2 mmol/L (positive). Anion gap: 22. Metabolic acidosis.', fhirResource:'Observation/GLU-001', mcpTool:'fhir_read_observation' },
    { id:'dka-03', delayMs:4000,  time:'14:42', type:'order',      severity:'critical', title:'Intelligence: IV Insulin + NS Fluid Protocol', body:'Regular insulin 0.1 units/kg/hr drip + 1L NS bolus. MCP confidence: 97%.', fhirResource:'MedicationRequest/INS-001', mcpTool:'fhir_create_medicationrequest' },
    { id:'dka-04', delayMs:6500,  time:'15:00', type:'result',     severity:'critical', title:'ABG: pH 7.28 — Metabolic Acidosis Confirmed', body:'Bicarbonate: 12 mEq/L. DKA protocol Stage 2. K+ monitoring q1h initiated.', fhirResource:'Observation/ABG-002', mcpTool:'fhir_read_observation' },
    { id:'dka-05', delayMs:9000,  time:'15:15', type:'assessment', severity:'info',     title:'ICD-10 Confirmed: E13.10 — HCC Impact',      body:'HCC captured. CMS RAF weight: 0.302. HITL validation pending.', fhirResource:'Condition/DKA-001', mcpTool:'fhir_create_condition' },
    { id:'dka-06', delayMs:12000, time:'16:00', type:'fhir',       severity:'info',     title:'FHIR Bundle Pushed — 5 Resources',            body:'Full metabolic panel, insulin drip order, and conditions synced.', fhirResource:'Bundle/DKA-BUNDLE-001', mcpTool:'fhir_create_bundle' },
  ],
  reasoningSteps: [
    { id:1, label:'FHIR Read',      detail:'Fetched labs: glucose, ketones, ABG, anion gap',                       status:'complete' },
    { id:2, label:'Semantic Parse', detail:'Extracted: "DKA", "hyperglycemia", "ketosis", "acidosis"',             status:'complete' },
    { id:3, label:'ICD-10 Match',   detail:'E13.10 — DKA without coma, confidence: 97%',                          status:'complete' },
    { id:4, label:'HCC Calc',       detail:'HCC Category: Diabetes with Complications. RAF: 0.302',                status:'complete' },
    { id:5, label:'Drug Suggestion',detail:'IV Insulin drip + NS bolus per ADA DKA protocol',                     status:'complete' },
    { id:6, label:'HITL Capture',   detail:'Awaiting metabolic emergency co-sign',                                 status:'pending'  },
  ],
  demoSearchQuery: 'diabetic ketoacidosis hyperglycemia',
};

/* ── Scenario 4: Sepsis ─────────────────────────────────────── */
const SEPSIS: ClinicalScenario = {
  id:      'sepsis',
  name:    'Sepsis — Bacteremia',
  tagline: 'A41.9 — Sepsis, Unspecified Organism',
  color:   'text-purple-600',
  patient: { name: 'WILSON', firstName: 'JAMES', dob: '06/14/1967', sex: 'Male', mrn: '3329871045' },
  vitals: [
    { label: 'Blood Pressure', value: '88/56',  unit: 'mmHg', status: 'critical', history: [120,112,104,98,94,90,88] },
    { label: 'Heart Rate',     value: '124',    unit: 'bpm',  status: 'critical', history: [90,96,104,112,116,120,124] },
    { label: 'Temp',           value: '39.6',   unit: '°C',   status: 'critical', history: [37.2,37.8,38.4,38.8,39.1,39.4,39.6] },
    { label: 'Lactate',        value: '4.2',    unit: 'mmol/L',status: 'critical',history: [1.2,1.8,2.4,3.0,3.5,3.9,4.2] },
  ],
  conditions: [
    { code: 'A41.9', desc: 'Sepsis, unspecified organism',             status: 'Active', hcc: true  },
    { code: 'R65.20',desc: 'Severe sepsis without septic shock',       status: 'Active', hcc: true  },
  ],
  timelineEvents: [
    { id:'sep-01', delayMs:0,     time:'02:15', type:'assessment', severity:'critical', title:'Sepsis Alert — SOFA Score 6',                 body:'James Wilson, 58M. Fever 39.6°C, hypotension, tachycardia. Suspected pneumonia source.', fhirResource:'Encounter/SEP-001', mcpTool:'fhir_create_encounter' },
    { id:'sep-02', delayMs:2000,  time:'02:22', type:'alert',      severity:'critical', title:'qSOFA Positive — 3/3 Criteria Met',          body:'BP 88/56, RR 28, GCS change. Sepsis protocol activated. ICU transfer ordered.', fhirResource:'Observation/SOFA-001', mcpTool:'fhir_read_observation' },
    { id:'sep-03', delayMs:4000,  time:'02:30', type:'order',      severity:'critical', title:'Intelligence: Piperacillin-Tazobactam IV',    body:'Broad-spectrum empiric ABX within 1h of sepsis identification. MCP confidence: 89%.', fhirResource:'MedicationRequest/PIPT-001', mcpTool:'fhir_create_medicationrequest' },
    { id:'sep-04', delayMs:6500,  time:'02:45', type:'result',     severity:'critical', title:'Lactate 4.2 mmol/L — Tissue Hypoperfusion',  body:'30mL/kg crystalloid resuscitation initiated. Vasopressor threshold met.', fhirResource:'Observation/LAC-001', mcpTool:'fhir_read_observation' },
    { id:'sep-05', delayMs:9000,  time:'03:00', type:'assessment', severity:'info',     title:'ICD-10 Confirmed: A41.9 + R65.20',           body:'Dual HCC capture — Sepsis + Severe Sepsis. Total RAF: 0.788. HITL pending.', fhirResource:'Condition/SEP-001', mcpTool:'fhir_create_condition' },
    { id:'sep-06', delayMs:12000, time:'03:30', type:'fhir',       severity:'info',     title:'FHIR Bundle Synced — ICU Handoff Package',   body:'Full encounter package: vitals stream, labs, orders, conditions — 8 resources.', fhirResource:'Bundle/SEP-BUNDLE-001', mcpTool:'fhir_create_bundle' },
  ],
  reasoningSteps: [
    { id:1, label:'FHIR Read',      detail:'Fetched SOFA score components + vital stream',                         status:'complete' },
    { id:2, label:'Semantic Parse', detail:'Extracted: "sepsis", "hypotension", "lactate", "fever"',               status:'complete' },
    { id:3, label:'ICD-10 Match',   detail:'A41.9 + R65.20 — sepsis severity dual-code, confidence: 89%',         status:'complete' },
    { id:4, label:'HCC Calc',       detail:'Combined RAF weight: 0.788 — highest severity tier',                   status:'complete' },
    { id:5, label:'Drug Suggestion',detail:'Pip-Tazo per Surviving Sepsis Campaign 2024 guidelines',               status:'complete' },
    { id:6, label:'HITL Capture',   detail:'Critical care physician sign-off required — ICU level',                status:'pending'  },
  ],
  demoSearchQuery: 'sepsis bacteremia fever hypotension',
};

export const ALL_SCENARIOS: ClinicalScenario[] = [
  HEART_FAILURE, COPD_EXACERBATION, DKA, SEPSIS,
];

export function getRandomScenario(): ClinicalScenario {
  return ALL_SCENARIOS[Math.floor(Math.random() * ALL_SCENARIOS.length)];
}
```

---

## 7. DEMO ORCHESTRATOR HOOK — `src/hooks/useDemoOrchestrator.ts`

This hook manages the entire autonomous demo lifecycle. When `startDemo()` is called, it runs a timed sequence that:
1. Picks a random scenario and populates patient data
2. Fires timeline events on their scheduled delays
3. Starts auto-typing into the Intelligence Hub search
4. Exposes a progress value for the progress bar

```typescript
// src/hooks/useDemoOrchestrator.ts
"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { ALL_SCENARIOS, getRandomScenario, type ClinicalScenario, type TimelineEvent } from '../data/clinicalScenarios';

export type DemoPhase =
  | 'idle'
  | 'loading'       // 0–500ms — patient data populating
  | 'narrative'     // 500ms–12s — timeline events firing
  | 'intelligence'  // 3s–8s — auto-typing in search box
  | 'hitl'          // 10s–13s — HITL highlight
  | 'complete';     // 15s+

export interface DemoState {
  phase:           DemoPhase;
  scenario:        ClinicalScenario | null;
  visibleEvents:   TimelineEvent[];
  demoSearchQuery: string;       // current auto-typed query string
  progressPct:     number;       // 0–100 for progress bar
  showTimeline:    boolean;
  isActive:        boolean;
}

export function useDemoOrchestrator() {
  const [state, setState] = useState<DemoState>({
    phase:           'idle',
    scenario:        null,
    visibleEvents:   [],
    demoSearchQuery: '',
    progressPct:     0,
    showTimeline:    false,
    isActive:        false,
  });

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    intervalsRef.current.forEach(clearInterval);
    timersRef.current = [];
    intervalsRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearAll();
    setState({ phase:'idle', scenario:null, visibleEvents:[], demoSearchQuery:'', progressPct:0, showTimeline:false, isActive:false });
  }, [clearAll]);

  const startDemo = useCallback((scenarioId?: string) => {
    clearAll();

    const scenario = scenarioId
      ? ALL_SCENARIOS.find(s => s.id === scenarioId) ?? getRandomScenario()
      : getRandomScenario();

    const DEMO_DURATION_MS = 16000;
    const startTime = Date.now();

    // Progress bar updater
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / DEMO_DURATION_MS) * 100));
      setState(prev => ({ ...prev, progressPct: pct }));
      if (pct >= 100) clearInterval(progressInterval);
    }, 100);
    intervalsRef.current.push(progressInterval);

    // T+0: Set scenario, enter loading phase
    setState({
      phase: 'loading',
      scenario,
      visibleEvents: [],
      demoSearchQuery: '',
      progressPct: 0,
      showTimeline: false,
      isActive: true,
    });

    // T+500ms: Show timeline, start narrative phase
    timersRef.current.push(setTimeout(() => {
      setState(prev => ({ ...prev, phase: 'narrative', showTimeline: true }));
    }, 500));

    // T+N: Fire each timeline event at its scheduled delay
    scenario.timelineEvents.forEach(event => {
      timersRef.current.push(setTimeout(() => {
        setState(prev => ({ ...prev, visibleEvents: [...prev.visibleEvents, event] }));
      }, event.delayMs + 500)); // +500 offset for the loading phase
    });

    // T+3s: Start auto-typing the demo search query character by character
    const targetQuery = scenario.demoSearchQuery;
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      const partial = targetQuery.slice(0, charIndex);
      setState(prev => ({ ...prev, phase: 'intelligence', demoSearchQuery: partial }));
      if (charIndex >= targetQuery.length) clearInterval(typeInterval);
    }, 80); // 80ms per character
    timersRef.current.push(setTimeout(() => {
      intervalsRef.current.push(typeInterval);
    }, 3000));

    // T+10s: Enter HITL highlight phase
    timersRef.current.push(setTimeout(() => {
      setState(prev => ({ ...prev, phase: 'hitl' }));
    }, 10000));

    // T+15s: Demo complete
    timersRef.current.push(setTimeout(() => {
      setState(prev => ({ ...prev, phase: 'complete', progressPct: 100 }));
    }, DEMO_DURATION_MS));

  }, [clearAll]);

  useEffect(() => () => clearAll(), [clearAll]);

  return { state, startDemo, reset };
}
```

---

## 8. SIMULATOR PAGE — `src/app/simulator/page.tsx`

This is the full V3.1 EHR simulator, now with the demo orchestrator wired in. Replace the entire file (which was copied from the original `page.tsx`):

```typescript
// src/app/simulator/page.tsx
"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import IntelligentSidebar from '../../components/Sidebar/IntelligentSidebar';
import { ErrorBoundary } from '../../components/Sidebar/ErrorBoundary';
import { NarrativeToggle } from '../../components/NarrativeToggle';
import { PatientTimeline } from '../../components/PatientTimeline';
import { DataStream } from '../../components/DataStream';
import { Sparkline } from '../../components/Sparkline';
import { DemoProgressBar } from '../../components/DemoProgressBar';
import { CommandPalette } from '../../components/CommandPalette';
import { useDemoOrchestrator } from '../../hooks/useDemoOrchestrator';
import { ALL_SCENARIOS } from '../../data/clinicalScenarios';
import {
  Activity, Clock, User, FileText, Zap, ArrowLeft,
  Shuffle, ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/* ─── STATUS CONFIG ────────────────────────────────────────── */
const STATUS_CONFIG = {
  critical: {
    value:      'text-red-600 animate-pulse-critical',
    card:       'border-red-300 shadow-[0_2px_8px_rgba(239,68,68,0.12)] animate-glow-pulse',
    badge:      'bg-red-100 text-red-700 border border-red-200',
    dot:        'bg-red-500 animate-pulse',
    accentLine: 'status-line-critical',
    sparkColor: '#dc2626',
  },
  warning: {
    value:      'text-amber-600',
    card:       'border-amber-300',
    badge:      'bg-amber-100 text-amber-700 border border-amber-200',
    dot:        'bg-amber-500',
    accentLine: 'status-line-warning',
    sparkColor: '#d97706',
  },
  normal: {
    value:      'text-emerald-600',
    card:       'border-emerald-300',
    badge:      'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dot:        'bg-emerald-500',
    accentLine: 'status-line-nominal',
    sparkColor: '#059669',
  },
} as const;

/* ─── SCENARIO PICKER ──────────────────────────────────────── */
function ScenarioPicker({ onPick }: { onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className={cn(
          'h-12 px-4 rounded-xl border-2 border-[var(--border)]',
          'bg-[var(--card)] hover:bg-[var(--muted)]',
          'font-bold text-xs uppercase tracking-widest',
          'flex items-center gap-2 transition-all duration-120',
          'shadow-[2px_2px_0_var(--border)] hover:shadow-[3px_3px_0_var(--border)]',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Shuffle size={13} />
        Pick Scenario
        <ChevronDown size={12} className={cn('transition-transform duration-150', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute right-0 top-14 z-30 w-64',
              'bg-[var(--card)] border-2 border-[var(--border)]',
              'rounded-xl shadow-[4px_4px_0_var(--border)] overflow-hidden',
            )}
            role="listbox"
          >
            {ALL_SCENARIOS.map(s => (
              <button
                key={s.id}
                role="option"
                onClick={() => { onPick(s.id); setOpen(false); }}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-[var(--muted)]',
                  'border-b border-[var(--border-subtle)] last:border-0',
                  'transition-colors duration-75',
                )}
              >
                <p className="font-bold text-sm">{s.name}</p>
                <p className="text-xs text-[var(--muted-foreground)] font-mono mt-0.5">{s.tagline}</p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── PAGE ─────────────────────────────────────────────────── */
export default function SimulatorPage() {
  const { state, startDemo, reset } = useDemoOrchestrator();
  const [cmdOpen, setCmdOpen] = useState(false);

  // Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(p => !p); }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Resolve display data: scenario data or static defaults
  const sc = state.scenario;
  const VITALS = sc?.vitals ?? [
    { label: 'Blood Pressure', value: '142/90', unit: 'mmHg', status: 'critical' as const, history: [140,141,141,142,142,142,142] },
    { label: 'Heart Rate',     value: '88',     unit: 'bpm',  status: 'normal'   as const, history: [86,87,87,88,88,88,88]       },
    { label: 'Oxygen Sat.',    value: '98',     unit: '%',    status: 'normal'   as const, history: [98,98,98,98,98,98,98]       },
    { label: 'Glucose',        value: '112',    unit: 'mg/dL',status: 'warning'  as const, history: [110,111,112,112,112,112,112]},
  ];
  const CONDITIONS = sc?.conditions ?? [
    { code:'E11.9', desc:'Type 2 diabetes mellitus without complications', status:'Active', hcc:true },
    { code:'I10',   desc:'Essential (primary) hypertension',               status:'Active', hcc:true },
  ];
  const patient = sc?.patient ?? { name:'DOE', firstName:'JANE', dob:'12/05/1982', sex:'Female', mrn:'9988776655' };

  return (
    <motion.div layout className="flex w-full min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">

      {/* ── LEFT: Patient Dashboard (70%) ───────────────────── */}
      <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">
        <div className="flex-1 p-6">

          {/* ── Back nav + Demo Progress ─────────────────────── */}
          <div className="flex items-center justify-between mb-5">
            <Link href="/" className="flex items-center gap-2 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <ArrowLeft size={13} />
              Back to Overview
            </Link>
            {state.isActive && (
              <DemoProgressBar
                progressPct={state.progressPct}
                phase={state.phase}
                scenarioName={sc?.name ?? ''}
              />
            )}
          </div>

          {/* ── Header ──────────────────────────────────────── */}
          <header className="mb-7 flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                  Clinical Patient Dashboard
                </span>
                {sc && (
                  <span className={cn('ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-[var(--border)]', sc.color)}>
                    {sc.name}
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.h1
                  key={patient.mrn}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-3xl font-black tracking-tight leading-none truncate"
                >
                  {patient.name},{' '}
                  <span className="text-[var(--muted-foreground)] font-bold">{patient.firstName}</span>
                  <span className="ml-2 text-sm font-medium text-[var(--muted-foreground)] font-mono">
                    {patient.mrn}
                  </span>
                </motion.h1>
              </AnimatePresence>

              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                {[
                  { icon: User,     label: 'DOB', value: patient.dob  },
                  { icon: Activity, label: 'Sex', value: patient.sex  },
                  { icon: FileText, label: 'MRN', value: patient.mrn  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs">
                    <Icon size={11} className="text-[var(--muted-foreground)]" />
                    <span className="text-[var(--muted-foreground)] uppercase font-bold tracking-widest text-[10px]">{label}:</span>
                    <span className="font-medium font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <ScenarioPicker onPick={(id) => startDemo(id)} />
              <NarrativeToggle
                isActive={state.isActive}
                onActivate={() => startDemo()}
                onReset={reset}
              />
              <button className={cn(
                'h-12 px-4 rounded-xl border-2 border-[var(--border)]',
                'bg-[var(--destructive)] hover:bg-red-500',
                'text-white font-bold text-xs uppercase tracking-widest',
                'shadow-[2px_2px_0_var(--border)] hover:shadow-[3px_3px_0_var(--border)]',
                'transition-all duration-120 active:scale-[0.97]',
                'flex items-center gap-2',
              )}>
                <Zap size={13} />
                Stat
              </button>
            </div>
          </header>

          {/* ── Vitals Grid ──────────────────────────────────── */}
          <section className="grid grid-cols-4 gap-3 mb-8" aria-label="Patient Vitals">
            <AnimatePresence mode="wait">
              {VITALS.map((vital, i) => {
                const cfg = STATUS_CONFIG[vital.status];
                return (
                  <motion.div
                    key={`${patient.mrn}-${i}`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    className={cn('clinical-card relative p-5 overflow-hidden', cfg.card)}
                    aria-label={`${vital.label}: ${vital.value} ${vital.unit}, status ${vital.status}`}
                  >
                    <div className={cfg.accentLine} aria-hidden="true" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                      {vital.label}
                    </p>
                    <div className="flex items-end justify-between mb-2">
                      <p className={cn('text-2xl font-extrabold tracking-tight leading-none', cfg.value)}>
                        {vital.value}
                      </p>
                      <Sparkline data={vital.history} color={cfg.sparkColor} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', cfg.badge)}>
                        {vital.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                        <span className={cn('text-[10px] font-bold uppercase font-mono', cfg.value.split(' ')[0])}>
                          {vital.status}
                        </span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </section>

          {/* ── Conditions Table ─────────────────────────────── */}
          <section className="rounded-xl border-2 border-[var(--border)] overflow-hidden shadow-[3px_3px_0_var(--border)] mb-6" aria-label="Current Conditions">
            <div className="px-6 py-4 border-b-2 border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Activity size={15} className="text-[var(--primary)]" />
                Current Conditions
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
                  V3.1 Engine Active
                </span>
              </div>
            </div>
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="bg-[var(--surface-0)] border-b border-[var(--border-subtle)]">
                  {['ICD-10 Code', 'Description', 'HCC', 'Status'].map(col => (
                    <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {CONDITIONS.map((row, i) => (
                    <motion.tr
                      key={`${patient.mrn}-cond-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: i * 0.05, duration: 0.2 }}
                      className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-0)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-lg text-[var(--primary)] tracking-tight">
                          {row.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[var(--muted-foreground)] max-w-xs">
                        {row.desc}
                      </td>
                      <td className="px-6 py-4">
                        {row.hcc && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            HCC Risk
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                          row.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-[var(--surface-2)] text-[var(--text-tertiary)]',
                        )}>
                          {row.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </section>

          {/* ── 24-Hour Timeline ─────────────────────────────── */}
          <AnimatePresence>
            {state.showTimeline && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border-2 border-[var(--border)] shadow-[3px_3px_0_var(--border)] overflow-hidden">
                  <div className="px-6 py-4 border-b-2 border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <Clock size={15} className="text-[var(--secondary)]" />
                      24-Hour Clinical Timeline
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
                      {state.visibleEvents.length} / {sc?.timelineEvents.length ?? 0} events
                    </span>
                  </div>
                  <div className="p-6">
                    <PatientTimeline events={state.visibleEvents} />
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </div>

        {/* ── Data Stream ──────────────────────────────────── */}
        <DataStream isActive={state.isActive} />
      </main>

      {/* ── RIGHT: Intelligence Hub (30%) ───────────────────── */}
      <ErrorBoundary>
        <IntelligentSidebar
          narrativeActive={state.isActive}
          demoQuery={state.demoSearchQuery}
          highlightHitl={state.phase === 'hitl'}
        />
      </ErrorBoundary>

      {/* ── Global: Command Palette ──────────────────────────── */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </motion.div>
  );
}
```

---

## 9. NEW COMPONENT — `src/components/DemoProgressBar.tsx`

```typescript
// src/components/DemoProgressBar.tsx
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import type { DemoPhase } from '../hooks/useDemoOrchestrator';

const PHASE_LABELS: Record<DemoPhase, string> = {
  idle:         '',
  loading:      'Loading Case…',
  narrative:    'Timeline Playing',
  intelligence: 'Intelligence Active',
  hitl:         'HITL Validation',
  complete:     'Demo Complete',
};

const PHASE_COLORS: Record<DemoPhase, string> = {
  idle:         'bg-[var(--primary)]',
  loading:      'bg-[var(--secondary)]',
  narrative:    'bg-[var(--primary)]',
  intelligence: 'bg-[var(--secondary)]',
  hitl:         'bg-[var(--accent)]',
  complete:     'bg-emerald-500',
};

interface DemoProgressBarProps {
  progressPct:  number;
  phase:        DemoPhase;
  scenarioName: string;
}

export function DemoProgressBar({ progressPct, phase, scenarioName }: DemoProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          {scenarioName}
        </p>
        <p className="text-[10px] font-bold text-[var(--primary)]">
          {PHASE_LABELS[phase]}
        </p>
      </div>
      <div className="w-40 h-2 bg-[var(--muted)] rounded-full border border-[var(--border-subtle)] overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', PHASE_COLORS[phase])}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
      <span className="text-[10px] font-bold font-mono text-[var(--muted-foreground)]">
        {progressPct}%
      </span>
    </div>
  );
}
```

---

## 10. UPDATE `IntelligentSidebar.tsx` — ADD DEMO PROPS

The sidebar now accepts two new props: `demoQuery` (the auto-typed string from the orchestrator) and `highlightHitl` (blinks the approve button during the HITL phase). The 300ms debounce and fallback mode are untouched.

**Add to the component signature:**
```typescript
interface IntelligentSidebarProps {
  narrativeActive?: boolean;
  demoQuery?:       string;      // NEW — controlled by demo orchestrator
  highlightHitl?:   boolean;     // NEW — highlights HITL approval button
}

export default function IntelligentSidebar({
  narrativeActive = false,
  demoQuery       = '',
  highlightHitl   = false,
}: IntelligentSidebarProps) {
```

**Add a `useEffect` that fires the demo search when `demoQuery` changes:**

Insert this after the existing `handleSearch` callback:
```typescript
// Auto-trigger search when demo orchestrator provides a query
useEffect(() => {
  if (demoQuery.length >= 3) {
    handleSearch(demoQuery);
    setQuery(demoQuery);
  }
}, [demoQuery, handleSearch]);
```

**Add `isGlowing` state for the shine effect:**
```typescript
const [isGlowing, setIsGlowing] = useState(false);
```

**Inside `handleSearch`, after `setResults(...)`, add:**
```typescript
setIsGlowing(true);
setTimeout(() => setIsGlowing(false), 1200);
```

**Update the `<aside>` className to use the glow:**
```typescript
className={cn(
  'w-[30%] min-w-[350px] sticky top-0 h-screen z-50',
  'overflow-y-auto flex flex-col',
  'glass-panel shadow-sidebar',
  'px-4 py-5',
  'transition-shadow duration-500',
  isGlowing && 'shadow-[0_0_32px_rgba(79,70,229,0.20)]',
)}
```

**Pass `highlightHitl` down to `SuggestionCard` via a prop:**
In the results map:
```typescript
<SuggestionCard
  data={res}
  onApprove={handleValidation}
  highlightApprove={highlightHitl}
/>
```

**In `SuggestionCard.tsx`, update the approve button to pulse when `highlightApprove` is true:**
```typescript
// Add to SuggestionCardProps:
highlightApprove?: boolean;

// Update the approve button className:
className={cn(
  'w-full h-12 rounded-md',
  'bg-[var(--primary)] hover:bg-indigo-700 active:scale-[0.97]',
  'text-white font-semibold text-xs uppercase tracking-widest',
  'flex items-center justify-center gap-2',
  'transition-all duration-150',
  'focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
  highlightApprove && 'animate-glow-pulse ring-2 ring-[var(--accent)]',
)}
```

**Add `AgentPlan` and Cmd+K hint to the sidebar** (insert after header `<div>`, before search input):
```typescript
import { AgentPlan } from '../AgentPlan';
// ...
<AgentPlan visible={narrativeActive} reasoningSteps={/* from scenario */} />

{/* Cmd+K hint */}
<div className="mb-3 text-center">
  <span className="text-[10px] text-[var(--muted-foreground)]">
    Press <kbd className="bg-[var(--muted)] border border-[var(--border-subtle)] px-1 py-0.5 rounded font-mono text-[10px]">⌘K</kbd> for quick actions
  </span>
</div>
```

---

## 11. ALL COMPONENT FILES (complete list — create in order)

Create these files in the order listed. Each file's full code was specified in V1 of this prompt or in the sections above. Here is the complete inventory:

| File | Status | Source |
|---|---|---|
| `src/app/globals.css` | **Replace** | §2 above |
| `src/app/layout.tsx` | **Replace** | §3 above |
| `src/app/page.tsx` | **Replace** | §5 above (Landing Page) |
| `src/app/simulator/page.tsx` | **Create** | §8 above |
| `src/data/clinicalScenarios.ts` | **Create** | §6 above |
| `src/hooks/useDemoOrchestrator.ts` | **Create** | §7 above |
| `src/components/NarrativeToggle.tsx` | **Create** | V1 Prompt §2B |
| `src/components/PatientTimeline.tsx` | **Create** | V1 Prompt §3B |
| `src/components/DataStream.tsx` | **Create** | V1 Prompt §3C |
| `src/components/Sparkline.tsx` | **Create** | V1 Prompt §3A |
| `src/components/AgentPlan.tsx` | **Create** | V1 Prompt §4A |
| `src/components/CommandPalette.tsx` | **Create** | V1 Prompt §4B |
| `src/components/DemoProgressBar.tsx` | **Create** | §9 above |
| `src/components/Sidebar/IntelligentSidebar.tsx` | **Update** | V1 §4C + §10 above |
| `src/components/Sidebar/SuggestionCard.tsx` | **Update** | V1 §4D + §10 above |

---

## 12. IMPLEMENTATION COMMANDS

```bash
# Run from v3-ehr-simulator/

# 1. Install dependencies
npm install framer-motion cmdk @radix-ui/react-tooltip recharts next-themes

# 2. Create directory structure
mkdir -p src/app/simulator src/data src/hooks src/components

# 3. Verify PostCSS config
ls postcss.config.mjs || cat > postcss.config.mjs << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOF

# 4. Full build check (must pass with 0 errors)
npm run build

# 5. Dev server
npm run dev
```

---

## 13. EVALUATION CHECKLIST

| # | What to check | How |
|---|---|---|
| 1 | Landing page loads at `/` | Visit `localhost:3000/` — hero, feature grid, stats bar, and amber CTA must all render |
| 2 | "Launch Interactive Demo" navigates to simulator | Click the amber button — must route to `/simulator` |
| 3 | Dark mode toggle works on landing page | Click moon/sun icon — full page re-themes instantly, no flash |
| 4 | "Generate Case" (random) works | Click "Launch 24h Shift" — patient data, vitals, and timeline must all change |
| 5 | Scenario Picker (specific) works | Choose "Sepsis" from dropdown — data must change to James Wilson, SOFA vitals |
| 6 | Auto-type search fires | 3s after demo starts, Intelligence Hub must show characters appearing |
| 7 | Timeline animates in | Events must slide in from left, one at a time, on their delays |
| 8 | Progress bar tracks demo | The 40px progress bar must advance from 0→100% over 15s |
| 9 | HITL glow fires at T+10s | Approve button must gain amber ring + glow at 10s mark |
| 10 | Sparklines on every vital | Each vital card must show a 50px recharts line to the right of the value |
| 11 | Data stream ticks | FHIR ping ticker appears at bottom of 70% view when demo is active |
| 12 | Simulation fallback intact | Remove `NEXT_PUBLIC_API_KEY` from `.env.local`, search manually — amber "Simulation Mode" in status bar |
| 13 | Cmd+K palette opens | Press ⌘K on simulator page — palette must appear centered, search focused |
| 14 | 30% sidebar constraint | At 1280px viewport — sidebar stays ≥350px, never collapses |
| 15 | `npm run build` clean | Zero TypeScript errors, zero missing module errors |

---

## 14. THINGS TO NOT DO

- Do NOT touch `src/services/api.ts` — path, debounce, fallback are frozen
- Do NOT remove `ErrorBoundary` from around `IntelligentSidebar`
- Do NOT make sparklines clickable or interactive — read-only at this stage
- Do NOT add `alert()` for anything new — the existing HITL alert is a known V3 stub
- Do NOT hook CommandPalette items to real navigation — all items are no-ops with "Coming soon"
- Do NOT add transitions that hide clinical data — every animation must reveal or emphasize data
- Do NOT change `w-[30%] min-w-[350px]` on the sidebar
- Do NOT convert `"use client"` components to server components

---

## 15. FINAL ARCHITECTURE

```
src/
├── app/
│   ├── globals.css            ← REPLACED (new Indigo/Teal/Amber design system + DM Sans)
│   ├── layout.tsx             ← REPLACED (ThemeProvider + Google Fonts)
│   ├── page.tsx               ← REPLACED (Landing Page — hero, feature grid, CTA)
│   └── simulator/
│       └── page.tsx           ← NEW (EHR Simulator with demo orchestrator)
│
├── components/
│   ├── NarrativeToggle.tsx    ← NEW
│   ├── PatientTimeline.tsx    ← NEW
│   ├── DataStream.tsx         ← NEW
│   ├── Sparkline.tsx          ← NEW
│   ├── AgentPlan.tsx          ← NEW
│   ├── CommandPalette.tsx     ← NEW
│   ├── DemoProgressBar.tsx    ← NEW
│   └── Sidebar/
│       ├── ErrorBoundary.tsx      ← UNCHANGED
│       ├── IntelligentSidebar.tsx ← UPDATED (demoQuery, highlightHitl, glow, AgentPlan)
│       └── SuggestionCard.tsx     ← UPDATED (Radix tooltips, highlightApprove pulse)
│
├── data/
│   └── clinicalScenarios.ts   ← NEW (4 scenarios: HF, COPD, DKA, Sepsis)
│
├── hooks/
│   └── useDemoOrchestrator.ts ← NEW (autonomous demo state machine)
│
├── lib/
│   └── utils.ts               ← UNCHANGED
│
└── services/
    └── api.ts                 ← UNCHANGED (300ms debounce + simulation fallback FROZEN)
```

**User Journey:**
`Landing Page (/)` → Learn about 6 capabilities → Click amber CTA → `Simulator (/simulator)` → Pick scenario or random → Watch 24h Shift execute autonomously → HITL approval → Reset → Try another scenario
