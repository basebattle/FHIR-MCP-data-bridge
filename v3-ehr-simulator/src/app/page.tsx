"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MeshGradient } from "@/components/hero/MeshGradient";
import { ALL_SCENARIOS } from "@/data/clinicalScenarios";
import { cn } from "@/lib/utils";
import { Activity, Brain, Shield, Zap, ChevronRight, ArrowUpRight, Github, ExternalLink } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      <MeshGradient />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">FHIR-MCP</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Data Bridge v3.0</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="https://github.com/basebattle/FHIR-MCP-data-bridge" className="text-sm font-semibold hover:text-primary transition-colors flex items-center gap-2">
            <Github size={18} />
            <span className="hidden sm:inline">Source</span>
          </Link>
          <Link
            href="/simulator"
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            Launch Simulator
            <Zap size={16} fill="currentColor" />
          </Link>
        </div>
      </nav>

      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Clinical Intelligence OS
            </div>
            <h2 className="text-5xl md:text-7xl font-heavy tracking-tight mb-8 text-foreground leading-[1.1]">
              Bridging Clinical Data with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Agentic Reasoning.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl font-medium">
              The first MCP-native bridge allowing LLM agents to securely query HL7 FHIR R4 EHR systems. Engineered for high-fidelity clinical simulation and real-world intelligence pipelines.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/simulator"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-foreground text-background font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-2xl"
              >
                Explore 10+ Scenarios
                <ArrowUpRight size={20} />
              </Link>
              <Link
                href="/explorer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-background/50 backdrop-blur-md border border-border font-bold text-lg hover:bg-muted transition-colors text-center"
              >
                Resource Explorer
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "FHIR Resources", value: "8+", sub: "Standard R4 Types" },
            { label: "Mapping Accuracy", value: "98%", sub: "ICD-10-CM / SNOMED" },
            { label: "Latency", value: "<150ms", sub: "MCP Tool Response" },
            { label: "Deployments", value: "10", sub: "Active Showrooms" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="flex flex-col"
            >
              <span className="text-4xl font-mono font-bold tracking-tighter text-primary mb-1">{stat.value}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
              <span className="text-[10px] font-medium text-muted-foreground/60">{stat.sub}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scenario Selection Grid */}
      <section className="relative z-10 py-32 px-6 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-4">Clinical Scenario Library</h3>
              <p className="text-muted-foreground font-medium">Select a patient profile to launch a deep-reasoning clinical simulation.</p>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-bold flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-clinical-nominal" />
                Production Ready
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ALL_SCENARIOS.map((scenario, idx) => (
              <motion.div
                key={scenario.id}
                className="group relative h-96 rounded-[2rem] neo-card overflow-hidden flex flex-col p-10"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="mb-auto">
                  <div className={cn("inline-flex p-3 rounded-2xl mb-6 bg-muted text-foreground group-hover:bg-primary group-hover:text-white transition-colors")}>
                    <Brain size={24} />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">{scenario.name}</h4>
                  <p className="text-sm text-muted-foreground font-medium mb-4">{scenario.tagline}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>Complexity: High</span>
                    <span>9 nodes</span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="w-full h-full bg-primary/30" />
                  </div>
                  <Link
                    href={`/simulator?scenario=${scenario.id}`}
                    className="flex items-center justify-between w-full p-6 rounded-2xl bg-muted group-hover:bg-primary group-hover:text-white transition-all font-bold"
                  >
                    Analyze Records
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Badge Section */}
      <footer className="relative z-10 py-12 border-t border-border px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <span className="font-heavy text-xl tracking-tighter">HL7 FHIR R4</span>
            <span className="font-heavy text-xl tracking-tighter">SNOMED CT</span>
            <span className="font-heavy text-xl tracking-tighter">ICD-10-CM</span>
            <span className="font-heavy text-xl tracking-tighter">LOINC</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Architect</p>
            <p className="text-sm font-bold text-foreground">Piyush Kumar (Sharma) — Healthcare AI Strategic Lead</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
