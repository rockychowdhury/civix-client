"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowRight,
  BellRing,
  Building2,
  ChevronDown,
  CircleCheck,
  Clock,
  HardHat,
  RefreshCw,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_PATHS } from "@/constant/admin.constant";
import { useGetSuperAdminOverview } from "@/hooks";
import { cn } from "@/lib/utils";
import type {
  SuperAdminOverviewCategory,
  SuperAdminOverviewData,
  SuperAdminOverviewMunicipality,
  SuperAdminTimeRange,
  SuperAdminTrendPoint,
} from "@/types";

const TIME_RANGES: { value: SuperAdminTimeRange; label: string }[] = [
  { value: "all_time", label: "All time" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "this_year", label: "This year" },
];

function formatRate(rate?: number): string {
  if (rate == null || Number.isNaN(rate)) return "—";
  if (rate > 1) return `${rate.toFixed(1)}%`;
  return `${(rate * 100).toFixed(1)}%`;
}

function DistributionBars({ items }: { items: { name: string; sub?: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex items-center justify-between text-xs font-body text-ink/80">
            <span className="truncate max-w-[220px] font-medium" title={item.name}>
              {item.name}
              {item.sub ? <span className="text-ink/45 font-normal"> · {item.sub}</span> : null}
            </span>
            <span className="font-mono text-xs text-ink/60">{item.count.toLocaleString()}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-field overflow-hidden">
            <div
              className="h-full rounded-full bg-ledger transition-all duration-500"
              style={{ width: `${Math.max(2, (item.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Dependency-free SVG trend — created vs resolved issues over time. */
function TrendChart({ points }: { points: SuperAdminTrendPoint[] }) {
  const W = 620;
  const H = 170;
  const PAD = { l: 8, r: 8, t: 10, b: 22 };
  const max = Math.max(1, ...points.map((p) => Math.max(p.issuesCreated, p.issuesResolved)));
  const x = (i: number) => PAD.l + (i / Math.max(1, points.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  const line = (pick: (p: SuperAdminTrendPoint) => number) =>
    points.map((p, i) => `${x(i).toFixed(1)},${y(pick(p)).toFixed(1)}`).join(" ");
  const created = line((p) => p.issuesCreated);
  const resolved = line((p) => p.issuesResolved);
  const area = `${PAD.l},${H - PAD.b} ${created} ${W - PAD.r},${H - PAD.b}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-ink/50">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-ledger" /> Created
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-signal-resolved" /> Resolved
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Issues created versus resolved over time"
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + f * (H - PAD.t - PAD.b)}
            y2={PAD.t + f * (H - PAD.t - PAD.b)}
            stroke="var(--color-line)"
            strokeOpacity={0.4}
            strokeDasharray="3 4"
          />
        ))}
        <polygon points={area} fill="var(--color-ledger)" fillOpacity={0.07} />
        <polyline
          points={created}
          fill="none"
          stroke="var(--color-ledger)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={resolved}
          fill="none"
          stroke="var(--color-signal-resolved)"
          strokeWidth={2}
          strokeDasharray="1 0"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p) =>
          p.issuesCreated > 0 || p.issuesResolved > 0 ? (
            <title
              key={p.date}
            >{`${p.label}: ${p.issuesCreated} created, ${p.issuesResolved} resolved`}</title>
          ) : (
            <g key={p.date} />
          ),
        )}
        {[0, Math.floor((points.length - 1) / 2), points.length - 1].map((i) => (
          <text
            key={points[i].date}
            x={x(i)}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
            fontSize={10}
            fill="var(--color-ink)"
            opacity={0.45}
            fontFamily="var(--font-mono, monospace)"
          >
            {points[i].label}
          </text>
        ))}
      </svg>
    </div>
  );
}

const municipalityColumns: ColumnDef<SuperAdminOverviewMunicipality, unknown>[] = [
  {
    accessorKey: "name",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Municipality
      </span>
    ),
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink truncate">{row.original.name}</p>
        <p className="font-mono text-[10px] text-ink/45">{row.original.code}</p>
      </div>
    ),
  },
  {
    accessorKey: "openIssues",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Open</span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink/75">
        {row.original.openIssues.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "resolutionRate",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Resolved
      </span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink/75">
        {formatRate(row.original.resolutionRate)}
      </span>
    ),
  },
  {
    accessorKey: "staffCount",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Staff</span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink/75">{row.original.staffCount}</span>
    ),
  },
];

/**
 * Super admin system overview — one focal point (open now), compact KPI
 * strip, asymmetrical command split, everything else behind disclosure.
 */
