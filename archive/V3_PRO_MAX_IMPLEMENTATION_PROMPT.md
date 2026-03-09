# V3.1 → "Pro Max" Narrative Demo — Full Implementation Prompt

> **Purpose:** This is a complete, step-by-step engineering prompt for transforming the V3.1 EHR Simulator into a "Narrative Demo" (codename: "The 24-Hour Shift"). It is written to be self-contained: a model with no prior context can follow it from start to finish without ambiguity.

---

## 0. ORIENTATION — WHAT ALREADY EXISTS (DO NOT BREAK)

Before touching a single file, internalize the current state:

**Stack**
- Next.js 16 (App Router), React 19, TypeScript 5.9
- Tailwind CSS v4 (compiled via `@tailwindcss/postcss` in `postcss.config.mjs`)
- Axios 1.x for API calls
- Lucide React for all icons
- Inter + JetBrains Mono via `next/font/google`

**File Tree to preserve**
```
v3-ehr-simulator/
├── src/
│   ├── app/
│   │   ├── globals.css          ← Light Twitter theme. DO NOT overwrite CSS variables.
│   │   ├── layout.tsx           ← Font injection. DO NOT change.
│   │   └── page.tsx             ← Main 70/30 layout. EXTEND, do not rewrite.
│   ├── components/
│   │   └── Sidebar/
│   │       ├── ErrorBoundary.tsx    ← Wraps sidebar. DO NOT remove.
│   │       ├── IntelligentSidebar.tsx
│   │       └── SuggestionCard.tsx
│   ├── lib/
│   │   └── utils.ts             ← cn() helper. DO NOT change.
│   └── services/
│       └── api.ts               ← Axios client + 300ms debounce + mock fallback. PRESERVE ALL.
├── package.json
├── tailwind.config.ts           ← May not exist yet — create if absent.
└── postcss.config.mjs
```

**Invariants that must survive every phase**
1. The `w-[30%] min-w-[350px] sticky top-0 h-screen` sidebar layout constraint must not change.
2. The 300ms debounce (`useRef<ReturnType<typeof setTimeout>>`) in `IntelligentSidebar.tsx` must remain.
3. The dual-layer simulation fallback in `api.ts` (throws → mock data) must remain.
4. The `ErrorBoundary` wrapping `IntelligentSidebar` must remain.
5. All touch targets must remain ≥ 44px (h-12 = 48px minimum on interactive elements).
6. `X-API-KEY` header injection in the Axios client must remain.

---

## 1. DEPENDENCY INSTALLATION

Run these exact commands from inside `v3-ehr-simulator/`:

```bash
npm install framer-motion cmdk @radix-ui/react-tooltip recharts
npm install @radix-ui/react-dialog @radix-ui/react-kbd
```

> **Why each dependency:**
> - `framer-motion` — layout transition animations for 70/30 split + card reveals
> - `cmdk` — Command Palette (Cmd+K) for power-user navigation
> - `@radix-ui/react-tooltip` — accessible tooltips on every suggestion card
> - `recharts` — sparkline trend charts next to vital values
> - `@radix-ui/react-dialog` — used internally by cmdk
> - `@radix-ui/react-kbd` — keyboard shortcut display in command palette

After install, verify `package.json` contains all six new entries under `dependencies`.

---

## 2. PHASE 1 — THE SCENARIO ENGINE

### 2A. Create `src/data/mockScenario.ts`

This file is the "script" of the 24-Hour Shift narrative. It exports a typed array of timed clinical events. The `NarrativeToggle` will feed these events into React state on a timer.

Create the file at `src/data/mockScenario.ts` with this exact content:

