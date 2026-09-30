import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xs border border-dashed border-line bg-paper px-6 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="text-ink/40">{icon}</div>}
      <div className="space-y-1">
        <p className="font-display text-lg font-medium text-ink">{title}</p>
        {body && (
          <p className="mx-auto max-w-sm font-body text-sm leading-relaxed text-ink/55">{body}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
