'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, Play, Settings, Brain, BarChart3, Users, Link2, Clapperboard, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: '20+ FHIR Resources', value: '20+' },
    { label: 'Avg Latency', value: '<300ms' },
    { label: 'ICD-10 Accuracy', value: '94%' },
    { label: 'Protocol', value: 'SMART' },
  ];

  const features = [
    { title: 'Universal FHIR CRUD', description: 'Create, read, update, delete any FHIR R4 resource with intelligent validation and audit trails.', icon: Settings },
    { title: 'Semantic ICD-10', description: 'Auto-map clinical narratives to ICD-10-CM codes with 94% accuracy using NLP.', icon: Brain },
    { title: 'HCC Risk Detection', description: 'Identify high-cost patient cohorts and hierarchical condition categories in real time.', icon: BarChart3 },
    { title: 'Human-in-the-Loop', description: 'Clinical reviewers approve or modify AI suggestions before data commit.', icon: Users },
    { title: 'Dual-Protocol Stack', description: 'Seamlessly integrate via REST API (/api/v3) or Model Context Protocol (MCP).', icon: Link2 },
    { title: 'Simulation Fallback', description: 'Full clinical workflows run offline with synthetic patient data for demos and training.', icon: Clapperboard },
  ];

  const techStack = ['FHIR R4', 'FastAPI', 'FastMCP', 'Next.js 16', 'Tailwind v4', 'Python 3.11'];

  return (
    <div className="gradient-hero overflow-hidden">
      {/* Navigation */}
      <nav className="frosted-nav sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <span className="font-bold text-lg">FHIR-MCP Bridge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/simulator" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Demo
            </Link>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--muted)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-20 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--card)] text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Clinical Intelligence Platform v3.1
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
          The Bridge Between<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
            AI Agents & Clinical Records
          </span>
        </h1>

        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-12">
          High-fidelity Clinical Intelligence Infrastructure. FHIR R4 + Model Context Protocol.
          Step-by-step interactive demo of autonomous clinical workflows.
        </p>

        <div className="flex gap-4 justify-center mb-20 flex-wrap">
          <Link
            href="/simulator"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--primary)] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[var(--primary)]/20 transition-all hover:-translate-y-0.5"
          >
            <Play size={18} />
            Launch Interactive Demo
          </Link>
          <a href="#features" className="px-8 py-3.5 border border-[var(--border)] rounded-xl font-semibold hover:bg-[var(--muted)] transition-colors">
            Explore Features
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="animate-float">
          <ChevronDown size={20} className="mx-auto text-[var(--muted-foreground)]" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="wizard-card text-center">
              <div className="text-2xl font-black text-[var(--primary)] mb-1">{stat.value}</div>
              <div className="text-xs text-[var(--muted-foreground)] font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-black mb-4 text-center">Why FHIR-MCP Bridge?</h2>
        <p className="text-[var(--muted-foreground)] text-center mb-16 max-w-xl mx-auto">
          Enterprise clinical intelligence with autonomous AI reasoning and human oversight.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div key={i} className="wizard-card group">
              <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center mb-4 group-hover:bg-[var(--primary)] transition-colors">
                <feature.icon size={20} className="text-[var(--muted-foreground)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="wizard-card active p-10 text-center">
          <h2 className="text-3xl font-black mb-4">Experience It Live</h2>
          <p className="text-[var(--muted-foreground)] mb-8 max-w-lg mx-auto">
            Walk through a complete clinical workflow step by step. See AI reasoning, FHIR data flow, and HITL approval in action.
          </p>
          <Link
            href="/simulator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <Play size={20} />
            Start Demo Walkthrough
          </Link>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-5xl mx-auto px-6 py-24 border-t border-[var(--border-subtle)]">
        <h2 className="text-2xl font-black mb-8 text-center">Built With</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((tech, i) => (
            <span key={i} className="px-4 py-2 rounded-full border border-[var(--border-subtle)] text-sm font-semibold bg-[var(--card)]">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-10 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-[var(--muted-foreground)]">
          FHIR-MCP Bridge © 2026. Clinical Intelligence Platform.
        </div>
      </footer>
    </div>
  );
}
