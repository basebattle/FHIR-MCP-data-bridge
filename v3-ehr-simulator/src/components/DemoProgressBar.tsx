'use client';

interface DemoProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function DemoProgressBar({ currentStep, totalSteps }: DemoProgressBarProps) {
  if (totalSteps <= 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xs font-bold text-[var(--muted-foreground)] shrink-0">
        Step {currentStep + 1}/{totalSteps}
      </span>
      <div className="flex items-center gap-1.5 flex-1 justify-center">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`step-dot ${i === currentStep ? 'active' : i < currentStep ? 'completed' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
