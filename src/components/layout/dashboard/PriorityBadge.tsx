import { cn } from "@/lib/utils";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const PRIORITY_CLASSES: Record<Priority, string> = {
  LOW: "border-line text-ink/60",
  MEDIUM: "border-signal-progress/35 bg-signal-progress/[0.08] text-signal-progress",
  HIGH: "border-signal-open/35 bg-signal-open/[0.08] text-signal-open",
  CRITICAL: "border-signal-open bg-signal-open/[0.12] text-signal-open font-semibold",
};

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const normalized = priority.toUpperCase() as Priority;
  const toneClass = PRIORITY_CLASSES[normalized] ?? PRIORITY_CLASSES.LOW;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs border px-2 py-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.05em]",
        toneClass,
        className,
      )}
    >
      {priority}
    </span>
  );
}
