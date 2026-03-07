/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            /* ── Aurora Clinical Color System ─────────────────────── */
            colors: {
                canvas:    '#050A14',
                surface: {
                    0:     '#0C1220',
                    1:     '#101928',
                    2:     '#141E30',
                    hover: '#192338',
                },
                accent: {
                    DEFAULT: '#22D3EE',
                    deep:    '#0891B2',
                    dim:     'rgba(34,211,238,0.12)',
                },
                clinical: {
                    critical:  '#F87171',
                    warning:   '#FBBF24',
                    nominal:   '#34D399',
                },
            },

            /* ── Typography ───────────────────────────────────────── */
            fontFamily: {
                sans:  ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
                mono:  ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '1rem' }],
            },
            letterSpacing: {
                clinical: '0.12em',
                label:    '0.08em',
            },

            /* ── Border Radius ────────────────────────────────────── */
            borderRadius: {
                'sm':  '6px',
                'md':  '10px',
                'lg':  '14px',
                'xl':  '18px',
                '2xl': '24px',
            },

            /* ── Shadows ──────────────────────────────────────────── */
            boxShadow: {
                'clinical-sm':       '0 1px 4px rgba(0,0,0,0.50)',
                'clinical-md':       '0 4px 20px rgba(0,0,0,0.45)',
                'clinical-lg':       '0 8px 40px rgba(0,0,0,0.55)',
                'critical-glow':     '0 0 20px rgba(248,113,113,0.18)',
                'critical-glow-lg':  '0 0 32px rgba(248,113,113,0.28)',
                'accent-glow':       '0 0 24px rgba(34,211,238,0.14)',
                'sidebar':           '-8px 0 40px rgba(0,0,0,0.40)',
            },

            /* ── Background Images ────────────────────────────────── */
            backgroundImage: {
                'gradient-radial':     'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':      'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'mesh-canvas':         'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(34,211,238,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(139,92,246,0.03) 0%, transparent 60%)',
            },

            /* ── Animations ───────────────────────────────────────── */
            animation: {
                'spin-slow':           'spin 3s linear infinite',
                'shimmer':             'shimmer 1.5s ease-in-out infinite',
                'slide-in':            'slide-in-right 0.25s cubic-bezier(0.22,1,0.36,1) both',
                'fade-in-up':          'fade-in-up 0.20s ease-out both',
                'pulse-critical':      'pulse-critical 2s ease-in-out infinite',
                'glow-pulse':          'glow-pulse 2.5s ease-in-out infinite',
            },

            /* ── Spacing extras ───────────────────────────────────── */
            minWidth: {
                'sidebar':   '350px',
            },
            width: {
                'sidebar':   '30%',
            },
        },
    },
    plugins: [],
}