export function AnalyticsOverviewView() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<SuperAdminTimeRange>("all_time");
  const [sorting, setSorting] = useState<SortingState>([]);
  const query = useGetSuperAdminOverview(timeRange);
  const { isFetching } = query;

  const data: SuperAdminOverviewData | undefined = query.data?.data;

  const municipalities = useMemo(
    () => (data?.municipalities ?? []) as SuperAdminOverviewMunicipality[],
    [data],
  );

  const muniTable = useReactTable({
    data: municipalities,
    columns: municipalityColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (query.isLoading || !data) {
    return (
      <div
        className="space-y-6 animate-pulse"
        role="status"
        aria-busy="true"
        aria-label="Loading analytics"
      >
        <div className="h-20 bg-field/30 rounded-xl border border-line/40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-field/30 rounded-xl border border-line/40" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-field/30 rounded-xl border border-line/40" />
          <div className="lg:col-span-4 h-96 bg-field/30 rounded-xl border border-line/40" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <EmptyState
        title="Analytics unavailable"
        body="The platform metrics could not be loaded. Check your connection and try again."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => query.refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  const kpis = data.kpis;
  const issues = data.civicIssues;
  const critical = data.actionableQueues.criticalIssues.slice(0, 5);
  const topCategories: SuperAdminOverviewCategory[] = data.categories.slice(0, 5);
  const restCategories = data.categories.slice(5);
  const statusEntries = Object.entries(issues.byStatus);
  const roleEntries = data.users.byRole;
  const ratingDist = Object.entries(data.citizenSatisfaction.ratingDistribution).sort(
    ([a], [b]) => Number(b) - Number(a),
  );
  const auditLogs = data.actionableQueues.recentAuditLogs.slice(0, 6);
  const sla = data.slaAndEscalations;
  const satisfaction = data.citizenSatisfaction;

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full">
      {/* Command header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-line">
        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
            Platform command
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            System overview
          </h1>
          <p className="font-body text-xs text-ink/65 max-w-xl leading-relaxed">
            Cross-municipality health at a glance — open load, resolution velocity, and what needs
            intervention.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as SuperAdminTimeRange)}>
            <SelectTrigger className="h-8 text-xs w-[130px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs cursor-pointer">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => query.refetch()}
            disabled={isFetching}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs"
          >
            <RefreshCw className={cn("size-3.5 mr-1.5", isFetching && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* Focal point: open now */}
      <div className="flex flex-col gap-1.5">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Open now</p>
        <p className="font-display text-6xl font-semibold tracking-tight text-ink md:text-7xl">
          {kpis.openCivicIssues.toLocaleString()}
        </p>
        <p className="font-body text-sm leading-relaxed text-ink/60">
          {formatRate(kpis.systemResolutionRate)} system resolution ·{" "}
          {issues.overdueTotal.toLocaleString()} overdue · {issues.unassignedTotal.toLocaleString()}{" "}
          unassigned
        </p>
      </div>

      {/* Compact KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-line/70 bg-paper p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-ink/50 text-xs font-mono uppercase tracking-wider">
            <span>Municipalities</span>
            <Building2 className="size-4 text-ink/40" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              {kpis.activeMunicipalities}
              <span className="text-base text-ink/40 font-normal">/{kpis.totalMunicipalities}</span>
            </p>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">Active coverage</p>
          </div>
        </div>

        <div className="rounded-xl border border-line/70 bg-paper p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-ink/50 text-xs font-mono uppercase tracking-wider">
            <span>Platform users</span>
            <Users className="size-4 text-ink/40" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              {kpis.totalUsers.toLocaleString()}
            </p>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">
              {kpis.totalStaff} staff · {kpis.totalCitizens} citizens
            </p>
          </div>
        </div>

        <Link
          href={ADMIN_PATHS.oversightIssues}
          className="rounded-xl border border-line/70 bg-paper p-4 flex flex-col justify-between shadow-2xs hover:border-line hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink/50 group-hover:text-ink">
            <span>Active orders</span>
            <HardHat className="size-4 text-ink/40 group-hover:text-ledger transition-colors" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              {kpis.activeWorkOrders}
            </p>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">
              of {kpis.totalWorkOrders} work orders
            </p>
          </div>
        </Link>

        <div className="rounded-xl border border-line/70 bg-paper p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink/50">
            <span>Satisfaction</span>
            <Star className="size-4 text-ink/40" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              {satisfaction.averageRating > 0 ? satisfaction.averageRating.toFixed(1) : "—"}
              <span className="text-base text-ink/40 font-normal">/5</span>
            </p>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">
              {satisfaction.totalFeedbacks} verified reviews
            </p>
          </div>
        </div>
      </div>

      {/* Asymmetrical split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Trend */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-line/60">
              <div>
                <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
                  <TrendingUp className="size-4 text-ink/50" /> Platform velocity
                </h2>
                <p className="font-body text-xs text-ink/60 mt-0.5">
                  Issues created versus resolved · {data.trends.length} days
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
                {data.timeRange.filter.replace(/_/g, " ")}
              </span>
            </div>
            {data.trends.length === 0 ? (
              <p className="font-body text-xs text-ink/55 py-6 text-center">No trend data yet.</p>
            ) : (
              <TrendChart points={data.trends} />
            )}
          </div>

          {/* Critical queue */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/60">
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  Needs intervention ({issues.openTotal})
                </h2>
                <p className="font-body text-xs text-ink/60 mt-0.5">
                  Overdue and escalated issues across all municipalities.
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="cursor-pointer text-xs self-start sm:self-auto h-7 px-2"
              >
                <Link href={ADMIN_PATHS.oversightIssues}>
                  Full oversight <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            {critical.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-line/40 bg-field/15 space-y-2">
                <CircleCheck className="size-8 mx-auto text-signal-resolved" />
                <p className="font-display text-sm font-semibold text-ink">Nothing critical</p>
                <p className="font-body text-xs text-ink/60">No open issues require escalation.</p>
              </div>
            ) : (
              <div className="divide-y divide-line/60">
                {critical.map((issue) => (
                  <Link
                    key={issue.id}
                    href={ADMIN_PATHS.oversightIssues}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-field/20 px-2 rounded-xs cursor-pointer"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-ink bg-field/70 border border-line/60 px-2 py-0.5 rounded-xs">
                          {issue.issueNumber}
                        </span>
                        <span className="text-[10px] font-mono text-ink/45">
                          {issue.department.name} · Ward {issue.ward.number}
                        </span>
                      </div>
                      <p className="font-body text-xs text-ink/75 truncate max-w-md">
                        {issue.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <StatusPill status={issue.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Collapsible>
              <CollapsibleTrigger className="flex cursor-pointer items-center gap-2 font-body text-xs font-medium text-ink/60 transition-colors hover:text-ink">
                <ChevronDown className="size-3.5" aria-hidden="true" />
                Lifecycle breakdown ({statusEntries.length} states)
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {statusEntries.map(([status, count]) => (
                    <div
                      key={status}
                      className="p-3 rounded-lg bg-field/30 border border-line/50 space-y-0.5"
                    >
                      <span className="text-[10px] font-mono uppercase text-ink/50">
                        {status.replace(/_/g, " ")}
                      </span>
                      <p className="font-display text-xl font-bold text-ink">
                        {(count as number).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Categories */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/60">
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  Demand by category
                </h2>
                <p className="font-body text-xs text-ink/60 mt-0.5">
                  Where citizen reports concentrate.
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="cursor-pointer text-xs self-start sm:self-auto h-7 px-2"
              >
                <Link href="/system/categories">
                  Catalog <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <DistributionBars
              items={topCategories.map((c) => ({
                name: c.name,
                sub: c.departmentName,
                count: c.issueCount,
              }))}
            />
            {restCategories.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger className="flex cursor-pointer items-center gap-2 font-body text-xs font-medium text-ink/60 transition-colors hover:text-ink">
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                  {restCategories.length} quieter categories
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <DistributionBars
                    items={restCategories.map((c) => ({
                      name: c.name,
                      sub: c.departmentName,
                      count: c.issueCount,
                    }))}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Municipalities */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/60">
              <div>
                <h2 className="font-display text-base font-semibold text-ink">Municipalities</h2>
                <p className="font-body text-xs text-ink/60 mt-0.5">
                  Per-city load and resolution performance.
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="cursor-pointer text-xs self-start sm:self-auto h-7 px-2"
              >
                <Link href={ADMIN_PATHS.municipalities}>
                  Directory <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            {municipalities.length === 0 ? (
              <p className="font-body text-xs text-ink/55 py-6 text-center">
                No municipalities registered yet.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-left">
                  <thead>
                    {muniTable.getHeaderGroups().map((hg) => (
                      <tr key={hg.id} className="border-b border-line/40">
                        {hg.headers.map((h) => (
                          <th
                            key={h.id}
                            onClick={h.column.getToggleSortingHandler()}
                            className="h-10 px-3 first:pl-1 last:pr-1 cursor-pointer align-middle"
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {muniTable.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => router.push(ADMIN_PATHS.municipalityDetail(row.original.id))}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          router.push(ADMIN_PATHS.municipalityDetail(row.original.id));
                        }}
                        className="border-b border-line/10 transition-all duration-200 hover:bg-ink/[0.02] cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3 px-3 first:pl-1 last:pr-1">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Satisfaction */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-line/50">
              <h3 className="font-display text-sm font-semibold text-ink">Citizen satisfaction</h3>
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "size-3.5",
                      s <= Math.round(satisfaction.averageRating)
                        ? "fill-signal-progress text-signal-progress"
                        : "text-ink/20",
                    )}
                  />
                ))}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-display text-4xl font-semibold text-ink">
                {satisfaction.averageRating > 0 ? satisfaction.averageRating.toFixed(1) : "—"}
              </p>
              <span className="font-mono text-xs text-ink/50">
                {formatRate(satisfaction.satisfactionRate)} positive · {satisfaction.totalFeedbacks}{" "}
                reviews
              </span>
            </div>
            <div className="space-y-1.5">
              {ratingDist.map(([stars, count]) => (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-ink/50 w-6">{stars}★</span>
                  <div className="h-1.5 flex-1 rounded-full bg-field overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ledger"
                      style={{
                        width: `${satisfaction.totalFeedbacks ? (Number(count) / satisfaction.totalFeedbacks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-ink/60 w-6 text-right">{Number(count)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SLA & escalations */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-line/50">
              <BellRing className="size-3.5 text-ink/50" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold">
                SLA & escalations
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-field/30 border border-line/60 space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-ink/50">Overdue</span>
                <p className="font-display text-xl font-bold text-ink">
                  {sla.overdueIssuesCount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-field/30 border border-line/60 space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-ink/50">Active esc.</span>
                <p className="font-display text-xl font-bold text-ink">
                  {sla.activeEscalations.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-xs font-body">
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60">Total escalations</span>
                <span className="font-mono text-ink">{sla.totalEscalations.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60">Unacknowledged</span>
                <span className="font-mono text-ink">
                  {sla.unacknowledgedEscalations.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-ink/60 flex items-center gap-1">
                  <Clock className="size-3 text-ink/40" /> Breached SLAs
                </span>
                <span className="font-mono text-ink">
                  {kpis.breachedCivicIssues.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Workforce */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-line/50">
              <ShieldCheck className="size-3.5 text-ink/50" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold">
                Workforce
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-field/30 border border-line/60 space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-ink/50">Technicians</span>
                <p className="font-display text-xl font-bold text-ink">
                  {data.users.staff.availableTechnicians}
                </p>
                <span className="text-[10px] font-mono text-ink/40">
                  {data.users.staff.busyTechnicians} busy
                </span>
              </div>
              <div className="p-3 rounded-lg bg-field/30 border border-line/60 space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-ink/50">Citizens</span>
                <p className="font-display text-xl font-bold text-ink">
                  {data.users.citizens.total}
                </p>
                <span className="text-[10px] font-mono text-ink/40">
                  {data.users.citizens.byTrustLevel.TRUSTED ?? 0} trusted
                </span>
              </div>
            </div>
            <Collapsible>
              <CollapsibleTrigger className="flex cursor-pointer items-center gap-2 font-body text-xs font-medium text-ink/60 transition-colors hover:text-ink">
                <ChevronDown className="size-3.5" aria-hidden="true" />
                Roles across the platform ({roleEntries.length})
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2.5">
                <div className="divide-y divide-line/40 rounded-lg border border-line/40 overflow-hidden">
                  {roleEntries.map((r) => (
                    <div
                      key={r.roleCode}
                      className="px-3 py-2 flex items-center justify-between text-xs bg-paper"
                    >
                      <span className="text-ink/75">{r.roleName}</span>
                      <span className="font-mono text-ink font-medium">{r.count}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-3.5 shadow-2xs">
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold pb-2 border-b border-line/50">
              Recent activity
            </h4>
            {auditLogs.length === 0 ? (
              <p className="font-body text-xs text-ink/55">No audit trail yet.</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <span className="mt-1.5 size-1.5 rounded-full bg-ledger shrink-0" />
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-ink/80 font-medium">
                        {log.action}{" "}
                        <span className="font-mono text-[10px] text-ink/45">
                          {log.resource.replace(/_/g, " ")}
                        </span>
                      </p>
                      <p className="font-mono text-[10px] text-ink/40 truncate">
                        {log.user.displayName} ·{" "}
                        {log.createdAt ? format(new Date(log.createdAt), "MMM d, HH:mm") : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="w-full text-xs h-7.5 cursor-pointer active:translate-y-px rounded-xs font-medium"
            >
              <Link href="/system/audit-log">
                Audit trail <ArrowRight className="size-3 ml-1 text-ink/50" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
