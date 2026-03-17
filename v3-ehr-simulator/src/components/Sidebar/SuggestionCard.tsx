import React from 'react';
import { Check, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

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

const SuggestionCard: React.FC<SuggestionCardProps> = ({ data, isLoading, onApprove }) => {
    if (isLoading) {
        return (
            <div className={cn(
                'p-5 rounded-2xl border border-border bg-card mb-3 animate-shimmer h-[160px] flex items-center justify-center',
            )}>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                    Inferencing Context...
                </span>
            </div>
        );
    }

    if (!data) return null;

    const isHccRisk = data.hcc_data.hcc_impact;

    return (
        <div
            className={cn(
                'group relative rounded-[1.5rem] border transition-all duration-300',
                'bg-card overflow-hidden mb-3 hover:shadow-xl hover:shadow-primary/5',
                isHccRisk ? 'border-clinical-critical/20 bg-clinical-critical/[0.01]' : 'border-border hover:border-primary/40',
            )}
            role="article"
        >
            <div className="p-5">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                            {data.system}
                        </span>
                        <p className="text-sm font-bold text-foreground leading-tight truncate">
                            {data.original}
                        </p>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/50 rounded-xl p-3 border border-border">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                            Code
                        </span>
                        <span className="font-mono font-bold text-sm text-primary">
                            {data.mapped_icd10 ?? 'N/A'}
                        </span>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-1 flex items-center gap-1">
                            <TrendingUp size={10} className="text-clinical-nominal" />
                            RAF Impact
                        </span>
                        <span className="font-bold text-sm text-foreground">
                            +{data.hcc_data.weight.toFixed(3)}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-2">
                    {data.hcc_data.description}
                </p>

                {/* Primary Action */}
                <button
                    onClick={() => onApprove?.(data)}
                    className={cn(
                        'w-full h-11 rounded-xl flex items-center justify-between px-4',
                        'bg-foreground text-background font-bold text-xs uppercase tracking-widest',
                        'hover:scale-[1.02] active:scale-[0.98] transition-all',
                        'group/btn'
                    )}
                >
                    <span className="flex items-center gap-2">
                        <Check size={14} strokeWidth={3} />
                        Commit to Chart
                    </span>
                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </button>
            </div>

            {/* HCC Status Indicator (Overlay corner) */}
            {isHccRisk && (
                <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-clinical-critical/10 border-l border-b border-clinical-critical/20 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-clinical-critical animate-pulse" />
                    <span className="text-[9px] font-bold text-clinical-critical uppercase tracking-widest">Risk</span>
                </div>
            )}
        </div>
    );
};

export default SuggestionCard;
