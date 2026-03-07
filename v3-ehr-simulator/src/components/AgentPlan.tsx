'use client';

import { ReasoningStep } from '@/data/clinicalScenarios';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface AgentPlanProps {
  steps: ReasoningStep[];
  highlightApprove?: boolean;
}

export function AgentPlan({ steps, highlightApprove = false }: AgentPlanProps) {
  return (
    <div className="space-y-2">
      <div className="mb-3 px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-1">Reasoning Pipeline</p>
        <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">AI Sequence Trace</p>
      </div>

      {steps.map((step, idx) => {
        const isComplete = step.status === 'complete';
        return (
          <div
            key={step.id}
            className={`wizard-card ${isComplete ? 'completed' : ''}`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {isComplete ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : (
                  <Circle size={18} className="text-[var(--muted-foreground)] opacity-40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${isComplete ? '' : 'opacity-40'}`}>{step.label}</p>
                <p className="text-2xs text-[var(--muted-foreground)] mt-0.5">{step.detail}</p>
              </div>
            </div>
          </div>
        );
      })}

      {highlightApprove && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
          <button className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xs rounded-lg hover:shadow-lg transition-all animate-pulse-critical shadow-lg shadow-green-500/20">
            Approve & Commit
          </button>
        </div>
      )}
    </div>
  );
}
