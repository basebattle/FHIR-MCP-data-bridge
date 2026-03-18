"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Zap, Server, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function HealthStatusBar() {
    const [mounted, setMounted] = useState(false);
    const [timestamp, setTimestamp] = useState("");

    useEffect(() => {
        setMounted(true);
        setTimestamp(new Date().toISOString());
        const timer = setInterval(() => setTimestamp(new Date().toISOString()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-background border-t border-border px-4 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-full sticky bottom-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                    <Server size={12} className="text-secondary" />
                    <span>System: <span className="text-foreground">Online</span></span>
                </div>
                <div className="flex items-center gap-1.5 hidden sm:flex">
                    <ShieldCheck size={12} className="text-clinical-nominal" />
                    <span>Encryption: <span className="text-foreground">AES-256</span></span>
                </div>
                <div className="flex items-center gap-1.5 hidden md:flex">
                    <Zap size={12} className="text-primary animate-pulse" />
                    <span>MCP Protocol: <span className="text-foreground">Active v1.2</span></span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="font-mono hidden lg:inline" suppressHydrationWarning>{mounted ? timestamp : "SYNCING..."}</span>
                <div className="flex items-center gap-1.5">
                    <Globe size={12} />
                    <span>Region: <span className="text-foreground">US-EAST</span></span>
                </div>
                <div className="h-3 w-[1px] bg-border mx-1" />
                <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-clinical-nominal animate-pulse" />
                    <span className="text-clinical-nominal">Live</span>
                </div>
            </div>
        </div>
    );
}
