"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, RotateCcw, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CompletionCardProps {
    auditId: string | null;
    onReset: () => void;
}

export function CompletionCard({ auditId, onReset }: CompletionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl text-center relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />

            <div className="w-20 h-20 rounded-full bg-clinical-nominal/10 text-clinical-nominal flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={48} />
            </div>

            <h2 className="text-3xl font-bold mb-4 tracking-tight">Cycle Optimized</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed font-medium">
                The clinical intelligence pipeline has successfully processed the encounter. All FHIR resources are synchronized and validated.
            </p>

            <div className="bg-muted/50 rounded-2xl p-6 mb-10 text-left space-y-4 border border-border">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Intelligence Audit ID</span>
                    <span className="font-mono text-xs text-primary truncate bg-primary/5 p-2 rounded-lg border border-primary/10">
                        {auditId || "SYS-BRIDGE-NULL"}
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted-foreground uppercase tracking-widest">Aggregate Latency</span>
                    <span className="font-mono font-bold">14.2s</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted-foreground uppercase tracking-widest">Resources Mutated</span>
                    <span className="font-mono font-bold">8</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <button
                    onClick={onReset}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-3"
                >
                    <RotateCcw size={20} />
                    New Simulation
                </button>
                <Link
                    href="/explorer"
                    className="w-full py-4 rounded-2xl border border-border font-bold flex items-center justify-center gap-3 hover:bg-muted transition-colors text-muted-foreground"
                >
                    View FHIR JSON
                    <ExternalLink size={18} />
                </Link>
            </div>

            <p className="mt-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed">
                Validated against HL7 US-Core profiles • Powered by MCP Data Bridge
            </p>
        </motion.div>
    );
}
