"use client";

import { ChevronDown } from "lucide-react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetIssuesByDepartment, useGetIssuesByWard, useGetPlatformDashboard } from "@/hooks";
import { cn } from "@/lib/utils";

function formatRate(rate?: number): string {
  if (rate == null || Number.isNaN(rate)) return "—";
  const pct = rate > 1 ? rate : rate * 100;
  return `${pct.toFixed(1)}%`;
}

function DistributionBars({ items }: { items: { name: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-4 border-t border-line/25 py-3 first:border-t-0 first:pt-0 last:pb-0"
        >
          <span className="w-40 shrink-0 truncate font-body text-sm text-ink/80" title={item.name}>
            {item.name}
          </span>
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-field"
            role="img"
            aria-label={`${item.name}: ${item.count} issues`}
          >
            <div
              className="h-full rounded-full bg-ledger transition-[width] duration-500"
              style={{ width: `${Math.max(2, (item.count / max) * 100)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-mono text-xs text-ink/60">
            {item.count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Platform analytics island. One focal point (open-now count), editorial stat
 * ledger, breakdowns behind progressive disclosure — no card grids.
 */
export function AnalyticsOverviewView() {
  const dashboard = useGetPlatformDashboard();
  const byDepartment = useGetIssuesByDepartment();
  const byWard = useGetIssuesByWard();

  if (dashboard.isLoading || byDepartment.isLoading || byWard.isLoading) {
    return (
      <div
        className="flex flex-col gap-8"
        role="status"
        aria-busy="true"
        aria-label="Loading analytics"
      >
        <Skeleton className="h-24 w-64 bg-field" />
        <Skeleton className="h-16 w-full bg-field/60" />
        <Skeleton className="h-40 w-full bg-field/50" />
      </div>
    );
  }

  if (dashboard.isError) {
    return (
      <EmptyState
        title="Analytics unavailable"
        body="The platform metrics could not be loaded. Check your connection and try again."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => dashboard.refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  const stats = dashboard.data?.data;
  const departments = (byDepartment.data?.data ?? []).map((d) => ({
    name: d.name,
    count: d.issueCount,
  }));
  const wards = (byWard.data?.data ?? []).map((w) => ({
    name: `${w.name}${w.number ? ` · ${w.number}` : ""}`,
    count: w.issueCount,
  }));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Open now</p>
        <p className="font-display text-6xl font-semibold tracking-tight text-ink md:text-7xl">
          {(stats?.openIssues ?? 0).toLocaleString()}
        </p>
        <p className="font-body text-sm leading-relaxed text-ink/60">
          {formatRate(stats?.resolutionRate)} resolution rate ·{" "}
          {(stats?.breachedIssues ?? 0).toLocaleString()} breached SLA
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-6 border-y border-line/30 py-5">
        {[
          { label: "Total issues", value: stats?.totalIssues ?? 0 },
          { label: "Resolved", value: stats?.resolvedIssues ?? 0 },
          { label: "Breached", value: stats?.breachedIssues ?? 0 },
        ].map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <dt className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/50">
              {row.label}
            </dt>
            <dd className="font-display text-2xl font-medium text-ink md:text-3xl">
              {row.value.toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-label="Issues by department" className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-medium text-ink">By department</h2>
        {departments.length > 0 ? (
          <DistributionBars items={departments} />
        ) : (
          <p className="font-body text-sm text-ink/55">No department data yet.</p>
        )}
      </section>

      <Collapsible>
        <CollapsibleTrigger className="flex cursor-pointer items-center gap-2 font-body text-sm font-medium text-ink/70 transition-colors hover:text-ink">
          <ChevronDown className="size-4" aria-hidden="true" />
          Issues by ward
        </CollapsibleTrigger>
        <CollapsibleContent className={cn("pt-4")}>
          {byWard.isError ? (
            <p className="font-body text-sm text-ink/55">
              Ward distribution failed to load.{" "}
              <button
                type="button"
                onClick={() => byWard.refetch()}
                className="cursor-pointer underline underline-offset-2"
              >
                Retry
              </button>
            </p>
          ) : wards.length > 0 ? (
            <DistributionBars items={wards} />
          ) : (
            <p className="font-body text-sm text-ink/55">No ward data yet.</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
