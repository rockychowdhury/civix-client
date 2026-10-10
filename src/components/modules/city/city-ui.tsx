"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/** Design-rule Tabs styling — never use generic muted pills. */
export const CITY_TAB_LIST_CLASS = "bg-field/50 border border-line/60 rounded-sm p-1";
export const CITY_TAB_TRIGGER_CLASS =
  "font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5";

export function CityTabs({ children, className }: { children: ReactNode; className?: string }) {
  return <TabsList className={cn(CITY_TAB_LIST_CLASS, className)}>{children}</TabsList>;
}

export function CityTab({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsTrigger value={value} className={cn(CITY_TAB_TRIGGER_CLASS, className)}>
      {children}
    </TabsTrigger>
  );
}

/**
 * Editorial command header — mirrors citizen/department dashboards.
 * One focal point (title), eyebrow metadata, description, action cluster.
 */
export function CityHeader({
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

/** Compact KPI card — citizen/department metric style. */
export function CityStatCard({
  label,
  value,
  sub,
  icon,
  href,
}: {
  label: string;
  value: ReactNode;
  sub: string;
  icon?: ReactNode;
  href?: string;
}) {
  const body = (
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
  if (!href) return body;
  return (
    <a
      href={href}
      className="block h-full rounded-xl hover:border-line hover:shadow-xs transition-all cursor-pointer group"
    >
      {body}
    </a>
  );
}

/** Sortable table header cell content per design rules. */
export function SortHeader({ label, sorted }: { label: string; sorted: false | "asc" | "desc" }) {
  return (
    <span className="flex items-center gap-1.5 font-display text-[10px] uppercase tracking-widest text-ink/40">
      {label}
      <span className="w-3 shrink-0 flex items-center justify-center">
        {sorted === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : sorted === "desc" ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-20" />
        )}
      </span>
    </span>
  );
}

export const CITY_ROW_CLASS =
  "border-b border-line/10 transition-all duration-200 hover:bg-ink/[0.02] cursor-pointer";
export const CITY_ROW_SELECTED_CLASS =
  "bg-ink/[0.03] shadow-[inset_3px_0_0_0_var(--color-ledger)] border-line/20";

/** In-table empty state row content. */
export function CityEmptyState({ title, body }: { title: string; body: string }) {
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

/** Compact dialog content class — prevents viewport overflow. */
export const CITY_DIALOG_CLASS =
  "sm:max-w-md max-h-[85vh] overflow-y-auto bg-paper border border-line text-ink p-5 gap-4";
