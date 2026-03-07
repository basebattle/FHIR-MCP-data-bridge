'use client';

import { useDemoOrchestrator } from '@/hooks/useDemoOrchestrator';
import { ALL_SCENARIOS } from '@/data/clinicalScenarios';
import { DemoProgressBar } from '@/components/DemoProgressBar';
import { PatientTimeline } from '@/components/PatientTimeline';
import { AgentPlan } from '@/components/AgentPlan';
import { DataStream } from '@/components/DataStream';
import { Sparkline } from '@/components/Sparkline';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  Play, RotateCcw, ChevronLeft, ChevronRight,
  Moon, Sun, Zap, MessageCircle, CheckCircle2, Circle, Activity
} from 'lucide-react';

export default function SimulatorPage() {
  const { state, currentStep, totalSteps, progressPct, startDemo, nextStep, prevStep, reset } = useDemoOrchestrator();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const scenario = state.scenario;
  const isActive = state.isActive;
  const isComplete = state.phase === 'complete';
  const stepType = currentStep?.type;

  const showRightPanel = stepType === 'search' || stepType === 'reasoning' || stepType === 'hitl' || state.demoSearchQuery || state.visibleReasoningSteps.length > 0;

  return (
    <div className="w-full min-h-screen bg-[var(--background)] flex">
      {/* ── LEFT NAVIGATION RAIL (Superdesign Stepper) ────────────────── */}
      {isActive && (
        <aside className="w-72 border-r border-[var(--border-subtle)] bg-[var(--surface-0)] flex flex-col shrink-0">
          <div className="p-6 border-b border-[var(--border-subtle)]">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-[var(--primary)] rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">FM</span>
              </div>
              <span className="font-bold text-sm tracking-tight text-[var(--foreground)]">FHIR-MCP Bridge</span>
            </Link>
            <p className="text-2xs font-bold uppercase tracking-clinical text-[var(--muted-foreground)]">Workflow Progress</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {state.steps.map((step, idx) => {
              const isPast = idx < state.currentStepIndex;
              const isCurrent = idx === state.currentStepIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isCurrent ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}
                >
                  <div className="flex-shrink-0">
                    {isPast ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[var(--primary)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                      </div>
                    ) : (
                      <Circle size={16} className="opacity-20" />
                    )}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest leading-tight ${isCurrent ? 'opacity-100' : 'opacity-40'}`}>{step.title}</span>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-[var(--border-subtle)]">
            <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              <RotateCcw size={12} /> Reset System
            </button>
          </div>
        </aside>
      )}

      {/* ── MAIN WORKSPACE ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="frosted-nav px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              {!isActive && (
                <Link href="/" className="font-bold text-sm hover:text-[var(--primary)] transition-colors">
                  ← Back to Landing
                </Link>
              )}
              {scenario && (
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-[var(--primary)]" />
                  <p className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest">{scenario.name}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isActive && <DemoProgressBar currentStep={state.currentStepIndex} totalSteps={totalSteps} />}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--muted)] transition-colors"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-6 w-full">
          {/* IDLE: Rich Vertical Scenario Selection */}
          {!isActive && !scenario && (
            <div className="max-w-3xl mx-auto py-12">
              <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--card)] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                  <Zap size={10} className="text-[var(--primary)]" />
                  Clinical Protocol Selection
                </div>
                <h1 className="text-4xl font-black mb-4 tracking-tighter text-[var(--foreground)]">Choose AI Logic Path</h1>
                <p className="text-[var(--muted-foreground)]">Select a verified clinical scenario to begin the step-by-step engine walkthrough.</p>
              </div>

              <div className="space-y-4">
                {ALL_SCENARIOS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => startDemo(s.id)}
                    className="wizard-card w-full text-left group flex items-start gap-6 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-[var(--primary)] uppercase tracking-widest">{s.id.replace(/-/g, ' ')}</p>
                        <ChevronRight size={16} className="text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h2 className="text-xl font-bold mb-2 text-[var(--foreground)]">{s.name}</h2>
                      <p className="text-sm text-[var(--muted-foreground)] mb-4">{s.tagline}</p>

                      {/* Industrial ASCII Data Preview */}
                      <pre className="select-none">
                        {`[NODE_INFO] status: READY\n[BRIDGE] fhir_r4 -> mcp_v3\n[TRACE] auth_check: true\n[DATA] ${s.patient.firstName.charAt(0)}_${s.patient.mrn.slice(-4)}`}
                      </pre>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE WORKSPACE */}
          {scenario && isActive && (
            <div className="space-y-8 animate-fade-in">
              {/* Pro Max Speech Bubble */}
              {!isComplete && currentStep && (
                <div className="speech-bubble relative overflow-hidden border-2 shadow-2xl">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary)]" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shrink-0">
                      <MessageCircle size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-1.5">
                        {currentStep.title}
                      </p>
                      <p className="text-base font-medium text-[var(--foreground)] leading-relaxed">
                        {currentStep.narration}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-Column Data View */}
              <div className={`grid gap-8 ${showRightPanel ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <div className={`space-y-6 ${showRightPanel ? 'lg:col-span-2' : ''}`}>
                  {/* Patient Identity */}
                  <div className="wizard-card active p-6 bg-gradient-to-br from-[var(--surface-1)] to-[rgba(33,33,33,1)]">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-2xs font-bold uppercase tracking-[0.15em] text-[var(--primary)] mb-2">Subject Identifier</p>
                        <h2 className="text-2xl font-black tracking-tight">{scenario.patient.firstName} {scenario.patient.name}</h2>
                        <div className="flex gap-3 mt-2 text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
                          <span>MRN: {scenario.patient.mrn}</span>
                          <span>•</span>
                          <span>{scenario.patient.sex}</span>
                          <span>•</span>
                          <span>{scenario.patient.dob}</span>
                        </div>
                      </div>
                      <div className="border-l border-[var(--border-subtle)] pl-8">
                        <p className="text-2xs font-bold uppercase tracking-[0.15em] text-[var(--primary)] mb-2">Clinical Context</p>
                        <h2 className="text-lg font-bold leading-tight mb-2">{scenario.name}</h2>
                        <pre className="text-[9px] opacity-40 selection:bg-orange-500/30">
                          {`protocol_id: ${scenario.id.toUpperCase()}\nengine_v: 3.1_f\nstatus: ACTIVE`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Operational Telemetry (Vitals) */}
                  {state.currentStepIndex >= 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {scenario.vitals.map((vital, i) => (
                        <div key={i} className="wizard-card p-4 hover:shadow-md">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1">{vital.label}</p>
                          <p className="text-xl font-black">{vital.value} <span className="text-xs font-medium text-[var(--muted-foreground)] normal-case">{vital.unit}</span></p>
                          <div className="mt-3 opacity-60">
                            <Sparkline
                              data={vital.history.map((v, j) => ({ time: `t${j}`, value: v }))}
                              status={vital.status}
                              height={18}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Event Stream */}
                  {state.visibleEvents.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Protocol Timeline</h3>
                      <PatientTimeline events={state.visibleEvents} />
                    </div>
                  )}

                  {/* HITL Completion UI */}
                  {isComplete && (
                    <div className="wizard-card active p-10 text-center border-green-500 shadow-green-500/10">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} className="text-white" />
                      </div>
                      <h3 className="text-3xl font-black text-[var(--foreground)] mb-2">Simulation Success</h3>
                      <p className="text-[var(--muted-foreground)] mb-8">All FHIR/MCP resources finalized and clinical record synchronized.</p>
                      <button onClick={reset} className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-lg hover:shadow-xl transition-all">
                        <RotateCcw size={16} /> Run New Sequence
                      </button>
                    </div>
                  )}
                </div>

                {/* Intelligence Side Column */}
                {showRightPanel && (
                  <div className="space-y-6">
                    {state.demoSearchQuery && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Knowledge Retrieval</h3>
                        <DataStream query={state.demoSearchQuery} />
                      </div>
                    )}
                    {state.visibleReasoningSteps.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">AI Decision Logic</h3>
                        <AgentPlan steps={state.visibleReasoningSteps} highlightApprove={state.showHitl} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ── STICKY NAVIGATION FOOTER (Superdesign Style) ─────────── */}
        {isActive && !isComplete && (
          <footer className="demo-footer">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={state.currentStepIndex <= 0}
                className="px-6 py-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-0)] text-[10px] font-black uppercase tracking-[0.15em] disabled:opacity-20 hover:bg-[var(--muted)] transition-all"
              >
                ← Back
              </button>

              <div className="flex items-center gap-1.5">
                {state.steps.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === state.currentStepIndex ? 'w-6 bg-[var(--primary)]' : i < state.currentStepIndex ? 'bg-green-500' : 'bg-[var(--border-subtle)]'}`} />
                ))}
              </div>

              <button
                onClick={nextStep}
                className="px-8 py-2.5 rounded-full bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-[var(--primary)]/20 transition-all active:scale-95"
              >
                {state.currentStepIndex === state.steps.length - 1 ? 'Finish' : 'Next →'}
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
