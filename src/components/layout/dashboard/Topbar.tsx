import { ThemeToggle } from "@/components/shared/theme-toggle";
import type { PortalNav } from "@/lib/navigation";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({
  nav,
  userName,
  roleLabel,
}: {
  nav: PortalNav;
  userName: string;
  roleLabel?: string;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-paper px-4 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
        <span className="font-display text-base tracking-tight text-ink">Civix</span>
        <span aria-hidden="true" className="text-ink/30">
          /
        </span>
        <span className="truncate font-body text-sm font-medium text-ink/70">
          {nav.portalLabel}
        </span>
      </nav>

      <div className="flex items-center gap-3">
        <ThemeToggle className="text-ink/70 hover:text-ink" />
        <div className="flex items-center gap-2 rounded-xs border border-line bg-paper py-1 pl-1 pr-3">
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-xs bg-ledger font-mono text-[0.625rem] font-medium text-paper"
          >
            {initials(userName)}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-body text-xs font-medium text-ink">{userName}</span>
            {roleLabel && (
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.05em] text-ink/50">
                {roleLabel}
              </span>
            )}
          </span>
        </div>
      </div>
    </header>
  );
}
