import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ─────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────── */
export interface ClinicalIntelligenceData {
    original: string;
    system: string;
    mapped_icd10?: string;
    status?: string;
    hcc_data: {
        hcc_impact: boolean;
        category: string;
        weight: number;
        description: string;
    };
}

interface SuggestionCardProps {
    data?: ClinicalIntelligenceData;
    isLoading?: boolean;
    onApprove?: (data: ClinicalIntelligenceData) => void;
}

/* ─────────────────────────────────────────────────────────────────
   SuggestionCard
   ───────────────────────────────────────────────────────────────── */
const SuggestionCard: React.FC<SuggestionCardProps> = ({ data, isLoading, onApprove }) => {

    /* ── Loading skeleton ──────────────────────────────────────── */
    if (isLoading) {
        return (
            <div className={cn(
                'p-3 rounded-lg border border-[var(--border-subtle)]',
                'bg-[var(--surface-1)] mb-3 animate-shimmer',
                'h-[148px] flex items-center justify-center',
            )}>
                <span className="text-xs text-[var(--text-tertiary)] font-medium">
                    Analyzing clinical context…
                </span>
            </div>
        );
    }

    /* ── Empty / null state ────────────────────────────────────── */
    if (!data) {
        return (
            <div className={cn(
                'p-4 rounded-lg border border-dashed border-[var(--border-strong)]',
                'bg-[var(--surface-0)] mb-3',
                'flex flex-col items-center text-center gap-2',
            )}>
                <div className="w-10 h-10 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center">
                    <AlertCircle size={16} className="text-accent/60" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                    No clinical matches found
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                    Try a different term or manual entry.
                </p>
            </div>
        );
    }

    const isHccRisk = data.hcc_data.hcc_impact;

    /* ── Populated card ────────────────────────────────────────── */
    return (
        <div
            className={cn(
                'group relative rounded-lg border',
                'bg-white overflow-hidden mb-3',
                'hover:shadow-sm transition-all duration-200 ease-out',
                isHccRisk ? 'border-red-200 hover:border-red-300' : 'border-slate-200 hover:border-slate-300',
            )}
            role="article"
            aria-label={`Clinical suggestion: ${data.original}`}
        >
            {/* Left accent bar — red for HCC risk, green for nominal */}
            <div
                className={cn(
                    'absolute top-0 left-0 w-[3px] h-full rounded-l-lg',
                    isHccRisk ? 'bg-red-500' : 'bg-emerald-500',
                )}
                aria-hidden="true"
            />

            <div className="pl-3 pr-3 pt-3 pb-2">

                {/* Top row — source label + HCC badge */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                        <span className="text-2xs font-bold uppercase tracking-clinical text-[var(--muted-foreground)] block mb-0.5">
                            {data.system}
                        </span>
                        <p className="text-sm font-semibold text-[var(--foreground)] leading-tight truncate">
                            {data.original}
                        </p>
                    </div>
                    {isHccRisk && (
                        <span className={cn(
                            'shrink-0 text-2xs font-bold uppercase px-2 py-0.5 rounded-full',
                            'bg-red-500/10 text-red-400 border border-red-500/20',
                            'flex items-center gap-1',
                        )}>
                            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                            HCC Risk
                        </span>
                    )}
                </div>

                {/* Data grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[var(--surface-1)] rounded-md p-2 border border-[var(--border-subtle)]">
                        <span className="text-2xs font-bold uppercase tracking-clinical text-[var(--muted-foreground)] block mb-0.5">
                            ICD-10
                        </span>
                        <span className="font-mono font-bold text-base text-[var(--primary)] leading-none">
                            {data.mapped_icd10 ?? 'N/A'}
                        </span>
                    </div>
                    <div className="bg-[var(--surface-1)] rounded-md p-2 border border-[var(--border-subtle)]">
                        <span className="text-2xs font-bold uppercase tracking-clinical text-[var(--muted-foreground)] block mb-0.5">
                            HCC Weight
                        </span>
                        <span className="font-bold text-base text-[var(--foreground)] leading-none">
                            {data.hcc_data.weight.toFixed(3)}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-2 line-clamp-2">
                    {data.hcc_data.description}
                </p>

                {/* Approve button — h-12 (48px) ≥ 44px touch target ✓ */}
                <button
                    onClick={() => onApprove?.(data)}
                    className={cn(
                        'w-full h-12 rounded-md',
                        'bg-blue-600 hover:bg-blue-700 active:scale-[0.97]',
                        'text-white font-semibold text-xs uppercase tracking-clinical',
                        'flex items-center justify-center gap-2',
                        'transition-all duration-150',
                        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                        'focus-visible:ring-offset-white',
                    )}
                    aria-label={`Approve and add ${data.mapped_icd10} to chart`}
                >
                    <Check size={14} strokeWidth={2.5} />
                    Approve &amp; Add to Chart
                </button>
            </div>
        </div>
    );
};

export default SuggestionCard;
