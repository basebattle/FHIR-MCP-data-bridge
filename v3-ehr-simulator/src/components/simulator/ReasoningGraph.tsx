"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type ReasoningStep } from "@/data/clinicalScenarios";
import { CheckCircle2, Circle, ArrowRight, BrainCircuit } from "lucide-react";

interface ReasoningGraphProps {
    steps: ReasoningStep[];
    className?: string;
}

export function ReasoningGraph({ steps, className }: ReasoningGraphProps) {
    return (
        <div className={cn("relative p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm h-full flex flex-col items-center justify-center overflow-hidden", className)}>
            {/* Background Brain Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                <BrainCircuit size={400} />
            </div>

            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-12 flex items-center gap-2">
                <span className="h-1 w-8 bg-primary rounded-full" />
                Intelligence Pipeline
                <span className="h-1 w-8 bg-primary rounded-full" />
            </h3>

            <div className="relative w-full max-w-2xl px-12">
                {/* Animated Beam background substitute - dotted line */}
                <div className="absolute top-[26px] left-[50px] right-[50px] h-[2px] border-t-2 border-dashed border-primary/20 -z-10" />

                <div className="flex justify-between items-start gap-4">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center group relative w-1/5">
                            {/* Node */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.15, type: "spring" }}
                                className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10",
                                    step.status === 'complete'
                                        ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(0,212,170,0.4)]"
                                        : "bg-background text-muted-foreground border-border"
                                )}
                            >
                                {step.status === 'complete' ? (
                                    <CheckCircle2 size={24} />
                                ) : (
                                    <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                        <Circle size={24} fill="currentColor" fillOpacity={0.1} />
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Label */}
                            <div className="mt-4 text-center">
                                <p className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors",
                                    step.status === 'complete' ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {step.label}
                                </p>
                                <p className="text-[9px] text-muted-foreground font-medium leading-tight max-w-[80px] mx-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    {step.detail}
                                </p>
                            </div>

                            {/* Connector Beams (Simplified) */}
                            {idx < steps.length - 1 && (
                                <div className="absolute top-[27px] left-[calc(50%+28px)] w-[calc(100%-56px)] h-[1px] bg-primary/10 overflow-hidden pointer-events-none">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={step.status === 'complete' ? { x: "100%" } : { x: "-100%" }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary to-transparent"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Connection lines using beams pattern logic placeholder */}
            <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50 flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Inference</span>
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-primary">snomed-mapper.v1</span>
                        <span className="font-bold text-clinical-nominal">98.2% CONF</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50 flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Memory Context</span>
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-primary">fhir-context-rlhf</span>
                        <span className="font-bold text-secondary">LOCAL CACHE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
