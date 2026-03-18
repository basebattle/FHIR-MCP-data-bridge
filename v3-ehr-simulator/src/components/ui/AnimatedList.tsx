"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

export interface AnimatedListProps {
    className?: string;
    children: React.ReactNode;
    delay?: number;
}

export function AnimatedList({
    className,
    children,
    delay = 1000,
}: AnimatedListProps) {
    const childrenArray = React.Children.toArray(children);

    return (
        <div className={cn("flex flex-col-reverse gap-4", className)}>
            <AnimatePresence>
                {childrenArray.map((child) => (
                    <AnimatedListItem key={(child as React.ReactElement).key}>
                        {child}
                    </AnimatedListItem>
                ))}
            </AnimatePresence>
        </div>
    );
}

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{
                type: "spring",
                stiffness: 250,
                damping: 25,
                mass: 1,
            }}
            layout
        >
            {children}
        </motion.div>
    );
}
