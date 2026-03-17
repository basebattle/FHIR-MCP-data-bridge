"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Terminal as TerminalIcon, Search, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchTerminalProps {
    query: string;
    isAnalyzing: boolean;
    className?: string;
}

export function SearchTerminal({ query, isAnalyzing, className }: SearchTerminalProps) {
    const [displayText, setDisplayText] = useState("");
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        let index = 0;
        setDisplayText("");

        if (!query) return;

        const timer = setInterval(() => {
            setDisplayText(query.slice(0, index + 1));
            index++;
            if (index >= query.length) clearInterval(timer);
        }, 50);

        return () => clearInterval(timer);
    }, [query]);

    useEffect(() => {
        const cursorTimer = setInterval(() => setShowCursor(v => !v), 530);
        return () => clearInterval(cursorTimer);
    }, []);

    return (
        <div className={cn("rounded-2xl border border-border bg-card shadow-lg overflow-hidden flex flex-col h-full", className)}>
            {/* Header */}
            <div className="bg-muted px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-destructive/40" />
                        <div className="w-3 h-3 rounded-full bg-clinical-warning/40" />
                        <div className="w-3 h-3 rounded-full bg-clinical-nominal/40" />
                    </div>
                    <div className="ml-2 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <TerminalIcon size={12} />
                        Clinical Reasoning Engine v3.0
                    </div>
                </div>
                {isAnalyzing && (
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="text-primary"
                        >
                            <Sparkles size={14} />
                        </motion.div>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wide">Processing</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 font-mono text-sm flex-1 flex flex-col gap-4 overflow-y-auto bg-[#00040A] text-[#E2E8F0]">
                <div className="flex items-start gap-2">
                    <span className="text-secondary font-bold">mcp-server:~$</span>
                    <span className="text-primary font-bold">analyze_symptoms --query</span>
                </div>

                <div className="flex items-start gap-2 min-h-[3rem]">
                    <ChevronRight size={18} className="text-primary mt-0.5 shrink-0" />
                    <div className="relative">
                        <span className="text-xl font-bold tracking-tight text-white leading-relaxed">
                            "{displayText}"
                            {showCursor && <span className="inline-block w-2.5 h-6 ml-1 bg-primary align-middle" />}
                        </span>
                    </div>
                </div>

                <AnimatePresence>
                    {displayText === query && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mt-2 space-y-2 border-l border-primary/20 pl-4 py-1"
                        >
                            <div className="text-xs text-muted-foreground italic">Targeting FHIR Patient record...</div>
                            <div className="text-xs text-secondary">[OK] Connecting to SNOMED-CT dictionary</div>
                            <div className="text-xs text-secondary">[OK] Correlating vital sign trends</div>
                            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-primary animate-pulse">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Generating Reasoning Graph
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / Info */}
            <div className="bg-[#000711] px-4 py-2 flex items-center justify-between border-t border-white/5">
                <div className="text-[10px] text-muted-foreground flex items-center gap-3">
                    <span>LINES: 42</span>
                    <span>LATENCY: 142ms</span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                    UTF-8 | FHIR R4
                </div>
            </div>
        </div>
    );
}
