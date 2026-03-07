"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError:    boolean;
    errorConfig?: string;
}

/* ─────────────────────────────────────────────────────────────────
   ErrorBoundary — Clinical Resilience Wrapper
   Preserves exact sidebar dimensions (w-[30%] min-w-[350px])
   so the 70/30 layout never collapses on a render error.
   Dark theme matches the Aurora Clinical glass panel.
   ───────────────────────────────────────────────────────────────── */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = { hasError: false };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorConfig: error.message };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in Clinical Intelligence Component:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                /* Preserved invariant: same dimensions as live sidebar */
                <aside
                    className={[
                        'w-[30%] min-w-[350px] sticky top-0 h-screen z-50',
                        'overflow-y-auto flex flex-col items-center justify-center',
                        'px-5 py-6 text-center',
                        /* Dark glass with red tint */
                        'backdrop-blur-xl',
                    ].join(' ')}
                    style={{
                        background:  '#fef2f2',
                        borderLeft:  '1px solid #fecaca',
                        backdropFilter: 'blur(8px) saturate(120%)',
                        WebkitBackdropFilter: 'blur(8px) saturate(120%)',
                    }}
                    aria-label="Clinical Intelligence Hub — offline"
                    role="alertdialog"
                    aria-live="assertive"
                >
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                         style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
                        <AlertCircle size={24} style={{ color: '#dc2626' }} />
                    </div>

                    {/* Heading */}
                    <h2 className="text-xl font-bold tracking-tight mb-2"
                        style={{ color: '#991b1b' }}>
                        Systems Offline
                    </h2>

                    {/* Body */}
                    <p className="text-sm max-w-[240px] leading-relaxed mb-6"
                       style={{ color: '#7f1d1d' }}>
                        The Clinical Intelligence Hub encountered a critical error and has been
                        suspended to protect the primary EHR workflow.
                    </p>

                    {/* Error detail */}
                    {this.state.errorConfig && (
                        <p className="mt-auto font-mono text-[10px] max-w-[280px] break-words"
                           style={{ color: '#b91c1c' }}>
                            {this.state.errorConfig}
                        </p>
                    )}
                </aside>
            );
        }

        return this.props.children;
    }
}
