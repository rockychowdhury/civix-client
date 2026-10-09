import type { ReactNode } from "react";

/**
 * Static shell header for admin pages — one focal point (title + primary
 * action), generous whitespace, theme tokens only. Server-safe.
 */
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="font-body text-sm leading-relaxed text-ink/60">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}
