"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export function NumberTicker({
    value,
    direction = "up",
    delay = 0,
    className,
}: {
    value: number;
    direction?: "up" | "down";
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "down" ? value : 0);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "0px" });

    useEffect(() => {
        if (isInView) {
            setTimeout(() => {
                motionValue.set(direction === "down" ? 0 : value);
            }, delay * 1000);
        }
    }, [motionValue, isInView, delay, value, direction]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat("en-US").format(
                    Math.floor(latest)
                );
            }
        });
    }, [springValue]);

    return (
        <span
            className={cn("inline-block tabular-nums", className)}
            ref={ref}
        />
    );
}

export function VitalValueDisplay({ value, className }: { value: string; className?: string }) {
    // If the value is a pure number, ticker it.
    const isNumeric = !isNaN(Number(value));

    // If it's a blood pressure (e.g. 120/80)
    if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
            return (
                <span className={className}>
                    <NumberTicker value={Number(parts[0])} />
                    /
                    <NumberTicker value={Number(parts[1])} />
                </span>
            );
        }
    }

    if (isNumeric) {
        return <NumberTicker value={Number(value)} className={className} />;
    }

    return <span className={className}>{value}</span>;
}
