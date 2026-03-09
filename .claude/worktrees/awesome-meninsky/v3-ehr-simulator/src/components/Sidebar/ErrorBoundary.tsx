"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    errorConfig?: string;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorConfig: error.message };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in Clinical Component:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <aside className="w-[30%] min-w-[350px] sticky top-0 h-screen overflow-y-auto bg-red-50/80 backdrop-blur-xl border-l border-red-200 z-50 flex flex-col p-6 items-center justify-center text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-red-900 tracking-tighter mb-2">Systems Offline</h2>
                    <p className="text-red-700 text-sm font-medium mb-4">The Clinical Intelligence Hub encountered a critical error and has been suspended to protect the primary EHR workflow.</p>
                    <p className="text-[10px] text-red-500 mt-auto font-mono">{this.state.errorConfig}</p>
                </aside>
            );
        }

        return this.props.children;
    }
}
