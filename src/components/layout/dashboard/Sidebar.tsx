"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PortalNav, PortalNavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({ nav }: { nav: PortalNav }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-paper md:flex">
      <Link
        href="/"
        className="flex h-14 items-center gap-2 border-b border-line px-6"
        aria-label="Civix home"
      >
        <span className="font-display text-lg tracking-tight text-ink">Civix</span>
        <span className="font-mono text-xs text-ink/30">portal</span>
      </Link>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <p className="px-3 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-ink/40">
          {nav.portalLabel}
        </p>
        <nav className="mt-3 flex flex-col" aria-label={`${nav.portalLabel} navigation`}>
          {nav.items.map((item) => (
            <SidebarLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>
      </div>

      <div className="border-t border-line px-6 py-4">
        <Link href="/" className="font-body text-xs text-ink/40 transition-colors hover:text-ink">
          Back to homepage
        </Link>
      </div>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: PortalNavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative border-l-2 py-2.5 pl-4 pr-3 font-body text-sm transition-colors",
        active
          ? "border-ledger font-medium text-ink"
          : "border-transparent text-ink/60 hover:bg-ink/[0.02] hover:text-ink",
      )}
    >
      {item.label}
    </Link>
  );
}
