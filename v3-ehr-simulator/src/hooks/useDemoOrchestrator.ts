"use client";
import { useState, useCallback, useEffect, useRef } from 'react';
import { ALL_SCENARIOS, getRandomScenario, type ClinicalScenario, type TimelineEvent, type ReasoningStep } from '../data/clinicalScenarios';

/*
  PHASES:
  - 'idle'      → Landing page, choosing scenario
  - 'intake'    → Patient banner + demographics entrance
  - 'vitals'    → Vital signs grid appear + sparkline draw
  - 'events'    → Sequential timeline event firing
  - 'analysis'  → AI Search terminal typing + reasoning graph
  - 'hitl'      → Human-in-the-Loop review modal
  - 'complete'  → Final stats card + confetti
*/
export type Phase = 'idle' | 'intake' | 'vitals' | 'events' | 'analysis' | 'hitl' | 'complete';

export interface OrchestratorState {
  phase: Phase;
  scenario: ClinicalScenario | null;
  // Event stream state
  visibleEvents: TimelineEvent[];
  eventIndex: number;
  // Analysis state
  isAnalyzing: boolean;
  typingProgress: number;
  reasoningProgress: number;
  // Meta
  isAutoAdvance: boolean;
  elapsedMs: number;
  auditId: string | null;
}

export function useDemoOrchestrator() {
  const [state, setState] = useState<OrchestratorState>({
    phase: 'idle',
    scenario: null,
    visibleEvents: [],
    eventIndex: -1,
    isAnalyzing: false,
    typingProgress: 0,
    reasoningProgress: 0,
    isAutoAdvance: true,
    elapsedMs: 0,
    auditId: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({
      phase: 'idle',
      scenario: null,
      visibleEvents: [],
      eventIndex: -1,
      isAnalyzing: false,
      typingProgress: 0,
      reasoningProgress: 0,
      isAutoAdvance: true,
      elapsedMs: 0,
      auditId: null,
    });
  }, []);

  const setPhase = useCallback((phase: Phase) => {
    setState(prev => ({ ...prev, phase }));
  }, []);

  const advancePhase = useCallback(() => {
    setState(prev => {
      switch (prev.phase) {
        case 'idle': return prev;
        case 'intake': return { ...prev, phase: 'vitals' };
        case 'vitals': return { ...prev, phase: 'events', eventIndex: 0 };
        case 'events':
          if (prev.scenario && prev.eventIndex < prev.scenario.timelineEvents.length - 1) {
            return {
              ...prev,
              eventIndex: prev.eventIndex + 1,
              visibleEvents: [...prev.visibleEvents, prev.scenario.timelineEvents[prev.eventIndex + 1]]
            };
          }
          return { ...prev, phase: 'analysis' };
        case 'analysis': return { ...prev, phase: 'hitl' };
        case 'hitl': return { ...prev, phase: 'complete', auditId: crypto.randomUUID() };
        case 'complete': return { ...prev, phase: 'idle' };
        default: return prev;
      }
    });
  }, []);

  const startDemo = useCallback((scenarioId?: string) => {
    const scenario = scenarioId
      ? ALL_SCENARIOS.find(s => s.id === scenarioId) ?? getRandomScenario()
      : getRandomScenario();

    setState(prev => ({
      ...prev,
      phase: 'intake',
      scenario,
      visibleEvents: [],
      eventIndex: -1,
      elapsedMs: 0,
      auditId: null,
    }));
  }, []);

  // Effect to handle auto-advancing phases
  useEffect(() => {
    if (!state.isAutoAdvance || state.phase === 'idle' || state.phase === 'analysis' || state.phase === 'hitl') return;

    const phaseDurations: Record<Phase, number> = {
      idle: 0,
      intake: 4000,
      vitals: 4000,
      events: 2500, // per event
      analysis: 0, // Manual/Animation driven
      hitl: 0,     // Manual trigger
      complete: 0,
    };

    const duration = phaseDurations[state.phase];
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        advancePhase();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.phase, state.eventIndex, state.isAutoAdvance, advancePhase]);

  return {
    state,
    startDemo,
    advancePhase,
    setPhase,
    reset,
    toggleAutoAdvance: () => setState(p => ({ ...p, isAutoAdvance: !p.isAutoAdvance }))
  };
}
