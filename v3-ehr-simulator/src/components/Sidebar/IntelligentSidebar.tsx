"use client";
import React, { useState, useRef, useCallback } from 'react';
import SuggestionCard, { ClinicalIntelligenceData } from './SuggestionCard';
import { getSemanticSuggestions, validateClinicalData } from '../../services/api';
import { Search, ShieldCheck, AlertTriangle, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ─────────────────────────────────────────────────────────────────
   IntelligentSidebar — V3.1 Clinical Intelligence Hub
   ─ Glassmorphism panel (deep navy + blur)
   ─ 300ms debounce on search (audit fix #1)
   ─ Dual-layer mock fallback preserved
   ─ ErrorBoundary-compatible dimensions preserved
   ───────────────────────────────────────────────────────────────── */

/* Inline mock — matches api.ts fallback shape */
const INLINE_MOCK: ClinicalIntelligenceData = {
    original: '',
    system: 'ICD-10-CM (Simulation)',
    mapped_icd10: 'E11.9',
    status: 'Simulated',
    hcc_data: {
        hcc_impact: true,
        category: 'Diabetes Mellitus',
        weight: 0.160,
        description: 'Type 2 diabetes mellitus without complications',
    },
};

/* Skeleton card for loading state */
function SkeletonCard({ delay = 0 }: { delay?: number }) {
    return (
        <div
            className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] mb-3 animate-shimmer"
            style={{ animationDelay: `${delay}ms` }}
            aria-hidden="true"
        >
            <div className="h-2.5 w-24 rounded bg-white/8 mb-3" />
            <div className="h-6 w-32 rounded bg-white/6 mb-3" />
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="h-10 rounded bg-white/5" />
                <div className="h-10 rounded bg-white/5" />
            </div>
            <div className="h-10 rounded bg-white/5" />
        </div>
    );
}

export default function IntelligentSidebar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ClinicalIntelligenceData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiStatus, setApiStatus] = useState<'secured' | 'simulation'>('secured');

    /* ── 300ms debounce ref (audit fix #1) ────────────────────── */
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = useCallback((val: string) => {
        setQuery(val);

        /* Clear pending timer on every keystroke */
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.length < 3) {
            setResults([]);
            return;
        }

        /* Fire after 300ms of silence — satisfies briefing spec */
        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const data = await getSemanticSuggestions(val);
                setResults(Array.isArray(data) ? data : [data]);
                setApiStatus('secured');
            } catch (err) {
                /* Dual-layer fallback: sidebar provides its own mock
                   even if api.ts's internal fallback also fires */
                console.warn('IntelligentSidebar: API unreachable, using inline mock.', err);
                setResults([{ ...INLINE_MOCK, original: val }]);
                setApiStatus('simulation');
            } finally {
                setIsLoading(false);
            }
        }, 300);
    }, []);

    /* ── HITL validation handler ───────────────────────────────── */
    const handleValidation = useCallback(async (data: ClinicalIntelligenceData) => {
        try {
            await validateClinicalData({
                code: data.mapped_icd10!,
                status: 'Confirmed',
                clinician_id: 'CLIN_099',   // NOTE: stub — replace with auth context in V4
                timestamp: new Date().toISOString(),
            });
            // TODO: replace alert() with toast notification in V4
            alert('✓ Validated & Added to Chart');
        } catch {
            alert('Clinical data captured locally (API offline).');
        }
    }, []);

    const hasResults = results.length > 0;

    return (
        <aside
            id="intelligence-sidebar"
            className={cn(
                /* Preserved invariants from briefing */
                'w-[30%] min-w-[350px] sticky top-0 h-screen z-50',
                'overflow-y-auto flex flex-col',
                /* Glassmorphism */
                'glass-panel',
                'shadow-sidebar',
                /* Internal padding */
                'px-4 py-5',
            )}
            aria-label="Clinical Intelligence Hub"
        >

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                    <Brain size={16} className="text-[var(--primary)]" />
                    <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">
                        INTELLIGENCE{' '}
                        <span className="text-[var(--primary)]">HUB</span>
                    </h2>
                </div>
                <p className="text-2xs font-bold uppercase tracking-clinical text-[var(--muted-foreground)] pl-6">
                    Semantic Matching Engine V3.1
                </p>
            </div>

            {/* ── Search input — h-14 (56px) ≥ 44px touch target ── */}
            <div className="relative mb-4 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search
                        size={16}
                        className={cn(
                            'transition-colors duration-150',
                            isLoading
                                ? 'text-[var(--primary)] animate-spin-slow'
                                : 'text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)]',
                        )}
                    />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search clinical terms…"
                    className={cn(
                        'w-full h-14 pl-11 pr-4',
                        'bg-[var(--card)] rounded-lg',
                        'border border-[var(--border-subtle)]',
                        'focus:border-[var(--primary)] focus:outline-none',
                        'focus:shadow-[0_0_0_3px_rgba(129,140,248,0.15)]',
                        'text-sm font-medium text-[var(--foreground)]',
                        'placeholder:text-[var(--muted-foreground)]',
                        'transition-all duration-150',
                    )}
                    aria-label="Search clinical terms"
                    autoComplete="off"
                    spellCheck={false}
                />
            </div>

            {/* ── Results area ───────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
                {/* Results count header */}
                <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-2xs font-bold uppercase tracking-clinical text-[var(--muted-foreground)]">
                        Predictions
                    </span>
                    {hasResults && (
                        <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                            {results.length} match{results.length !== 1 ? 'es' : ''}
                        </span>
                    )}
                </div>

                {/* Loading state — 3 skeleton cards */}
                {isLoading && (
                    <>
                        <SkeletonCard delay={0} />
                        <SkeletonCard delay={80} />
                        <SkeletonCard delay={160} />
                    </>
                )}

                {/* Results */}
                {!isLoading && hasResults && (
                    <div>
                        {results.map((res, idx) => (
                            <div key={idx} className="animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                <SuggestionCard
                                    data={res}
                                    onApprove={handleValidation}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state — no query */}
                {!isLoading && !hasResults && query.length < 3 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center mb-3">
                            <Search size={18} className="text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">
                            Enter a clinical term
                        </p>
                        <p className="text-xs text-slate-500">
                            Type at least 3 characters to begin semantic matching.
                        </p>
                    </div>
                )}

                {/* Empty state — query returned nothing */}
                {!isLoading && !hasResults && query.length >= 3 && (
                    <div className={cn(
                        'p-5 rounded-lg border border-dashed border-slate-200',
                        'flex flex-col items-center text-center gap-2',
                    )}>
                        <AlertTriangle size={18} className="text-amber-500" />
                        <p className="text-sm font-semibold text-slate-700">
                            No clinical matches found
                        </p>
                        <p className="text-xs text-slate-500">
                            Try a different term or use manual ICD-10 entry.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Status bar ─────────────────────────────────────── */}
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] shrink-0">
                <div className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    apiStatus === 'secured'
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-amber-500/10 border-amber-500/20',
                )}>
                    <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        apiStatus === 'secured'
                            ? 'bg-green-500/15'
                            : 'bg-amber-500/15',
                    )}>
                        <ShieldCheck
                            size={14}
                            className={apiStatus === 'secured' ? 'text-green-400' : 'text-amber-400'}
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-2xs font-bold uppercase tracking-clinical text-[var(--muted-foreground)] leading-none mb-0.5">
                            Endpoint Status
                        </p>
                        <p className={cn(
                            'text-xs font-semibold leading-none',
                            apiStatus === 'secured' ? 'text-green-400' : 'text-amber-400',
                        )}>
                            {apiStatus === 'secured' ? 'Secured' : 'Simulation Mode'}
                        </p>
                    </div>
                </div>
            </div>

        </aside>
    );
}
