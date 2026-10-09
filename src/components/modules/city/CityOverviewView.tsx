"use client";

import { ArrowRight, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AdminSectionSkeleton, StatusBadge } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCityIssues,
  useGetIssuesByDepartment,
  useGetMunicipalityById,
  useGetPlatformDashboard,
} from "@/hooks";
import { useCityScope } from "@/hooks/city.hook";
import { useGetDepartments } from "@/hooks/department.hook";
import { useGetAllStaff } from "@/hooks/staff.hook";
import { formatWard } from "@/lib/utils";
import type { CivicIssue } from "@/types";
import { CityIssueDetailSheet } from "./CityIssueDetailSheet";

function formatRate(rate?: number): string {
  if (rate == null || Number.isNaN(rate)) return "—";
  const pct = rate > 1 ? rate : rate * 100;
  return `${pct.toFixed(1)}%`;
}

export function CityOverviewView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CityOverviewContent municipalityId={id} />;
}

function CityOverviewContent({ municipalityId }: { municipalityId: string }) {
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);

  const profile = useGetMunicipalityById(municipalityId);
  const dashboard = useGetPlatformDashboard({ municipalityId });
  const departments = useGetDepartments({ municipalityId });
  const staff = useGetAllStaff({ page: 1, limit: 100 });
  const issuesQuery = useGetCityIssues(municipalityId, { limit: 10 });

  if (profile.isLoading || dashboard.isLoading) return <AdminSectionSkeleton />;

  if (profile.isError || profile.data?.data == null) {
    return (
      <EmptyState
        title="City profile unavailable"
        body="Your municipality could not be loaded. Check your connection and try again."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => profile.refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  const city = profile.data.data;
  const stats = dashboard.data?.data;
  const deptList = departments.data?.data ?? [];
  const staffList = staff.data?.data ?? [];
  const technicianCount = staffList.filter((s: any) =>
    s.userRoles?.some((ur: any) => ur.role?.code === "TECHNICIAN"),
  ).length;

  const urgentIssues: CivicIssue[] = (issuesQuery.data?.data || []).slice(0, 5);

  return (
    <div className="flex flex-col gap-10 w-full max-w-6xl">
      {/* City Command Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line/60">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold tracking-wider text-ink/70 uppercase">
              {city.code}
            </span>
            <span className="text-ink/30">·</span>
            <StatusBadge status={city.coverageStatus} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
            {city.name}
          </h1>
          <p className="font-body text-sm text-ink/60 max-w-2xl">
            Municipal Command & Oversight · Active coverage across assigned wards with centralized
            dispatch and service operations.
          </p>
        </div>

        {/* Quick Command Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button asChild variant="primary" size="sm" className="cursor-pointer shadow-xs">
            <Link href="/municipality/departments">
              <Plus className="size-3.5 mr-1.5" /> New Department
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="cursor-pointer">
            <Link href="/municipality/staff">
              <UserPlus className="size-3.5 mr-1.5" /> Onboard Staff
            </Link>
          </Button>
        </div>
      </div>

      {/* Executive Stat Strip */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 rounded-xl border border-line bg-paper shadow-xs">
        <div className="space-y-1">
          <dt className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Open Incidents
          </dt>
          <dd className="font-display text-3xl font-semibold text-ink">
            {stats?.openIssues == null ? (
              <Skeleton className="h-8 w-16 bg-field" />
            ) : (
              stats.openIssues.toLocaleString()
            )}
          </dd>
          <p className="text-[11px] font-body text-ink/60">Under active municipal routing</p>
        </div>

        <div className="space-y-1">
          <dt className="font-mono text-[11px] uppercase tracking-wider text-signal-resolved">
            Resolution Rate
          </dt>
          <dd className="font-display text-3xl font-semibold text-signal-resolved">
            {formatRate(stats?.resolutionRate)}
          </dd>
          <p className="text-[11px] font-body text-ink/60">
            {stats?.resolvedIssues
              ? `${stats.resolvedIssues.toLocaleString()} resolved`
              : "On track"}
          </p>
        </div>

        <div className="space-y-1">
          <dt className="font-mono text-[11px] uppercase tracking-wider text-amber-600">
            Breached SLAs
          </dt>
          <dd className="font-display text-3xl font-semibold text-amber-600">
            {stats?.breachedIssues ? stats.breachedIssues.toLocaleString() : "0"}
          </dd>
          <p className="text-[11px] font-body text-ink/60">Target deadlines exceeded</p>
        </div>

        <div className="space-y-1">
          <dt className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
            Workforce Strength
          </dt>
          <dd className="font-display text-3xl font-semibold text-ink">
            {staff.isLoading ? (
              <Skeleton className="h-8 w-16 bg-field" />
            ) : (
              staff.data?.meta?.total || staffList.length
            )}
          </dd>
          <p className="text-[11px] font-body text-ink/60">
            {deptList.length} depts · {technicianCount} field techs
          </p>
        </div>
      </dl>

      {/* Main Grid: Department Load Breakdown + High-Priority Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Department Load Breakdown (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-line bg-paper p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Department Load</h2>
              <p className="font-body text-xs text-ink/60">
                Active operational issue distribution.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="cursor-pointer text-xs">
              <Link href="/municipality/departments">
                View all <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </div>

          <CityBreakdowns municipalityId={municipalityId} />
        </div>

        {/* High-Priority Incidents Live Table (3 cols) */}
        <div className="lg:col-span-3 rounded-xl border border-line bg-paper p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Escalated Incidents</h2>
              <p className="font-body text-xs text-ink/60">
                High-priority issues across the municipality requiring oversight.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="cursor-pointer text-xs">
              <Link href="/municipality/issues">
                Full queue <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </div>

          {issuesQuery.isLoading ? (
            <div className="h-48 flex items-center justify-center text-xs font-mono text-ink/40 animate-pulse">
              Loading incidents...
            </div>
          ) : urgentIssues.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-line/40 bg-field/15 text-xs text-ink/60">
              No critical issues currently reported in the city.
            </div>
          ) : (
            <div className="divide-y divide-line/40 border border-line/60 rounded-lg overflow-hidden">
              {urgentIssues.map((issue) => (
                <button
                  type="button"
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className="w-full text-left p-3 flex items-center justify-between gap-4 hover:bg-field/30 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-ink">
                        {issue.issueNumber}
                      </span>
                      {issue.category && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
                          {issue.category.name}
                        </span>
                      )}
                      <span className="text-[10px] text-ink/40 font-mono">
                        {formatWard(issue.location?.ward || issue.ward)}
                      </span>
                    </div>
                    <p className="text-xs text-ink/80 truncate max-w-sm">
                      {issue.title || issue.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <StatusPill status={issue.status} />
                    <span className="text-xs font-mono text-signal-progress underline">
                      Inspect
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inspector Detail Sheet */}
      <CityIssueDetailSheet
        issue={selectedIssue}
        isOpen={!!selectedIssue}
        onOpenChange={(open) => !open && setSelectedIssue(null)}
        onSuccess={() => {
          issuesQuery.refetch();
          setSelectedIssue(null);
        }}
      />
    </div>
  );
}

function CityBreakdowns({ municipalityId }: { municipalityId: string }) {
  const byDepartment = useGetIssuesByDepartment({ municipalityId });
  const departments = (byDepartment.data?.data ?? []).map((d) => ({
    name: d.name,
    count: d.issueCount,
  }));
  const max = Math.max(1, ...departments.map((d) => d.count));

  if (byDepartment.isLoading) {
    return <Skeleton className="h-32 w-full bg-field/50" />;
  }

  if (departments.length === 0) {
    return (
      <p className="font-body text-xs text-ink/55 py-6 text-center">No department data yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {departments.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex items-center justify-between text-xs font-body text-ink/80">
            <span className="truncate max-w-[180px] font-medium">{item.name}</span>
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
