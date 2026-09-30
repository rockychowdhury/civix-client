import { cn } from "@/lib/utils";

const STATUS_TONES: Record<string, "open" | "progress" | "resolved" | "neutral"> = {
  OPEN: "open",
  NEW: "open",
  PENDING: "open",
  PENDING_ASSIGNMENT: "progress",
  SUGGESTED: "progress",
  ASSIGNED: "progress",
  IN_PROGRESS: "progress",
  RESOLVED: "resolved",
  CLOSED: "resolved",
  COMPLETED: "resolved",
  DONE: "resolved",
  REJECTED: "neutral",
  CANCELLED: "neutral",
};

const TONE_CLASSES = {
  open: "border-signal-open/30 bg-signal-open/[0.08] text-signal-open",
  progress: "border-signal-progress/35 bg-signal-progress/[0.10] text-signal-progress",
  resolved: "border-signal-resolved/30 bg-signal-resolved/[0.08] text-signal-resolved",
  neutral: "border-line bg-transparent text-ink/60",
} as const;

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONES[status.toUpperCase()] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.05em]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          tone === "open" && "bg-signal-open",
          tone === "progress" && "bg-signal-progress",
          tone === "resolved" && "bg-signal-resolved",
          tone === "neutral" && "bg-ink/40",
        )}
      />
      {status}
    </span>
  );
}
