import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn() — Utility for merging Tailwind classes conditionally.
 * Uses clsx for conditional logic + tailwind-merge to deduplicate
 * conflicting Tailwind utilities (e.g. p-4 + p-6 → p-6).
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