```typescript
// mockScenario.ts
// "The 24-Hour Shift" — Heart Failure Intake Scenario
// Each event fires at T + delayMs milliseconds after the toggle is activated.

export interface ClinicalEvent {
  id: string;
  delayMs: number;                // when to fire after scenario start
  time: string;                   // display time (e.g. "08:14")
  type: 'alert' | 'order' | 'result' | 'assessment' | 'fhir';
  title: string;
  body: string;
  severity: 'critical' | 'warning' | 'info';
  fhirResource?: string;          // e.g. "Observation/BP-001"
  mcpTool?: string;               // e.g. "fhir_read_observation"
}

export const HEART_FAILURE_SCENARIO: ClinicalEvent[] = [
  {
    id: 'evt-01',
    delayMs: 0,
    time: '08:00',
    type: 'assessment',
    title: 'Patient Admitted — Heart Failure Intake',
    body: 'Jane Doe, 43F. Chief complaint: acute shortness of breath, bilateral lower extremity edema, worsening over 48h.',
    severity: 'critical',
    fhirResource: 'Encounter/HF-ADMIT-001',
    mcpTool: 'fhir_create_encounter',
  },
  {
    id: 'evt-02',
    delayMs: 2000,
    time: '08:14',
    type: 'alert',
    title: 'Critical BP Alert',
    body: 'Blood Pressure: 182/118 mmHg. Exceeds critical threshold (>180/120). Beta-blocker consideration flagged.',
    severity: 'critical',
    fhirResource: 'Observation/BP-001',
    mcpTool: 'fhir_read_observation',
  },
  {
    id: 'evt-03',
    delayMs: 4000,
    time: '08:16',
    type: 'order',
    title: 'Intelligence Suggestion: Metoprolol',
    body: 'MCP Engine suggests Metoprolol Succinate 25mg PO daily. HCC weight: 0.331 (I50.9 — Heart Failure, unspecified).',
    severity: 'warning',
    fhirResource: 'MedicationRequest/METRO-001',
    mcpTool: 'fhir_create_medicationrequest',
  },
  {
    id: 'evt-04',
    delayMs: 6500,
    time: '08:22',
    type: 'result',
    title: 'BNP Lab Result',
    body: 'BNP: 1,840 pg/mL (Reference: <100). Consistent with severe HF decompensation. Loop diuretic protocol initiated.',
    severity: 'critical',
    fhirResource: 'Observation/BNP-001',
    mcpTool: 'fhir_read_observation',
  },
  {
    id: 'evt-05',
    delayMs: 9000,
    time: '08:35',
    type: 'assessment',
    title: 'ICD-10 Mapping — HCC Confirmed',
    body: 'I50.9 confirmed. HCC Category: Heart Failure. Risk weight: 0.331. HITL validation pending.',
    severity: 'info',
    fhirResource: 'Condition/HF-001',
    mcpTool: 'fhir_create_condition',
  },
  {
    id: 'evt-06',
    delayMs: 12000,
    time: '09:01',
    type: 'order',
    title: 'Furosemide IV Ordered',
    body: 'Furosemide 40mg IV push. Target: UO > 0.5 mL/kg/hr. Next reassessment: 4h. Monitoring: K+, Creatinine.',
    severity: 'warning',
    fhirResource: 'MedicationRequest/FURO-001',
    mcpTool: 'fhir_create_medicationrequest',
  },
  {
    id: 'evt-07',
    delayMs: 15000,
    time: '10:30',
    type: 'fhir',
    title: 'FHIR Sync — Bundle Pushed',
    body: 'Patient Bundle (5 resources) pushed to FHIR R4 endpoint. Resources: Encounter, 2x Observation, Condition, MedicationRequest.',
    severity: 'info',
    fhirResource: 'Bundle/HF-BUNDLE-001',
    mcpTool: 'fhir_create_bundle',
  },
];

// Vitals history for sparkline trend lines.
// Each array = [oldest → newest] readings for that vital.
export const VITALS_HISTORY = {
  bloodPressure: {
    systolic:  [140, 145, 152, 160, 168, 175, 182],
    diastolic: [90,  94,  98,  104, 110, 114, 118],
  },
  heartRate:  [84, 86, 88, 90, 88, 87, 88],
  oxygenSat:  [99, 98, 98, 97, 98, 98, 98],
  glucose:    [108, 110, 112, 115, 112, 111, 112],
};

// Reasoning steps for the AgentPlan component.
// Mirrors the agent-plan.tsx "AI Thinking" pattern.
export const AGENT_REASONING_STEPS = [
  { id: 1, label: 'FHIR Read',        detail: 'Fetched Encounter + Observation bundle via fhir_read_observation',    status: 'complete' as const },
  { id: 2, label: 'Semantic Parse',   detail: 'Extracted chief complaint: "shortness of breath", "edema"',            status: 'complete' as const },
  { id: 3, label: 'ICD-10 Match',     detail: 'Matched I50.9 (Heart Failure, unspecified) — confidence: 94%',         status: 'complete' as const },
  { id: 4, label: 'HCC Weight Calc',  detail: 'HCC Category confirmed. Risk weight: 0.331',                           status: 'complete' as const },
  { id: 5, label: 'Drug Suggestion',  detail: 'Metoprolol Succinate (25mg) suggested via clinical protocol engine',   status: 'complete' as const },
  { id: 6, label: 'HITL Capture',     detail: 'Awaiting clinician validation. Status: pending',                       status: 'pending'  as const },
];
```

---

### 2B. Create `src/components/NarrativeToggle.tsx`

This is the main switch between Empty State (the current default) and the Heart Failure Intake scenario. Place it in the patient dashboard header area.

