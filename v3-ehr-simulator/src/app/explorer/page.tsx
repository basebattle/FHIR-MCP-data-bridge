"use client";

import React, { useState } from "react";
import { Database, Search, Code2, BookOpen, Layers, ChevronRight, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SAMPLE_RESOURCES = [
    { id: 'pat-001', type: 'Patient', status: 'Active', lastUpdate: '2026-03-18T04:30:00Z', json: { resourceType: "Patient", id: "pat-001", name: [{ family: "DOE", given: ["JANE"] }], gender: "female", birthDate: "1982-12-05" } },
    { id: 'obs-001', type: 'Observation', status: 'Final', lastUpdate: '2026-03-18T04:45:00Z', json: { resourceType: "Observation", id: "obs-001", status: "final", code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure" }] }, subject: { reference: "Patient/pat-001" }, valueQuantity: { value: 182, unit: "mmHg" } } },
    { id: 'med-001', type: 'MedicationRequest', status: 'Active', lastUpdate: '2026-03-18T05:00:00Z', json: { resourceType: "MedicationRequest", id: "med-001", intent: "order", medicationCodeableConcept: { coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: "866411", display: "Metoprolol Succinate 25mg" }] } } },
];

export default function ExplorerPage() {
    const [selectedId, setSelectedId] = useState(SAMPLE_RESOURCES[0].id);
    const selectedResource = SAMPLE_RESOURCES.find(r => r.id === selectedId);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white">
                            <Database size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight leading-none">Resource Explorer</h1>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Direct FHIR R4 Inspection</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                className="bg-muted border border-border rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <a href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                            Exit
                        </a>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Sidebar: Resource List */}
                <aside className="md:col-span-4 border-r border-border p-6 space-y-6 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Local Store</h3>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">3 Resources</span>
                    </div>

                    <div className="space-y-2">
                        {SAMPLE_RESOURCES.map(resource => (
                            <button
                                key={resource.id}
                                onClick={() => setSelectedId(resource.id)}
                                className={cn(
                                    "w-full p-4 rounded-2xl border text-left transition-all",
                                    selectedId === resource.id
                                        ? "bg-card border-primary/40 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                                        : "bg-transparent border-transparent hover:bg-muted"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md",
                                        resource.type === 'Patient' ? "bg-blue-500/10 text-blue-500" :
                                            resource.type === 'Observation' ? "bg-purple-500/10 text-purple-500" :
                                                "bg-amber-500/10 text-amber-500"
                                    )}>
                                        {resource.type}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-mono">{resource.id}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-foreground">Status: {resource.status}</span>
                                    <ChevronRight size={14} className={cn("transition-transform", selectedId === resource.id ? "rotate-90 text-primary" : "text-muted-foreground/40")} />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Metadata Engine</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Resources are fetched directly from the local MCP bridge cache and mapped to human-readable labels using SNOMED-CT dictionary lookups.
                        </p>
                    </div>
                </aside>

                {/* Content Area: JSON Viewer */}
                <div className="md:col-span-8 p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col h-full"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-bold">{selectedResource?.type} Record</h2>
                                    <div className="h-6 w-[1px] bg-border" />
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <BookOpen size={14} />
                                        HL7 FHIR R4
                                    </div>
                                </div>
                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                                    <Copy size={14} />
                                    Copy JSON
                                </button>
                            </div>

                            <div className="flex-1 rounded-3xl border border-border bg-[#00040A] p-8 font-mono text-sm overflow-auto max-h-[600px] shadow-2xl relative">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <Code2 size={24} className="text-primary" />
                                </div>
                                <pre className="text-primary-foreground/90 selection:bg-primary/30">
                                    {JSON.stringify(selectedResource?.json, null, 2)}
                                </pre>
                            </div>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-muted/50 border border-border flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Updated</span>
                                    <span className="text-sm font-semibold">{selectedResource?.lastUpdate}</span>
                                </div>
                                <div className="p-5 rounded-2xl bg-muted/50 border border-border flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registry Status</span>
                                    <span className="text-sm font-semibold text-clinical-nominal flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-clinical-nominal" />
                                        Synchronized
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
