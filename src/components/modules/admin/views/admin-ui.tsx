"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Shared editorial kit for Super Admin (`/system`) views — same design
 * tokens as the city module: one focal header, compact stat blocks,
 * TanStack tables with direct row-click, compact dialogs.
 */

export function AdminHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-line">
      <div className="space-y-1">
        <span className="font-mono text-xs uppercase tracking-wider text-ink/50">{eyebrow}</span>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="font-body text-xs text-ink/65 max-w-xl leading-relaxed">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line/70 bg-paper p-4 flex flex-col justify-between shadow-2xs h-full">
      <div className="flex items-center justify-between text-ink/50 text-xs font-mono uppercase tracking-wider">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-3">
        <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">{value}</p>
        <p className="font-body text-[11px] text-ink/60 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export function AdminEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-10">
      <div className="h-11 w-11 rounded-full bg-ink/5 flex items-center justify-center">
        <span className="font-display text-ink/20 text-xl">?</span>
      </div>
      <p className="font-body text-lg text-ink/50">{title}</p>
      <p className="text-ink/30 text-sm font-body">{body}</p>
    </div>
  );
}

export const ADMIN_ROW_CLASS =
  "border-b border-line/10 transition-all duration-200 hover:bg-ink/[0.02] cursor-pointer";
export const ADMIN_ROW_SELECTED_CLASS =
  "bg-ink/[0.03] shadow-[inset_3px_0_0_0_var(--color-ledger)] border-line/20";

/** Compact dialog content class — prevents viewport overflow. */
export const ADMIN_DIALOG_CLASS =
  "sm:max-w-md max-h-[85vh] overflow-y-auto bg-paper border border-line text-ink p-5 gap-4";

export const ADMIN_TAB_LIST_CLASS = "bg-field/50 border border-line/60 rounded-sm p-1";
export const ADMIN_TAB_TRIGGER_CLASS =
  "font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5";

/**
 * Server-side pagination toolbar — mirrors DataTablePagination layout
 * (metrics, rows-per-page, page status, prev/next) for server-paginated lists.
 */
export function ServerTablePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  const pages = Math.max(1, totalPages);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-line/40">
      <div className="text-xs text-ink/50 font-mono">
        Showing{" "}
        <span className="font-semibold text-ink">
          {from}-{to}
        </span>{" "}
        of <span className="font-semibold text-ink">{total.toLocaleString()}</span> record(s)
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium text-ink/70">Rows per page</p>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-[65px] px-2 justify-between border border-line bg-transparent hover:bg-ink/5 text-ink cursor-pointer text-xs"
              >
                {limit}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[65px] min-w-0">
              {[10, 20, 30, 40, 50].map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => {
                    onLimitChange(size);
                    onPageChange(1);
                  }}
                  className={cn(
                    "justify-center cursor-pointer text-xs",
                    size === limit && "font-semibold",
                  )}
                >
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-xs font-mono text-ink/50 mr-2">
            Page {page} of {pages}
          </span>
          <Button
            variant="ghost"
            className="h-8 px-3 text-ink border-0 hover:bg-ink/5 cursor-pointer text-xs"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3 text-ink border-0 hover:bg-ink/5 cursor-pointer text-xs"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Back-to-list link for detail views. */
export function AdminBackLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 font-mono text-xs text-ink/50 hover:text-ink transition-colors cursor-pointer w-fit"
    >
      ← {label}
    </a>
  );
}
