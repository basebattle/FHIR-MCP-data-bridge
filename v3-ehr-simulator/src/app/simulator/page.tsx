"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDemoOrchestrator } from "@/hooks/useDemoOrchestrator";
import { PatientBanner } from "@/components/simulator/PatientBanner";
import { VitalsGrid } from "@/components/simulator/VitalsGrid";
import { SearchTerminal } from "@/components/simulator/SearchTerminal";
import { ReasoningGraph } from "@/components/simulator/ReasoningGraph";
import IntelligentSidebar from "@/components/Sidebar/IntelligentSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Play, RotateCcw, AlertTriangle, CheckCircle2, FlaskConical, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const { state, startDemo, advancePhase, reset } = useDemoOrchestrator();

  useEffect(() => {
    if (scenarioId && state.phase === 'idle') {
      startDemo(scenarioId);
    }
  }, [scenarioId, state.phase, startDemo]);

  if (state.phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground animate-pulse">
          <FlaskConical size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Scenario Loaded</h2>
          <p className="text-muted-foreground">Please select a scenario from the library to begin.</p>
        </div>
        <a href="/" className="px-6 py-3 rounded-2xl bg-primary text-white font-bold hover:scale-105 transition-transform">
          Return to Library
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <PatientBanner scenario={state.scenario} />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
          {/* Progress Bar */}
          <div className="w-full flex items-center gap-4 mb-4">
            {['intake', 'vitals', 'events', 'analysis', 'hitl', 'complete'].map((p, i) => {
              const activeIdx = ['intake', 'vitals', 'events', 'analysis', 'hitl', 'complete'].indexOf(state.phase);
              const isPast = activeIdx > i;
              const isCurrent = activeIdx === i;

              return (
                <div key={p} className="flex-1 flex flex-col gap-2">
                  <div className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    isPast ? "bg-clinical-nominal" : isCurrent ? "bg-primary" : "bg-muted"
                  )} />
                  <span className={cn(
                    "text-[9px] uppercase font-bold tracking-widest",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>{p}</span>
                </div>
              );
            })}
          </div>

          {/* Phase Layouts */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">

            {/* Left Column: Context & Evidence */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <AnimatePresence mode="wait">
                {state.phase === 'intake' || state.phase === 'vitals' || state.phase === 'events' ? (
                  <motion.div
                    key="vitals-section"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <VitalsGrid vitals={state.scenario?.vitals || []} />

                    {/* Timeline Events Column */}
                    <div className="bg-card border border-border rounded-[2rem] p-8 min-h-[300px]">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                        <ClipboardList size={16} />
                        Clinical Event Stream
                      </h3>
                      <div className="space-y-4">
                        {state.visibleEvents.length === 0 && (
                          <div className="h-40 flex items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground italic text-sm">
                            Awaiting timeline triggers...
                          </div>
                        )}
                        {state.visibleEvents.map((event, idx) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "p-4 rounded-2xl border flex gap-4 items-start transition-all",
                              event.severity === 'critical' ? "bg-clinical-critical/[0.03] border-clinical-critical/20" : "bg-muted/50 border-border"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              event.severity === 'critical' ? "bg-clinical-critical/10 text-clinical-critical" : "bg-primary/10 text-primary"
                            )}>
                              <AlertTriangle size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold font-mono text-muted-foreground">{event.time}</span>
                                <h4 className="font-bold text-sm">{event.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{event.body}</p>
                              {event.mcpTool && (
                                <div className="mt-2 text-[9px] font-mono font-bold text-primary/60 uppercase">
                                  EXEC: {event.mcpTool}()
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : state.phase === 'analysis' || state.phase === 'hitl' || state.phase === 'complete' ? (
                  <motion.div
                    key="analysis-section"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="flex flex-col gap-6 h-full"
                  >
                    <SearchTerminal
                      query={state.scenario?.demoSearchQuery || ""}
                      isAnalyzing={state.phase === 'analysis'}
                      className="flex-1"
                    />
                    <ReasoningGraph
                      steps={state.scenario?.reasoningSteps || []}
                      className="h-[300px]"
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Right Column: AI Insights & Controls */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-8 rounded-[2rem] bg-card border border-border shadow-sm flex-1 flex flex-col">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">Simulation Control</h3>

                {/* Status Indicator */}
                <div className="mb-8 p-4 rounded-2xl bg-muted/50 border border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Phase Status</span>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase truncate max-w-[100px]">
                      {state.phase}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Auto-Advance</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", state.isAutoAdvance ? "text-clinical-nominal bg-clinical-nominal/10" : "text-muted-foreground bg-muted")}>
                      {state.isAutoAdvance ? "Enabled" : "Paused"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mt-auto">
                  <button
                    onClick={advancePhase}
                    className="w-full py-4 rounded-2xl bg-foreground text-background font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {state.phase === 'hitl' ? "Confirm Final Diagnosis" : "Skip to Next Phase"}
                    <Play size={18} fill="currentColor" />
                  </button>
                  <button
                    onClick={reset}
                    className="w-full py-4 rounded-2xl border border-border font-bold flex items-center justify-center gap-2 hover:bg-muted transition-colors text-muted-foreground"
                  >
                    Reset Simulation
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>

              {/* Dynamic Suggestion Card (Placeholder for Intelligence) */}
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={18} className="text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Inference Confidence</span>
                </div>
                <div className="text-3xl font-mono font-bold text-foreground mb-1">94.2%</div>
                <p className="text-xs text-muted-foreground font-medium">Matching scenario markers against SNOMED-CT clinical terminology engine.</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <IntelligentSidebar />

      {/* HITL / Final Completion Interstitial Overlay */}
      <AnimatePresence>
        {state.phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-full bg-clinical-nominal/10 text-clinical-nominal flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Workflow Confirmed</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                The clinical reasoning cycle is complete. All confirmatory records have been pushed to the FHIR repository.
              </p>
              <div className="bg-muted/50 rounded-2xl p-6 mb-10 text-left space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground">AUDIT ID</span>
                  <span className="font-mono text-primary truncate max-w-[150px]">{state.auditId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground">LATENCY</span>
                  <span className="font-mono">14.2s (Aggregate)</span>
                </div>
              </div>
              <button
                onClick={reset}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-primary/20"
              >
                Run New Simulation
              </button>
              <a href="/" className="block mt-6 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                Exit to Library
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><div className="animate-pulse">Loading simulator environment...</div></div>}>
      <SimulatorContent />
    </Suspense>
  );
}
