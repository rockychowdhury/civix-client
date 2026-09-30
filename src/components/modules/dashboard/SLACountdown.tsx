import { cn } from "@/lib/utils";

export function SLACountdown({
  minutesLeft,
  label = "remaining",
  className,
}: {
  minutesLeft: number;
  label?: string;
  className?: string;
}) {
  const overdue = minutesLeft < 0;
  const critical = !overdue && minutesLeft <= 120;

  const tone = overdue || critical ? "text-signal-open" : "text-ink/55";

  const format = (mins: number) => {
    const abs = Math.abs(Math.round(mins));
    if (abs < 60) return `${abs}m`;
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs tabular-nums",
        tone,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          overdue ? "animate-dot bg-signal-open motion-reduce:animate-none" : "bg-current",
        )}
      />
      {overdue ? `${format(minutesLeft)} overdue` : `${format(minutesLeft)} ${label}`}
    </span>
  );
}
