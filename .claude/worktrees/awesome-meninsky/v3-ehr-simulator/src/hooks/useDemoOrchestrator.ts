'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import type { ClinicalScenario, TimelineEvent, DemoPhase } from '../data/clinicalScenarios';

export type { DemoPhase };

export interface DemoState {
  phase: DemoPhase;
  scenario: ClinicalScenario | null;
  visibleEvents: TimelineEvent[];
  demoSearchQuery: string;
  progressPct: number;
  showTimeline: boolean;
  isActive: boolean;
  narration: string;
  completedSteps: number;
  activeEventIndex: number;
}

const NARRATIONS: Record<DemoPhase, string> = {
  idle:         '',
  loading:      'Connecting to FHIR R4 server and loading patient record...',
  narrative:    "Reading the patient's clinical timeline. Watch for critical alerts highlighted in red.",
  intelligence: 'The MCP agent is performing semantic analysis — mapping clinical text to ICD-10 codes.',
  hitl:         'AI recommendations are ready. A licensed clinician must review and approve before any data is committed.',
  complete:     'Workflow complete. Conditions confirmed, HCC risk captured, record updated in the FHIR store.',
};

// Absolute times (ms from demo start):
// loading:     0 → 4000
// narrative:   4000 → 28000  (events at: 4000, 8000, 12000, 17000, 22000, 26000)
// intelligence: 28000 → 44000
// hitl:         44000 → 56000
// complete:     56000 → 60000

const PHASE_TIMELINE = {
  loadingStart:      0,
  narrativeStart:    4000,
  intelligenceStart: 28000,
  hitlStart:         44000,
  completeStart:     56000,
  demoEnd:           60000,
};

const EVENT_OFFSETS = [0, 4000, 8000, 13000, 18000, 22000]; // relative to narrativeStart

const TYPING_DELAY_MS = 40;    // ms per character
const REASONING_STEP_DELAY = 1500; // ms between reasoning steps

const INITIAL_STATE: DemoState = {
  phase:            'idle',
  scenario:         null,
  visibleEvents:    [],
  demoSearchQuery:  '',
  progressPct:      0,
  showTimeline:     false,
  isActive:         false,
  narration:        '',
  completedSteps:   0,
  activeEventIndex: -1,
};

export function useDemoOrchestrator() {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    cancelAnimationFrame(rafRef.current);
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  const startDemo = useCallback((scenario: ClinicalScenario) => {
    clearAll();
    startTimeRef.current = Date.now();

    setState({
      ...INITIAL_STATE,
      phase:    'loading',
      scenario,
      isActive: true,
      narration: NARRATIONS.loading,
      progressPct: 0,
    });

    // --- Progress RAF loop ---
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / PHASE_TIMELINE.demoEnd) * 100, 100);
      setState(s => ({ ...s, progressPct: pct }));
      if (elapsed < PHASE_TIMELINE.demoEnd) {
        rafRef.current = requestAnimationFrame(updateProgress);
      }
    };
    rafRef.current = requestAnimationFrame(updateProgress);

    // --- NARRATIVE phase ---
    schedule(() => {
      setState(s => ({
        ...s,
        phase:        'narrative',
        showTimeline: true,
        narration:    NARRATIONS.narrative,
      }));

      // Stream timeline events with deliberate pauses
      scenario.events.forEach((event, i) => {
        schedule(() => {
          setState(s => ({
            ...s,
            visibleEvents:    [...s.visibleEvents, event],
            activeEventIndex: i,
          }));
        }, EVENT_OFFSETS[i]);
      });
    }, PHASE_TIMELINE.narrativeStart);

    // --- INTELLIGENCE phase ---
    schedule(() => {
      setState(s => ({
        ...s,
        phase:     'intelligence',
        narration: NARRATIONS.intelligence,
      }));

      // Auto-type the search query
      const query = scenario.searchQuery;
      let charIndex = 0;
      const typeNext = () => {
        if (charIndex < query.length) {
          const partial = query.slice(0, charIndex + 1);
          charIndex++;
          setState(s => ({ ...s, demoSearchQuery: partial }));
          schedule(typeNext, TYPING_DELAY_MS);
        } else {
          // Typing done — start revealing reasoning steps
          const totalSteps = scenario.reasoningSteps.length;
          for (let step = 1; step <= totalSteps; step++) {
            schedule(() => {
              setState(s => ({ ...s, completedSteps: step }));
            }, step * REASONING_STEP_DELAY);
          }
        }
      };
      schedule(typeNext, TYPING_DELAY_MS);
    }, PHASE_TIMELINE.intelligenceStart);

    // --- HITL phase ---
    schedule(() => {
      setState(s => ({
        ...s,
        phase:     'hitl',
        narration: NARRATIONS.hitl,
      }));
    }, PHASE_TIMELINE.hitlStart);

    // --- COMPLETE phase ---
    schedule(() => {
      setState(s => ({
        ...s,
        phase:     'complete',
        narration: NARRATIONS.complete,
        isActive:  false,
        progressPct: 100,
      }));
      cancelAnimationFrame(rafRef.current);
    }, PHASE_TIMELINE.completeStart);
  }, [clearAll, schedule]);

  const resetDemo = useCallback(() => {
    clearAll();
    cancelAnimationFrame(rafRef.current);
    setState(INITIAL_STATE);
  }, [clearAll]);

  const approveHITL = useCallback(() => {
    setState(s => ({
      ...s,
      phase:     'complete',
      narration: NARRATIONS.complete,
      isActive:  false,
      progressPct: 100,
    }));
    clearAll();
    cancelAnimationFrame(rafRef.current);
  }, [clearAll]);

  // Cleanup on unmount
  useEffect(() => () => { clearAll(); cancelAnimationFrame(rafRef.current); }, [clearAll]);

  return { state, startDemo, resetDemo, approveHITL };
}