```typescript
// NarrativeToggle.tsx
"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface NarrativeToggleProps {
  isActive: boolean;
  onActivate: () => void;
  onReset: () => void;
}

export function NarrativeToggle({ isActive, onActivate, onReset }: NarrativeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.button
            key="activate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={onActivate}
            className={cn(
              'h-12 px-5 rounded-lg',
              'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
              'text-white font-bold text-xs uppercase tracking-widest',
              'shadow-md ring-1 ring-blue-200',
              'transition-colors duration-150 active:scale-[0.97]',
              'flex items-center gap-2',
            )}
            aria-label="Activate 24-Hour Shift narrative demo"
          >
            <Play size={13} />
            Launch 24h Shift
          </motion.button>
        ) : (
          <motion.button
            key="reset"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={onReset}
            className={cn(
              'h-12 px-5 rounded-lg',
              'border border-slate-300 bg-white hover:bg-slate-50',
              'text-slate-600 font-bold text-xs uppercase tracking-widest',
              'transition-all duration-150 active:scale-[0.97]',
              'flex items-center gap-2',
            )}
            aria-label="Reset narrative demo to empty state"
          >
            <RotateCcw size={13} />
            Reset
          </motion.button>
        )}
      </AnimatePresence>

      {/* Live indicator — only shown when scenario is running */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">
              Live Demo
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 3. PHASE 2 — THE BENTO-BOX DASHBOARD (70% VIEW OVERHAUL)

### 3A. Create `src/components/Sparkline.tsx`

This renders a tiny 50px-wide trend line next to vital values using Recharts. Zero dependencies beyond what's already installed.

```typescript
// Sparkline.tsx
"use client";
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color: string;    // Tailwind hex, e.g. '#dc2626' for red
  width?: number;   // default 50
  height?: number;  // default 28
}

export function Sparkline({ data, color, width = 50, height = 28 }: SparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ width, height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 3B. Create `src/components/PatientTimeline.tsx`

The 24-hour vertical animated timeline. Each `ClinicalEvent` from the scenario script maps to one row.

```typescript
// PatientTimeline.tsx
"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, FlaskConical, ClipboardList, Wifi } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ClinicalEvent } from '../data/mockScenario';

const TYPE_ICONS = {
  alert:      AlertTriangle,
  order:      ClipboardList,
  result:     FlaskConical,
  assessment: Activity,
  fhir:       Wifi,
};

const SEVERITY_STYLES = {
  critical: {
    dot:  'bg-red-500 ring-4 ring-red-100',
    card: 'border-red-200 bg-red-50/50',
    text: 'text-red-700',
    icon: 'text-red-500',
  },
  warning: {
    dot:  'bg-amber-500 ring-4 ring-amber-100',
    card: 'border-amber-200 bg-amber-50/50',
    text: 'text-amber-700',
    icon: 'text-amber-500',
  },
  info: {
    dot:  'bg-blue-500 ring-4 ring-blue-100',
    card: 'border-blue-200 bg-blue-50/50',
    text: 'text-blue-700',
    icon: 'text-blue-500',
  },
};

interface PatientTimelineProps {
  events: ClinicalEvent[];
}

export function PatientTimeline({ events }: PatientTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Activity size={20} className="text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-400">No clinical events yet.</p>
        <p className="text-xs text-slate-400 mt-1">Press "Launch 24h Shift" to begin the narrative.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical connecting line */}
      <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-slate-200" aria-hidden="true" />

      <AnimatePresence initial={false}>
        {events.map((event, idx) => {
          const Icon = TYPE_ICONS[event.type];
          const sev = SEVERITY_STYLES[event.severity];

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
                delay: idx === 0 ? 0 : 0.05,
              }}
              className="relative flex gap-4 mb-4 last:mb-0"
            >
              {/* Timeline dot */}
              <div className={cn('relative z-10 w-4 h-4 rounded-full shrink-0 mt-1', sev.dot)} />

              {/* Card */}
              <div className={cn('flex-1 p-3 rounded-lg border', sev.card)}>
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon size={12} className={sev.icon} />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {event.time}
                    </span>
                  </div>
                  {event.fhirResource && (
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {event.fhirResource}
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className={cn('text-sm font-bold leading-tight mb-1', sev.text)}>
                  {event.title}
                </p>

                {/* Body */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {event.body}
                </p>

                {/* MCP tool badge */}
                {event.mcpTool && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                      🔧 {event.mcpTool}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
```

---

### 3C. Create `src/components/DataStream.tsx`

A horizontal ticker at the bottom of the 70% view showing raw FHIR pings. This is purely for technical observers — it should be subtle, monochromatic, and never distracting.

```typescript
// DataStream.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FHIR_PING_POOL = [
  'GET /Patient/P-1234 → 200 OK',
  'GET /Observation?patient=P-1234&code=55284-4 → Bundle(4)',
  'POST /Encounter → 201 Created [HF-ADMIT-001]',
  'GET /Condition?patient=P-1234 → Bundle(2)',
  'PUT /Observation/BP-001 → 200 OK',
  'GET /MedicationRequest?patient=P-1234 → Bundle(1)',
  'POST /Observation → 201 Created [BNP-001]',
  'GET /Condition/HF-001 → 200 OK',
  'POST /Bundle → 200 OK [5 resources synced]',
  'GET /Patient/$everything → Bundle(14)',
];

interface DataStreamProps {
  isActive: boolean;
}

export function DataStream({ isActive }: DataStreamProps) {
  const [pings, setPings] = useState<string[]>([]);

  useEffect(() => {
    if (!isActive) { setPings([]); return; }

    // Seed with 3 items immediately
    setPings(FHIR_PING_POOL.slice(0, 3));

    const interval = setInterval(() => {
      const next = FHIR_PING_POOL[Math.floor(Math.random() * FHIR_PING_POOL.length)];
      setPings(prev => [next, ...prev].slice(0, 8)); // keep latest 8
    }, 2200);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className="w-full border-t border-slate-100 bg-slate-50 px-4 py-2 overflow-hidden"
      aria-label="FHIR data stream"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
          FHIR Stream
        </span>
        <div className="flex items-center gap-4">
          <AnimatePresence initial={false}>
            {pings.map((ping, i) => (
              <motion.span
                key={`${ping}-${i}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: i === 0 ? 1 : 0.45 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] font-mono text-slate-500 whitespace-nowrap shrink-0"
              >
                {ping}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
