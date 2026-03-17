"use client";
import React, { useState, useRef, useCallback } from 'react';
import SuggestionCard, { ClinicalIntelligenceData } from './SuggestionCard';
import { getSemanticSuggestions, validateClinicalData } from '../../services/api';
import { Search, ShieldCheck, AlertTriangle, Brain, Database, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────
   IntelligentSidebar — V3.0 Clinical Intelligence Hub
   ─ Updated for Medical Teal Design System
   ───────────────────────────────────────────────────────────────── */

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

function SkeletonCard({ delay = 0 }: { delay?: number }) {
    return (
        <div
            className="p-4 rounded-2xl border border-border bg-card mb-3 animate-shimmer"
            style={{ animationDelay: `${delay}ms` }}
            aria-hidden="true"
        >
            <div className="h-2.5 w-24 rounded bg-muted mb-3" />
            <div className="h-6 w-32 rounded bg-muted mb-3" />
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
            </div>
            <div className="h-10 rounded bg-muted" />
        </div>
    );
}

export default function IntelligentSidebar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ClinicalIntelligenceData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiStatus, setApiStatus] = useState<'secured' | 'simulation'>('secured');

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = useCallback((val: string) => {
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.length < 3) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const data = await getSemanticSuggestions(val);
                setResults(Array.isArray(data) ? data : [data]);
                setApiStatus('secured');
            } catch (err) {
                setResults([{ ...INLINE_MOCK, original: val }]);
                setApiStatus('simulation');
            } finally {
                setIsLoading(false);
            }
        }, 300);
    }, []);

    const handleValidation = useCallback(async (data: ClinicalIntelligenceData) => {
        try {
            await validateClinicalData({
                code: data.mapped_icd10!,
                status: 'Confirmed',
                clinician_id: 'PM_USER_01',
                timestamp: new Date().toISOString(),
            });
        } catch {
            console.log('Capture local');
        }
    }, []);

    const hasResults = results.length > 0;

    return (
        <aside
            id="intelligence-sidebar"
            className={cn(
                'w-[30%] min-w-[350px] sticky top-0 h-screen z-50',
                'overflow-y-auto flex flex-col',
                'bg-card/80 backdrop-blur-xl border-l border-border',
                'shadow-2xl',
                'px-6 py-8',
            )}
        >
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Brain size={20} />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                        Intelligence Hub
                    </h2>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Semantic Matching Engine v3.0
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-8 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search
                        size={18}
                        className={cn(
                            'transition-colors duration-200',
                            isLoading
                                ? 'text-primary animate-spin-slow'
                                : 'text-muted-foreground group-focus-within:text-primary',
                        )}
                    />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Identify conditions..."
                    className={cn(
                        'w-full h-14 pl-12 pr-4',
                        'bg-muted/50 rounded-2xl',
                        'border border-border',
                        'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
                        'text-sm font-semibold text-foreground',
                        'placeholder:text-muted-foreground/60 placeholder:font-medium',
                        'transition-all duration-200',
                    )}
                />
            </div>

            {/* Results */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Agentic Pipeline
                    </span>
                    {hasResults && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {results.length} Matches
                        </span>
                    )}
                </div>

                {isLoading && (
                    <>
                        <SkeletonCard delay={0} />
                        <SkeletonCard delay={100} />
                    </>
                )}

                {!isLoading && hasResults && (
                    <div className="space-y-4">
                        {results.map((res, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <SuggestionCard
                                    data={res}
                                    onApprove={handleValidation}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}

                {!isLoading && !hasResults && query.length < 3 && (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center opacity-40">
                        <Database size={40} className="text-muted-foreground mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Awaiting Record Input
                        </p>
                    </div>
                )}

                {!isLoading && !hasResults && query.length >= 3 && (
                    <div className="p-8 rounded-[2rem] border border-dashed border-border bg-muted/30 flex flex-col items-center text-center gap-3">
                        <AlertTriangle size={24} className="text-clinical-warning" />
                        <p className="text-sm font-bold text-foreground">Zero Matches</p>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                            Try broadening the terminology or verify FHIR Resource availability.
                        </p>
                    </div>
                )}
            </div>

            {/* Status Footer */}
            <div className="mt-8 pt-6 border-t border-border shrink-0">
                <div className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border transition-colors',
                    apiStatus === 'secured'
                        ? 'bg-clinical-nominal/[0.03] border-clinical-nominal/20'
                        : 'bg-clinical-warning/[0.03] border-clinical-warning/20',
                )}>
                    <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                        apiStatus === 'secured' ? 'bg-clinical-nominal/10' : 'bg-clinical-warning/10',
                    )}>
                        <ShieldCheck
                            size={20}
                            className={apiStatus === 'secured' ? 'text-clinical-nominal' : 'text-clinical-warning'}
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 leading-none">
                            Bridge Status
                        </p>
                        <p className={cn(
                            'text-xs font-bold leading-none',
                            apiStatus === 'secured' ? 'text-text-foreground' : 'text-clinical-warning',
                        )}>
                            {apiStatus === 'secured' ? 'Secure Protocol' : 'Internal Simulation'}
                        </p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground/30" />
                </div>
            </div>
        </aside>
    );
}
