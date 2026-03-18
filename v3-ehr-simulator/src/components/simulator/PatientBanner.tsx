"use client";

import React from "react";
import { type ClinicalScenario } from "@/data/clinicalScenarios";
import { cn } from "@/lib/utils";
import { User, Calendar, Activity, Database } from "lucide-react";
import { motion } from "framer-motion";

interface PatientBannerProps {
    scenario: ClinicalScenario | null;
    className?: string;
}

export function PatientBanner({ scenario, className }: PatientBannerProps) {
    if (!scenario) return null;

    const { patient } = scenario;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("w-full glass-panel border-b border-border p-8 shadow-md relative overflow-hidden", className)}
        >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Database size={120} />
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                        <User size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold tracking-tight">{patient.firstName} {patient.name}</h2>
                            <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-mono border border-secondary/20 uppercase tracking-widest">
                                FHIR Active
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5 leading-none">
                                <Calendar size={14} className="text-primary/60" />
                                DOB: {patient.dob} ({patient.sex === 'male' ? 'M' : 'F'})
                            </span>
                            <span className="flex items-center gap-1.5 leading-none">
                                <Activity size={14} className="text-primary/60" />
                                Condition: <span className="text-foreground">{scenario.name}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Data Source</span>
                        <span className="text-sm font-mono font-semibold text-primary">HL7 FHIR R4 API</span>
                    </div>
                    <div className="h-10 w-[1px] bg-border hidden lg:block mx-2" />
                    <div className="flex gap-2">
                        <div className="px-4 py-2 rounded-xl bg-background border border-border shadow-sm flex flex-col items-center">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold leading-none mb-1">Status</span>
                            <span className="text-xs font-bold text-clinical-nominal flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-clinical-nominal animate-pulse" />
                                Live Stream
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