```

---

### 3D. Update `src/app/page.tsx` — Wire everything together

Replace the entire content of `page.tsx` with the following. Pay close attention: everything from the original file is preserved — this adds the new components around the existing structure.

```typescript
// page.tsx (complete replacement)
"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntelligentSidebar from '../components/Sidebar/IntelligentSidebar';
import { ErrorBoundary } from '../components/Sidebar/ErrorBoundary';
import { NarrativeToggle } from '../components/NarrativeToggle';
import { PatientTimeline } from '../components/PatientTimeline';
import { DataStream } from '../components/DataStream';
import { Sparkline } from '../components/Sparkline';
import { Activity, Clock, User, FileText, Zap, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  HEART_FAILURE_SCENARIO,
  VITALS_HISTORY,
  type ClinicalEvent,
} from '../data/mockScenario';

/* ─── STATUS CONFIG (unchanged from V3.1) ─────────────────── */
const STATUS_CONFIG = {
  critical: {
    value:      'text-red-600 animate-pulse-critical',
    card:       'border-red-300 shadow-[0_2px_8px_rgba(244,33,46,0.12)] animate-glow-pulse',
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
type VitalStatus = keyof typeof STATUS_CONFIG;

/* ─── STATIC VITALS ────────────────────────────────────────── */
const VITALS = [
  { label: 'Blood Pressure', value: '142/90', unit: 'mmHg', status: 'critical' as VitalStatus, history: VITALS_HISTORY.bloodPressure.systolic },
  { label: 'Heart Rate',     value: '88',     unit: 'bpm',  status: 'normal'   as VitalStatus, history: VITALS_HISTORY.heartRate },
  { label: 'Oxygen Sat.',    value: '98',     unit: '%',    status: 'normal'   as VitalStatus, history: VITALS_HISTORY.oxygenSat },
  { label: 'Glucose',        value: '112',    unit: 'mg/dL',status: 'warning'  as VitalStatus, history: VITALS_HISTORY.glucose },
];

const CONDITIONS = [
  { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications', status: 'Active', hcc: true },
  { code: 'I10',   desc: 'Essential (primary) hypertension',                status: 'Active', hcc: true },
];

/* ─── PAGE ─────────────────────────────────────────────────── */
export default function Home() {
  const [narrativeActive, setNarrativeActive] = useState(false);
  const [visibleEvents,   setVisibleEvents]   = useState<ClinicalEvent[]>([]);
  const [showTimeline,    setShowTimeline]    = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* Activate narrative — feeds events in on their scheduled delayMs */
  const activateNarrative = useCallback(() => {
    setNarrativeActive(true);
    setVisibleEvents([]);
    setShowTimeline(true);

    HEART_FAILURE_SCENARIO.forEach((event) => {
      const t = setTimeout(() => {
        setVisibleEvents(prev => [...prev, event]);
      }, event.delayMs);
      timersRef.current.push(t);
    });
  }, []);

  /* Reset — clear all pending timers and wipe state */
  const resetNarrative = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setNarrativeActive(false);
    setVisibleEvents([]);
    setShowTimeline(false);
  }, []);

  /* Cleanup on unmount */
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  return (
    <motion.div
      layout
      className="flex w-full min-h-screen bg-white font-sans text-[var(--foreground)]"
    >
      {/* ── LEFT: Patient Dashboard (70%) ───────────────────── */}
      <main className="flex-1 overflow-y-auto min-w-0 bg-white flex flex-col">
        <div className="flex-1 p-6">

          {/* ── Header ──────────────────────────────────────── */}
          <header className="mb-7 flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Clinical Patient Dashboard
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight leading-none text-slate-900 truncate">
                DOE,{' '}
                <span className="text-slate-500 font-bold">JANE</span>
                <span className="ml-2 text-sm font-medium text-slate-400">Patient-1234</span>
              </h1>
              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                {[
                  { icon: User,     label: 'DOB',  value: '12/05/1982' },
                  { icon: Activity, label: 'Sex',  value: 'Female' },
                  { icon: FileText, label: 'MRN',  value: '9988776655' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon size={11} className="text-slate-400" />
                    <span className="text-slate-400 uppercase font-bold tracking-widest">{label}:</span>
                    <span className="font-medium text-slate-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <NarrativeToggle
                isActive={narrativeActive}
                onActivate={activateNarrative}
                onReset={resetNarrative}
              />
              <button className={cn(
                'h-12 px-5 rounded-lg border border-slate-300',
                'bg-white hover:bg-slate-50',
                'text-slate-600 hover:text-slate-900',
                'text-xs font-semibold uppercase tracking-widest',
                'transition-all duration-150 active:scale-[0.97]',
                'flex items-center gap-2',
              )}>
                <Clock size={13} />
                View History
              </button>
              <button className={cn(
                'h-12 px-5 rounded-lg',
                'bg-red-600 hover:bg-red-700 active:bg-red-800',
                'text-white font-bold text-xs uppercase tracking-widest',
                'shadow-md ring-1 ring-red-200',
                'transition-all duration-150 active:scale-[0.97]',
                'flex items-center gap-2',
              )}>
                <Zap size={13} />
                Stat Request
              </button>
            </div>
          </header>

          {/* ── Vitals Grid — with Sparklines ───────────────── */}
          <section className="grid grid-cols-4 gap-3 mb-8" aria-label="Patient Vitals">
            {VITALS.map((vital, i) => {
              const cfg = STATUS_CONFIG[vital.status];
              return (
                <motion.div
                  key={i}
                  layout
                  className={cn(
                    'clinical-card relative p-5 overflow-hidden',
                    `stagger-${i + 1}`,
                    cfg.card,
                  )}
                  aria-label={`${vital.label}: ${vital.value} ${vital.unit}, status ${vital.status}`}
                >
                  <div className={cfg.accentLine} aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                    {vital.label}
                  </p>

                  {/* Value + Sparkline row */}
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
                      <span className={cn('text-[10px] font-bold uppercase', cfg.value.split(' ')[0])}>
                        {vital.status}
                      </span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </section>

          {/* ── Conditions Table (unchanged) ────────────────── */}
          <section
            className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6"
            aria-label="Current Conditions"
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Activity size={15} className="text-blue-500" />
                Current Conditions
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  V3.1 Engine Active
                </span>
              </div>
            </div>
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['ICD-10 Code', 'Description', 'HCC', 'Status'].map((col) => (
                    <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONDITIONS.map((row, i) => (
                  <tr
                    key={i}
                    className={cn(
                      'border-b border-slate-100 last:border-0',
                      'bg-white hover:bg-slate-50 transition-colors duration-100 group',
                    )}
                    style={{ minHeight: '56px' }}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-lg text-blue-600 tracking-tight">{row.code}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 max-w-xs">{row.desc}</td>
                    <td className="px-6 py-4">
                      {row.hcc && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/25">
                          HCC Risk
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                        row.status === 'Active'
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          : 'bg-[var(--surface-2)] text-[var(--text-tertiary)]',
                      )}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── 24-Hour Timeline — visible when narrative is active ── */}
          <AnimatePresence>
            {showTimeline && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
                aria-label="24-Hour Clinical Timeline"
              >
                <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <Activity size={15} className="text-blue-500" />
                      24-Hour Clinical Timeline
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {visibleEvents.length} / {HEART_FAILURE_SCENARIO.length} events
                    </span>
                  </div>
                  <div className="p-6">
                    <PatientTimeline events={visibleEvents} />
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* ── Data Stream ticker — bottom of 70% view ─────────── */}
        <DataStream isActive={narrativeActive} />
      </main>

      {/* ── RIGHT: Intelligence Hub (30%) ───────────────────── */}
      <ErrorBoundary>
        <IntelligentSidebar narrativeActive={narrativeActive} />
      </ErrorBoundary>
    </motion.div>
  );
}
```

---

## 4. PHASE 3 — THE INTELLIGENCE COMMAND CENTER (30% SIDEBAR OVERHAUL)

### 4A. Create `src/components/AgentPlan.tsx`

Visualizes the MCP reasoning steps when the narrative is active. Inspired by `agent-plan.tsx` patterns.

```typescript
// AgentPlan.tsx
"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { AGENT_REASONING_STEPS } from '../data/mockScenario';

interface AgentPlanProps {
  visible: boolean;
}

const STATUS_ICON = {
  complete: <Check size={10} className="text-emerald-600" />,
  pending:  <Clock size={10} className="text-amber-500 animate-pulse" />,
};

export function AgentPlan({ visible }: AgentPlanProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="mb-4 rounded-lg border border-blue-100 bg-blue-50/60 overflow-hidden"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-blue-100 flex items-center gap-2">
            <Zap size={12} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
              MCP Reasoning Chain
            </span>
          </div>

          {/* Steps */}
          <div className="p-3 space-y-1.5">
            {AGENT_REASONING_STEPS.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                className="flex items-start gap-2"
              >
                <div className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  step.status === 'complete' ? 'bg-emerald-100 border border-emerald-200' : 'bg-amber-100 border border-amber-200',
                )}>
                  {STATUS_ICON[step.status]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 leading-none mb-0.5">
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

### 4B. Create `src/components/CommandPalette.tsx`

Global Cmd+K command palette using `cmdk`. Allows power-users to navigate without a mouse.

```typescript
// CommandPalette.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, Activity, FlaskConical, Pill, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const COMMANDS = [
  { group: 'Clinical', items: [
    { label: 'View Labs',          icon: FlaskConical, key: 'labs' },
    { label: 'View Medications',   icon: Pill,         key: 'meds' },
    { label: 'View Conditions',    icon: Activity,     key: 'conditions' },
    { label: 'View Vitals History',icon: Activity,     key: 'vitals' },
    { label: 'HITL Validation',    icon: FileText,     key: 'hitl' },
  ]},
  { group: 'Navigation', items: [
    { label: 'Patient Summary',    icon: FileText,     key: 'summary' },
    { label: 'ICD-10 Search',      icon: Search,       key: 'icd10' },
  ]},
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-[500px] max-w-[90vw]"
          >
            <Command
              className={cn(
                'bg-white rounded-xl border border-slate-200 shadow-2xl',
                'overflow-hidden',
              )}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                <Search size={16} className="text-slate-400 shrink-0" />
                <Command.Input
                  placeholder="Search clinical actions, labs, meds…"
                  className="flex-1 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
                  autoFocus
                />
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>

              {/* Results */}
              <Command.List className="max-h-64 overflow-y-auto p-2">
                <Command.Empty className="p-4 text-center text-sm text-slate-500">
                  No results found.
                </Command.Empty>

                {COMMANDS.map((group) => (
                  <Command.Group
                    key={group.group}
                    heading={group.group}
                    className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                  >
                    {group.items.map((item) => (
                      <Command.Item
                        key={item.key}
                        onSelect={() => { onClose(); }}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
                          'text-sm font-medium text-slate-700',
                          'data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700',
                          'transition-colors duration-75',
                        )}
                      >
                        <item.icon size={14} className="text-slate-400" />
                        {item.label}
                        <span className="ml-auto text-[10px] font-mono text-slate-400">
                          Coming soon
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-3">
                <span className="text-[10px] text-slate-400">
                  <kbd className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px]">↑↓</kbd> navigate
                </span>
                <span className="text-[10px] text-slate-400">
                  <kbd className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px]">⏎</kbd> select
                </span>
                <span className="text-[10px] text-slate-400">
                  <kbd className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px]">esc</kbd> close
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

### 4C. Update `src/components/Sidebar/IntelligentSidebar.tsx`

Add three things to the existing sidebar: the AgentPlan component (shows MCP reasoning chain), a shimmer/shine effect when new suggestions arrive, and a Cmd+K shortcut hint. The 300ms debounce and all existing logic must remain intact.

The changes are surgical — find the relevant section and add only what's listed:

**1. Add to imports (top of file):**
```typescript
import { AgentPlan } from '../AgentPlan';
import { motion } from 'framer-motion';
```

**2. Add `narrativeActive` to the component props interface and signature:**
```typescript
interface IntelligentSidebarProps {
  narrativeActive?: boolean;
}

export default function IntelligentSidebar({ narrativeActive = false }: IntelligentSidebarProps) {
```

**3. Add a `isGlowing` state that triggers on new results:**
```typescript
const [isGlowing, setIsGlowing] = useState(false);
```

**4. Inside the `handleSearch` callback, after `setResults(...)`, add:**
```typescript
setIsGlowing(true);
setTimeout(() => setIsGlowing(false), 1200); // glow for 1.2s
```

**5. Wrap the `<aside>` with the existing code, but change the outer element to add the shine class conditionally:**

Find:
```typescript
className={cn(
  'w-[30%] min-w-[350px] sticky top-0 h-screen z-50',
  ...
)}
```

Change to:
```typescript
className={cn(
  'w-[30%] min-w-[350px] sticky top-0 h-screen z-50',
  'overflow-y-auto flex flex-col',
  'glass-panel shadow-sidebar',
  'px-4 py-5',
  'transition-shadow duration-500',
  isGlowing && 'shadow-[0_0_32px_rgba(59,130,246,0.18)]',
)}
```

**6. Insert `<AgentPlan visible={narrativeActive} />` immediately after the sidebar header `<div className="mb-4">...</div>` block.**

**7. In the sidebar's status bar section at the bottom, add a Cmd+K hint above the existing status bar:**
```typescript
{/* Cmd+K shortcut hint */}
<div className="mb-2 flex items-center justify-center">
  <span className="text-[10px] text-slate-400">
    Press{' '}
    <kbd className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">⌘K</kbd>
    {' '}to search all clinical actions
  </span>
</div>
```

---

### 4D. Update `src/components/Sidebar/SuggestionCard.tsx`

Add a `@radix-ui/react-tooltip` to every populated card that explains which MCP tool generated the suggestion.

**1. Add to imports:**
```typescript
import * as Tooltip from '@radix-ui/react-tooltip';
```

**2. Wrap the HCC badge in a Tooltip:**

Find the existing HCC badge block:
```typescript
{isHccRisk && (
  <span className={cn(...)}>
    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
    HCC Risk
  </span>
)}
```

Replace with:
```typescript
{isHccRisk && (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span className={cn(
          'shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
          'bg-red-100 text-red-700 border border-red-200 cursor-help',
          'flex items-center gap-1',
        )}>
          <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
          HCC Risk
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 max-w-[220px] bg-slate-900 text-white text-[11px] px-3 py-2 rounded-lg shadow-xl leading-relaxed"
          sideOffset={4}
        >
          HCC impact scored via <strong>fhir_read_condition</strong> + <strong>hcc_weight_calc</strong> MCP tools. Weight reflects CMS RAF adjustment.
          <Tooltip.Arrow className="fill-slate-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
)}
```

**3. Wrap the ICD-10 code cell in a Tooltip:**

Find:
```typescript
<span className="font-mono font-bold text-base text-blue-600 leading-none">
  {data.mapped_icd10 ?? 'N/A'}
</span>
```

Replace with:
```typescript
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <span className="font-mono font-bold text-base text-blue-600 leading-none cursor-help">
        {data.mapped_icd10 ?? 'N/A'}
      </span>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content
        className="z-50 max-w-[220px] bg-slate-900 text-white text-[11px] px-3 py-2 rounded-lg shadow-xl leading-relaxed"
        sideOffset={4}
      >
        Code matched via <strong>icd10_semantic_search</strong> MCP tool using SNOMED CT mapping + cosine similarity ranking.
        <Tooltip.Arrow className="fill-slate-900" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

---

## 5. PHASE 4 — GLOBAL WIRING (Cmd+K + Framer Motion Root)

### 5A. Update `src/app/layout.tsx`

Wrap the app in Framer Motion's `LazyMotion` to reduce bundle size, and add the global Cmd+K listener.

Replace the layout with:

```typescript
// layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'V3.1 EHR Simulator | Clinical Intelligence Hub',
  description: 'High-fidelity Clinical Intelligence Dashboard — Aurora Clinical',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

> Note: `layout.tsx` stays as a server component. The Cmd+K listener must live in `page.tsx` as a client component.

### 5B. Add Cmd+K listener to `src/app/page.tsx`

Inside the `Home()` component (already marked `"use client"`), add:

```typescript
// Add state at the top of Home()
const [cmdOpen, setCmdOpen] = useState(false);

// Add effect for Cmd+K detection
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCmdOpen(prev => !prev);
    }
    if (e.key === 'Escape') setCmdOpen(false);
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

Then import and render `<CommandPalette>` at the very bottom of the JSX, just before the closing `</motion.div>`:
```typescript
import { CommandPalette } from '../components/CommandPalette';

// At bottom of returned JSX:
<CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
```

---

## 6. PHASE 4 — IMPLEMENTATION COMMANDS (EXACT SEQUENCE)

Run these in order from `v3-ehr-simulator/`:

```bash
# 1. Install all new dependencies
npm install framer-motion cmdk @radix-ui/react-tooltip recharts

# 2. Create the data directory
mkdir -p src/data

# 3. Create new component directories
# (src/components/ already exists)

# 4. Verify PostCSS config exists — if not, create it
ls postcss.config.mjs || cat > postcss.config.mjs << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOF

# 5. Build to verify no TypeScript errors
npm run build

# 6. Start dev server
npm run dev
```

---

## 7. EVALUATION CHECKLIST

After implementation, verify each of these before pushing to Vercel:

| Check | How to verify |
|---|---|
| Simulation Fallback visible | Remove `NEXT_PUBLIC_API_KEY` from `.env.local`. Reload. Status bar must show "Simulation Mode" in amber. |
| 70/30 layout intact | Resize window to 1280px wide. Sidebar must remain ≥350px, never collapse. |
| Critical vitals red | BP card must show `text-red-600 animate-pulse-critical` and red border. |
| Narrative toggle works | Press "Launch 24h Shift". Events must appear one-by-one on schedule. "Reset" clears all. |
| Timeline animates | Each new timeline card must slide in from the left using the `AnimatePresence` variant. |
| Sparklines visible | Every vital card must show a 50px-wide trend line to the right of the value. |
| Data stream ticks | Bottom of patient view must show FHIR pings updating every ~2.2s when narrative is active. |
| MCP Reasoning Chain | When `narrativeActive=true`, sidebar must show the AgentPlan reasoning steps. |
| Intelligence Glow | Type 3+ chars in search, get results. Sidebar must briefly glow blue (`shadow-blue`). |
| Tooltips on cards | Hover over ICD-10 code or HCC badge. Tooltip must explain the MCP tool used. |
| Cmd+K opens palette | Press ⌘K (or Ctrl+K on Windows). Command palette must open with search field focused. |
| Cmd+K closes on Esc | Press Esc or click backdrop. Palette must close. |
| Build clean | `npm run build` must produce zero TypeScript errors and zero `@tailwind` CSS warnings. |

---

## 8. THINGS TO EXPLICITLY NOT DO

- Do NOT rename or relocate `src/services/api.ts`. It is imported by its current path.
- Do NOT add dark mode toggling — the light Twitter theme is intentional and final.
- Do NOT add "pretty" animations that hide medical data. Every animation must reveal or emphasize data, never replace it.
- Do NOT remove the `ErrorBoundary` from around `IntelligentSidebar`.
- Do NOT change the `w-[30%] min-w-[350px]` layout constraint.
- Do NOT use `alert()` for any new notifications — the existing HITL uses `alert()` as a known V3 stub. New additions should use a styled toast (or just a no-op stub) rather than `alert()`.
- Do NOT make sparklines interactive/clickable — they are read-only at this stage.
- Do NOT hook Command Palette items to real navigation yet — all items render with "Coming soon" and are no-ops.

---

## 9. ARCHITECTURE DIAGRAM

```
src/
├── app/
│   ├── globals.css          [unchanged — light Twitter theme]
│   ├── layout.tsx           [unchanged — font injection only]
│   └── page.tsx             [UPDATED — adds scenario engine, timeline, data stream, sparklines, Cmd+K]
│
├── components/
│   ├── NarrativeToggle.tsx  [NEW — toggles scenario on/off]
│   ├── PatientTimeline.tsx  [NEW — animated 24h event feed]
│   ├── DataStream.tsx       [NEW — FHIR ping ticker]
│   ├── Sparkline.tsx        [NEW — recharts mini trend lines]
│   ├── AgentPlan.tsx        [NEW — MCP reasoning chain steps]
│   ├── CommandPalette.tsx   [NEW — Cmd+K power-user navigation]
│   └── Sidebar/
│       ├── ErrorBoundary.tsx    [unchanged]
│       ├── IntelligentSidebar.tsx [UPDATED — shine effect + AgentPlan + Cmd+K hint]
│       └── SuggestionCard.tsx   [UPDATED — Radix tooltips on ICD-10 + HCC]
│
├── data/
│   └── mockScenario.ts      [NEW — Heart Failure scenario script + vitals history + reasoning steps]
│
├── lib/
│   └── utils.ts             [unchanged]
│
└── services/
    └── api.ts               [unchanged — 300ms debounce + simulation fallback PRESERVED]
```
