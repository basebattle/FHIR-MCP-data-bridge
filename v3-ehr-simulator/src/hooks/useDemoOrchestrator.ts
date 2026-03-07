"use client";
import { useState, useCallback } from 'react';
import { ALL_SCENARIOS, getRandomScenario, type ClinicalScenario, type TimelineEvent, type ReasoningStep } from '../data/clinicalScenarios';

/*
  STEP TYPES — each step in the demo is one of these:
  - 'patient'      → Show patient card + vitals (step 0)
  - 'vitals'       → Show vitals detail (step 1)
  - 'event'        → Show a timeline event (steps 2–7, one per event)
  - 'search'       → Show the AI search query (step 8)
  - 'reasoning'    → Show reasoning steps panel (step 9)
  - 'hitl'         → Show approval UI (step 10)
  - 'complete'     → Show success card (step 11)
*/
export type StepType = 'patient' | 'vitals' | 'event' | 'search' | 'reasoning' | 'hitl' | 'complete';

export interface DemoStep {
  type: StepType;
  title: string;
  narration: string;
  eventIndex?: number;    // for 'event' type — which timeline event to show
}

export interface DemoState {
  phase: 'idle' | 'active' | 'complete';
  scenario: ClinicalScenario | null;
  currentStepIndex: number;
  steps: DemoStep[];
  visibleEvents: TimelineEvent[];
  visibleReasoningSteps: ReasoningStep[];
  demoSearchQuery: string;
  showHitl: boolean;
  isActive: boolean;
}

function buildSteps(scenario: ClinicalScenario): DemoStep[] {
  const steps: DemoStep[] = [];

  // Step 0: Patient intake
  steps.push({
    type: 'patient',
    title: 'Patient Intake',
    narration: `Meet ${scenario.patient.firstName} ${scenario.patient.name}. The engine has loaded their demographics and primary condition: ${scenario.name}. This data was pulled from the FHIR Patient resource.`,
  });

  // Step 1: Vitals assessment
  steps.push({
    type: 'vitals',
    title: 'Vitals Assessment',
    narration: `The engine reads real-time vitals via FHIR Observation resources. Each vital sign is color-coded by severity — critical values trigger automated alerts through the MCP pipeline.`,
  });

  // Steps 2–7: Timeline events (one per event)
  scenario.timelineEvents.forEach((event, idx) => {
    steps.push({
      type: 'event',
      title: event.title,
      narration: event.narration || `The engine processed a ${event.type} event: ${event.title}. FHIR resource: ${event.fhirResource || 'N/A'}.`,
      eventIndex: idx,
    });
  });

  // Step 8: AI Search
  steps.push({
    type: 'search',
    title: 'AI Search & Analysis',
    narration: `The intelligence engine queries the clinical knowledge base with: "${scenario.demoSearchQuery}". This semantic search maps symptoms to ICD-10 codes and identifies HCC risk categories.`,
  });

  // Step 9: Reasoning pipeline
  steps.push({
    type: 'reasoning',
    title: 'Reasoning Pipeline',
    narration: `Here's the AI reasoning chain. Each step represents a discrete operation — from FHIR data retrieval through semantic parsing, code matching, risk calculation, and drug suggestion. All steps complete before human review.`,
  });

  // Step 10: HITL approval
  steps.push({
    type: 'hitl',
    title: 'Human-in-the-Loop Review',
    narration: `Before any changes are committed to the medical record, a clinical reviewer must approve the AI recommendations. This is the safety gate — no automated writes without human sign-off.`,
  });

  // Step 11: Complete
  steps.push({
    type: 'complete',
    title: 'Workflow Complete',
    narration: `The clinical workflow is complete. All FHIR resources have been created, ICD-10 codes confirmed, HCC risk captured, and the FHIR Bundle synced to the endpoint — all with clinician approval.`,
  });

  return steps;
}

export function useDemoOrchestrator() {
  const [state, setState] = useState<DemoState>({
    phase: 'idle',
    scenario: null,
    currentStepIndex: 0,
    steps: [],
    visibleEvents: [],
    visibleReasoningSteps: [],
    demoSearchQuery: '',
    showHitl: false,
    isActive: false,
  });

  const reset = useCallback(() => {
    setState({
      phase: 'idle',
      scenario: null,
      currentStepIndex: 0,
      steps: [],
      visibleEvents: [],
      visibleReasoningSteps: [],
      demoSearchQuery: '',
      showHitl: false,
      isActive: false,
    });
  }, []);

  const startDemo = useCallback((scenarioId?: string) => {
    const scenario = scenarioId
      ? ALL_SCENARIOS.find(s => s.id === scenarioId) ?? getRandomScenario()
      : getRandomScenario();

    const steps = buildSteps(scenario);

    setState({
      phase: 'active',
      scenario,
      currentStepIndex: 0,
      steps,
      visibleEvents: [],
      visibleReasoningSteps: [],
      demoSearchQuery: '',
      showHitl: false,
      isActive: true,
    });
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (!prev.scenario || !prev.isActive) return prev;

      const nextIndex = prev.currentStepIndex + 1;
      if (nextIndex >= prev.steps.length) {
        return { ...prev, phase: 'complete', currentStepIndex: nextIndex - 1 };
      }

      const nextStepDef = prev.steps[nextIndex];
      const updates: Partial<DemoState> = { currentStepIndex: nextIndex };

      // Accumulate visible data based on step type
      if (nextStepDef.type === 'event' && nextStepDef.eventIndex !== undefined) {
        const event = prev.scenario!.timelineEvents[nextStepDef.eventIndex];
        updates.visibleEvents = [...prev.visibleEvents, event];
      }
      if (nextStepDef.type === 'search') {
        updates.demoSearchQuery = prev.scenario!.demoSearchQuery;
      }
      if (nextStepDef.type === 'reasoning') {
        updates.visibleReasoningSteps = prev.scenario!.reasoningSteps;
      }
      if (nextStepDef.type === 'hitl') {
        updates.showHitl = true;
      }
      if (nextStepDef.type === 'complete') {
        updates.phase = 'complete';
      }

      return { ...prev, ...updates };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => {
      if (!prev.scenario || prev.currentStepIndex <= 0) return prev;

      const prevIndex = prev.currentStepIndex - 1;

      // Rebuild visible state by replaying steps 0..prevIndex
      let visibleEvents: TimelineEvent[] = [];
      let visibleReasoningSteps: ReasoningStep[] = [];
      let demoSearchQuery = '';
      let showHitl = false;

      for (let i = 0; i <= prevIndex; i++) {
        const step = prev.steps[i];
        if (step.type === 'event' && step.eventIndex !== undefined) {
          visibleEvents = [...visibleEvents, prev.scenario!.timelineEvents[step.eventIndex]];
        }
        if (step.type === 'search') demoSearchQuery = prev.scenario!.demoSearchQuery;
        if (step.type === 'reasoning') visibleReasoningSteps = prev.scenario!.reasoningSteps;
        if (step.type === 'hitl') showHitl = true;
      }

      return {
        ...prev,
        phase: 'active',
        currentStepIndex: prevIndex,
        visibleEvents,
        visibleReasoningSteps,
        demoSearchQuery,
        showHitl,
      };
    });
  }, []);

  // Computed helpers
  const currentStep = state.steps[state.currentStepIndex] || null;
  const totalSteps = state.steps.length;
  const progressPct = totalSteps > 0 ? Math.round((state.currentStepIndex / (totalSteps - 1)) * 100) : 0;

  return { state, currentStep, totalSteps, progressPct, startDemo, nextStep, prevStep, reset };
}
