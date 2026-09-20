import { cn } from "@/lib/utils";

interface ProgressRailProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressRail({ currentStep, totalSteps, className }: ProgressRailProps) {
  // Ensure currentStep is bounded
  const safeCurrentStep = Math.max(0, Math.min(totalSteps, currentStep));

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="h-px flex-1 bg-line">
        <div
          className="h-px bg-ledger transition-[width] duration-300"
          style={{ width: `${(safeCurrentStep / totalSteps) * 100}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums text-ink/50">
        {safeCurrentStep} / {totalSteps}
      </span>
    </div>
  );
}
