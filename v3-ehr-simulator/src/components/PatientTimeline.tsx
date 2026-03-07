'use client';

import { TimelineEvent } from '@/data/clinicalScenarios';

interface PatientTimelineProps {
  events: TimelineEvent[];
}

const severityBorder: Record<string, string> = {
  critical: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-green-500',
};

const severityBadge: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export function PatientTimeline({ events }: PatientTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted-foreground)]">
        <p className="text-sm">Waiting for timeline events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, idx) => (
        <div
          key={event.id}
          className={`wizard-card border-l-[3px] ${severityBorder[event.severity] || 'border-l-[var(--primary)]'} animate-fade-in-up`}
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <p className="text-2xs font-bold uppercase tracking-clinical text-[var(--primary)] mb-1">{event.type}</p>
              <p className="font-semibold text-sm leading-snug">{event.title}</p>
            </div>
            <span className="text-2xs font-bold text-[var(--muted-foreground)] shrink-0">{event.time}</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">{event.body}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-2xs font-bold uppercase px-2 py-0.5 rounded border ${severityBadge[event.severity]}`}>
              {event.severity}
            </span>
            {event.fhirResource && <span className="badge-fhir">{event.fhirResource}</span>}
            {event.mcpTool && <span className="badge-mcp">{event.mcpTool}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
