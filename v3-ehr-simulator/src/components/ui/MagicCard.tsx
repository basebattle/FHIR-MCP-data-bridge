"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps {
    children: React.ReactNode;
    className?: string;
    gradientSize?: number;
    gradientColor?: string;
    gradientOpacity?: number;
}

export function MagicCard({
    children,
    className,
    gradientSize = 250,
    gradientColor = "rgba(45, 212, 191, 0.15)", // Medical Teal
    gradientOpacity = 0.8,
}: MagicCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isFocused, setIsFocused] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            className={cn(
                "relative flex size-full overflow-hidden rounded-[2rem] border bg-card text-card-foreground",
                className
            )}
        >
            <div className="relative z-10 size-full">{children}</div>
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                style={{
                    opacity: isFocused ? gradientOpacity : 0,
                    background: `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, ${gradientColor}, transparent 100%)`,
                }}
            />
        </div>
    );
}
