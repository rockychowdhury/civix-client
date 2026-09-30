"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PortalNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileNav({ nav }: { nav: PortalNav }) {
  const pathname = usePathname();
  const isBottomTabs = nav.portalId === "technician";

  if (isBottomTabs) {
    // Technician portal: a simple bottom tab bar on mobile — a persistent left
    // sidebar is a poor field-device pattern regardless of brand consistency.
    return (
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-paper md:hidden"
      >
        {nav.items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 border-t-2 px-2 py-3 font-body text-xs transition-colors",
                active ? "border-ledger font-medium text-ink" : "border-transparent text-ink/50",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Other portals: a horizontally scrollable tab strip on mobile.
  return (
    <nav
      aria-label={`${nav.portalLabel} navigation`}
      className="flex overflow-x-auto border-b border-line bg-paper md:hidden"
    >
      {nav.items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-4 py-3 font-body text-sm transition-colors",
              active ? "border-ledger font-medium text-ink" : "border-transparent text-ink/50",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
