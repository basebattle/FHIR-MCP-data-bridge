"use client";

import React from "react";
import { type VitalSign } from "@/data/clinicalScenarios";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkline } from "../Sparkline";

interface VitalsGridProps {
    vitals: VitalSign[];
    className?: string;
}

export function VitalsGrid({ vitals, className }: VitalsGridProps) {
    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
            {vitals.map((vital, idx) => (
                <motion.div
                    key={vital.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ translateY: -4 }}
                    className={cn(
                        "relative group p-8 transition-all duration-300",
                        "clinical-card",
                        vital.status === 'critical' ? "border-clinical-critical/30 bg-clinical-critical/[0.02]" :
                            vital.status === 'warning' ? "border-clinical-warning/30 bg-clinical-warning/[0.02]" :
                                "hover:border-primary/30"
                    )}
                >
                    {/* Status Glow */}
                    {vital.status !== 'normal' && (
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-1 rounded-t-2xl",
                            vital.status === 'critical' ? "bg-clinical-critical shadow-[0_0_10px_rgba(248,113,113,0.5)]" : "bg-clinical-warning shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        )} />
                    )}

                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-1">
                                {vital.label}
                            </p>
                            <div className="flex items-baseline gap-1">
                                <span className={cn(
                                    "text-3xl font-mono font-bold tracking-tighter",
                                    vital.status === 'critical' ? "text-clinical-critical" :
                                        vital.status === 'warning' ? "text-clinical-warning" : "text-foreground"
                                )}>
                                    {vital.value}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">{vital.unit}</span>
                            </div>
                        </div>

                        <div className={cn(
                            "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                            vital.status === 'critical' ? "bg-clinical-critical/10 text-clinical-critical border-clinical-critical/20" :
                                vital.status === 'warning' ? "bg-clinical-warning/10 text-clinical-warning border-clinical-warning/20" :
                                    "bg-secondary/10 text-secondary border-secondary/20"
                        )}>
                            {vital.status}
                        </div>
                    </div>

                    <div className="h-10 mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
                        <Sparkline
                            data={vital.history.map((v, i) => ({ time: i.toString(), value: v }))}
                            status={vital.status}
                            height={40}
                        />
                    </div>

                    {/* Interactive Mouse Shadow / Magic UI style overlay placeholder */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
            ))}
        </div>
    );
}
