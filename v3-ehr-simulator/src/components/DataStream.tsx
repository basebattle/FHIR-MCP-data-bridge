'use client';

interface DataStreamProps {
  query: string;
}

export function DataStream({ query }: DataStreamProps) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">
      <div className="border-t-2 border-green-500" />
      <div className="p-4 bg-[rgba(0,0,0,0.3)]">
        <p className="text-2xs font-bold uppercase tracking-clinical text-green-400 mb-3">
          AI Search Query
        </p>
        <div className="font-mono text-sm text-green-300 min-h-8 bg-black/40 rounded p-3 border border-[var(--border-subtle)]">
          <span className="text-[var(--muted-foreground)] mr-1">$</span>
          {query || <span className="text-[var(--muted-foreground)] animate-pulse">waiting...</span>}
          <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse" />
        </div>
        {query && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <p className="text-2xs font-bold uppercase text-[var(--muted-foreground)] mb-2">Results</p>
            {[0.95, 0.87, 0.72].map((score, i) => (
              <div key={i} className="p-2 rounded border border-[var(--border-subtle)] bg-black/20 mb-1.5 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">{query.split(' ')[0]} match #{i + 1}</span>
                  <span className="text-2xs font-mono text-green-400">{(score * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
