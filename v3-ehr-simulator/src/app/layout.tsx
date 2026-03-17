import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { HealthStatusBar } from '@/components/layout/HealthStatusBar'

export const metadata: Metadata = {
  title: 'FHIR-MCP | Clinical Intelligence OS',
  description: 'Enterprise level Healthcare AI Data Bridge — Powered by FHIR R4 + MCP Architecture',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans selection:bg-primary/20 selection:text-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <HealthStatusBar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
