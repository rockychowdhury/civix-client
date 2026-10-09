"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { PortalNav } from "@/lib/navigation";
import { NotificationCenter } from "./NotificationCenter";

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
  departmentName,
}: {
  nav: PortalNav;
  userName: string;
  roleLabel?: string;
  departmentName?: string;
}) {
  const pathname = usePathname();
  // Get current page name from pathname
  const segments = pathname.split("/").filter(Boolean);
  const currentPage = segments[1] ? segments[1].replace("-", " ") : "Overview";
  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 bg-paper px-4 md:px-8 z-10 sticky top-0">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="text-ink/60 hover:text-ink -ml-2 cursor-pointer" />
        <div className="h-4 w-px bg-line/20 hidden sm:block" />
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body text-sm">
          <span className="text-ink/50 hidden sm:inline-block">
            {departmentName ? `${departmentName} ${nav.portalLabel}` : nav.portalLabel}
          </span>
          <span className="text-ink/30 hidden sm:inline-block">/</span>
          <span className="font-medium text-ink">{pageTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-1.5">
        <NotificationCenter />
        <ThemeToggle className="text-ink/60 hover:text-ink transition-colors cursor-pointer" />
        <div className="h-4 w-px bg-line/20 mx-1 hidden sm:block" />
        <div className="flex items-center gap-2 rounded-full hover:bg-field/50 transition-colors py-1 pl-1 pr-3 cursor-pointer">
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-full bg-ledger font-mono text-[0.625rem] font-medium text-paper"
          >
            {initials(userName)}
          </span>
          <span className="flex flex-col leading-none hidden sm:flex">
            <span className="font-body text-xs font-medium text-ink">{userName}</span>
            {roleLabel && (
              <span className="font-mono text-[0.625rem] uppercase tracking-widest text-ink/50 mt-1">
                {roleLabel}
              </span>
            )}
          </span>
        </div>
        <div className="h-4 w-px bg-line/20 mx-1 hidden sm:block" />
        <button
          onClick={() => {
            document.cookie = "authToken=; max-age=0; path=/";
            window.location.href = "/login";
          }}
          className="p-1.5 text-ink/60 hover:text-ink hover:bg-ink/5 rounded-md transition-colors cursor-pointer"
          title="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-log-out"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}
