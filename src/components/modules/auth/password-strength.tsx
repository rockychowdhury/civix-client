import { cn } from "@/lib/utils";

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

function scorePassword(value: string) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) || /[^a-zA-Z0-9]/.test(value)) score += 1;
  if (/\d/.test(value) && /[a-zA-Z]/.test(value)) score += 1;
  if (value.length >= 12) score += 1;
  return Math.min(score, 4);
}

export function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  const percentage = (score / 4) * 100;

  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="h-1 flex-1 bg-line">
        <div
          className="h-1 transition-[width,background-color] duration-300 motion-reduce:transition-none"
          style={{
            width: `${percentage}%`,
            backgroundColor: `color-mix(in srgb, var(--color-signal-resolved) ${percentage}%, var(--color-signal-open))`,
          }}
        />
      </div>
      <span
        className={cn(
          "font-mono text-[0.6875rem] tabular-nums",
          value ? "text-ink/70" : "text-ink/35",
        )}
      >
        {value ? LABELS[score] : "Password strength"}
      </span>
    </div>
  );
}
