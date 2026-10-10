"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  HardHat,
  ListTodo,
  MapPin,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@/hooks/auth.hook";
import { useDepartmentOverview } from "@/hooks/department.hook";
import { useQueryClient } from "@tanstack/react-query";
import type { IDepartmentOverviewData } from "@/types";

export function DepartmentOverviewView() {
  const queryClient = useQueryClient();
  const { data: userData, isLoading: isUserLoading } = useGetMe();
  const user = userData?.data;
  const staffProfile = user?.staffProfile;
  const departmentMember = staffProfile?.departmentMembers?.[0];
  const departmentId =
    departmentMember?.departmentId || (departmentMember as any)?.department?.id;

  // Single cached endpoint for the entire department overview
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isFetching,
    isError,
    refetch,
  } = useDepartmentOverview(departmentId);

  const overview = overviewData as IDepartmentOverviewData | undefined;
  const department = overview?.department;
  const workOrderStats = overview?.workOrderStats;
  const issueQueueStats = overview?.issueQueueStats;
  const staffStats = overview?.staffStats;
  const resolutionStats = overview?.resolutionStats;
  const queues = overview?.queues;
  const manager = department?.leadership?.managers?.[0];

  const isLoading = isUserLoading || isOverviewLoading;

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-field/30 rounded-xl border border-line/40" />
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

  if (isError || !overview) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-center space-y-3 rounded-xl border border-line bg-paper p-8">
        <div className="size-12 rounded-full bg-signal-open/10 text-signal-open flex items-center justify-center font-display text-xl font-bold">
          !
        </div>
        <h3 className="font-display text-base font-semibold text-ink">
          Unable to Load Department Overview
        </h3>
        <p className="font-body text-xs text-ink/60 max-w-sm">
          There was a problem syncing with the department overview service.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          className="cursor-pointer text-xs mt-2 bg-paper border border-line/40"
        >
          <RefreshCw className="size-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl w-full">
      {/* Department Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-line">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
              Department Operations Desk
            </span>
            <span className="text-ink/30">•</span>
            <span className="font-mono text-xs text-ledger font-semibold bg-ledger/10 px-2 py-0.5 rounded-sm">
              {department?.code || "DEPT"}
            </span>
            {department?.municipality?.name && (
              <>
                <span className="text-ink/30">•</span>
                <span className="font-body text-xs text-ink/60">
                  {department.municipality.name}
                </span>
              </>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            {department?.name || "Department Overview"}
          </h1>

          <p className="font-body text-xs sm:text-sm text-ink/70 leading-relaxed">
            {department?.description ||
              "Live operational command — dispatch maintenance crews, review incoming civic issues, and track active work order resolutions."}
          </p>

          {manager && (
            <div className="flex items-center gap-2 pt-1 text-xs text-ink/60 font-body">
              <User className="size-3.5 text-ledger" />
              <span>
                Manager: <strong className="text-ink font-medium">{manager.name}</strong>
              </span>
              {manager.email && <span className="text-ink/40">({manager.email})</span>}
            </div>
          )}
        </div>

        {/* Quick Command Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="cursor-pointer text-xs bg-paper border border-line/40 text-ink/70 hover:text-ink active:translate-y-px"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Sync
          </Button>

          <Button
            asChild
            variant="secondary"
            size="sm"
            className="cursor-pointer text-xs active:translate-y-px rounded-xs font-medium bg-paper border border-line/40 text-ink hover:text-ink"
          >
            <Link href="/department/issues">
              <ListTodo className="size-3.5 mr-1.5 text-ink/50" />
              Issue Queue ({issueQueueStats?.openTotal ?? 0})
            </Link>
          </Button>

          <Button
            asChild
            variant="primary"
            size="sm"
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs font-medium bg-ledger text-paper hover:bg-ledger/90"
          >
            <Link href="/department/work-orders?status=ASSIGNED,TEAM_ASSIGNED,IN_PROGRESS">
              <Wrench className="size-3.5 mr-1.5" />
              Active Orders ({workOrderStats?.activeTotal ?? 0})
            </Link>
          </Button>
        </div>
      </div>

      {/* Critical Dispatch Alert (if work orders need crew assignment) */}
      {(workOrderStats?.needCrew ?? 0) > 0 && (
        <div className="rounded-xl border border-signal-open/30 bg-signal-open/5 p-4.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-full bg-signal-open/10 text-signal-open flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="size-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold text-ink">
                  Dispatch Required: Work Orders Awaiting Crew Assignment
                </h2>
                <Badge
                  variant="outline"
                  className="border-signal-open/30 bg-signal-open/10 text-signal-open text-[10px] font-mono"
                >
                  {workOrderStats?.needCrew} unassigned
                </Badge>
              </div>
              <p className="font-body text-xs text-ink/70 leading-relaxed">
                Work orders generated from triaged civic issues require technician or team
                assignment to commence field repairs.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="primary"
            size="sm"
            className="cursor-pointer text-xs shrink-0 self-start sm:self-auto active:translate-y-px rounded-xs font-medium bg-ledger text-paper hover:bg-ledger/90"
          >
            <Link href="/department/work-orders?status=WORK_ORDER_CREATED">
              Assign Crew <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Operational Velocity KPIs (4 Cards Directly Mapped to Subroutes) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assign Crew / Need Crew */}
        <Link
          href="/department/work-orders?status=WORK_ORDER_CREATED"
          className="rounded-xl border border-line/70 bg-paper p-4.5 flex flex-col justify-between shadow-2xs hover:border-line hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink/50 group-hover:text-ink">
            <span>Assign Crew</span>
            <UserCheck className="size-4 text-ink/40 group-hover:text-ledger transition-colors" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                {workOrderStats?.needCrew ?? 0}
              </p>
              {(workOrderStats?.needCrew ?? 0) === 0 ? (
                <span className="text-[10px] font-mono text-signal-resolved font-medium">
                  All Assigned ✓
                </span>
              ) : (
                <span className="text-[10px] font-mono text-signal-open font-semibold">
                  Dispatch →
                </span>
              )}
            </div>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">
              Work orders awaiting technician
            </p>
          </div>
        </Link>

        {/* Active In Field */}
        <Link
          href="/department/work-orders?status=ASSIGNED,TEAM_ASSIGNED,IN_PROGRESS"
          className="rounded-xl border border-line/70 bg-paper p-4.5 flex flex-col justify-between shadow-2xs hover:border-line hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink/50 group-hover:text-ink">
            <span>Active Operations</span>
            <HardHat className="size-4 text-ink/40 group-hover:text-ledger transition-colors" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                {workOrderStats?.activeTotal ?? 0}
              </p>
              <span className="text-[10px] font-mono text-ledger font-medium">
                {workOrderStats?.inProgress ?? 0} on-site
              </span>
            </div>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">
              {workOrderStats?.assigned ?? 0} assigned · {workOrderStats?.inProgress ?? 0} started
            </p>
          </div>
        </Link>

        {/* Resolution Verification */}
        <Link
          href="/department/work-orders?status=PENDING_VERIFICATION"
          className="rounded-xl border border-line/70 bg-paper p-4.5 flex flex-col justify-between shadow-2xs hover:border-line hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink/50 group-hover:text-ink">
            <span>Verification</span>
            <ShieldCheck className="size-4 text-ink/40 group-hover:text-ledger transition-colors" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                {workOrderStats?.pendingVerification ?? 0}
              </p>
              {(workOrderStats?.pendingVerification ?? 0) > 0 ? (
                <span className="text-[10px] font-mono text-amber-600 font-semibold">
                  Review →
                </span>
              ) : (
                <span className="text-[10px] font-mono text-signal-resolved font-medium">
                  Clear ✓
                </span>
              )}
            </div>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">
              Resolutions awaiting sign-off
            </p>
          </div>
        </Link>

        {/* Issue Queue */}
        <Link
          href="/department/issues"
          className="rounded-xl border border-line/70 bg-paper p-4.5 flex flex-col justify-between shadow-2xs hover:border-line hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink/50 group-hover:text-ink">
            <span>Issue Queue</span>
            <ListTodo className="size-4 text-ink/40 group-hover:text-ledger transition-colors" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                {issueQueueStats?.openTotal ?? 0}
              </p>
              {(issueQueueStats?.overdueCount ?? 0) > 0 && (
                <span className="text-[10px] font-mono text-signal-open font-semibold">
                  {issueQueueStats?.overdueCount} overdue
                </span>
              )}
            </div>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">
              {issueQueueStats?.total ?? 0} total registered issues
            </p>
          </div>
        </Link>
      </div>

      {/* Asymmetrical 2-Column Split: Operational Queues (8 cols) + Resource Readiness (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Column: Active Work Orders & Priority Queues (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section 1: Active Work Orders */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/60">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">
                  Active Field Work Orders
                </h3>
                <p className="font-body text-xs text-ink/60 mt-0.5">
                  Assigned technicians and ongoing maintenance work on-site.
                </p>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="cursor-pointer text-xs self-start sm:self-auto h-7 px-2 hover:bg-ink/5"
              >
                <Link href="/department/work-orders?status=ASSIGNED,TEAM_ASSIGNED,IN_PROGRESS">
                  View all ({queues?.activeWorkOrders?.length ?? 0}){" "}
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {(!queues?.activeWorkOrders || queues.activeWorkOrders.length === 0) ? (
              <div className="p-8 text-center rounded-lg border border-line/40 bg-field/15 space-y-2">
                <CheckCircle2 className="size-8 mx-auto text-signal-resolved" />
                <p className="font-display text-sm font-semibold text-ink">
                  No Active Work Orders
                </p>
                <p className="font-body text-xs text-ink/60 max-w-sm mx-auto">
                  There are currently no active work orders underway.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-line/60">
                {queues.activeWorkOrders.slice(0, 5).map((wo: any) => {
                  const issue = wo.civicIssue;
                  const assignee = wo.currentAssignee;
                  const displayId = wo.id.slice(0, 8);

                  return (
                    <div
                      key={wo.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-field/20 px-2 rounded-xs"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-ink bg-field/70 border border-line/60 px-2 py-0.5 rounded-xs">
                            WO-{displayId.toUpperCase()}
                          </span>
                          {issue?.issueNumber && (
                            <span className="font-mono text-[11px] text-ink/50">
                              #{issue.issueNumber}
                            </span>
                          )}
                          {issue?.priority?.name && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-field/50 border border-line/50 text-ink/75 font-mono text-[10px]">
                              {issue.priority.name}
                            </span>
                          )}
                        </div>

                        <p className="font-body text-xs text-ink/80 truncate max-w-md font-medium">
                          {wo.title || issue?.title || "Field Maintenance Order"}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] font-mono text-ink/50 flex-wrap">
                          {assignee && (
                            <span className="flex items-center gap-1 text-ink/70">
                              <User className="size-2.5 text-ledger" />
                              {assignee.firstName} {assignee.lastName} ({assignee.employeeId})
                            </span>
                          )}
                          {issue?.location?.address && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[220px] flex items-center gap-1">
                                <MapPin className="size-2.5 text-ink/35 shrink-0" />
                                {issue.location.address}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <StatusPill status={wo.status} />
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="text-xs h-7 px-3 cursor-pointer active:translate-y-px rounded-xs font-medium bg-paper border border-line/40 text-ink hover:text-ink"
                        >
                          <Link href="/department/work-orders?status=ASSIGNED,TEAM_ASSIGNED,IN_PROGRESS">
                            Inspect <ArrowRight className="size-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Priority Queue / Civic Issues Summary */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/60">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">
                  Civic Issues Distribution
                </h3>
                <p className="font-body text-xs text-ink/60 mt-0.5">
                  Status and severity breakdown across all confirmed department issues.
                </p>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="cursor-pointer text-xs self-start sm:self-auto h-7 px-2 hover:bg-ink/5"
              >
                <Link href="/department/issues">
                  View full queue ({issueQueueStats?.total ?? 0}){" "}
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {issueQueueStats?.byStatus &&
                Object.entries(issueQueueStats.byStatus).map(([statusKey, count]) => (
                  <div
                    key={statusKey}
                    className="p-3 rounded-lg bg-field/30 border border-line/50 space-y-1"
                  >
                    <span className="text-[10px] font-mono uppercase text-ink/50">
                      {statusKey.replace(/_/g, " ")}
                    </span>
                    <p className="font-display text-xl font-bold text-ink">{count}</p>
                  </div>
                ))}
            </div>

            {issueQueueStats?.byPriority && issueQueueStats.byPriority.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink/40 block mb-2">
                  By Priority
                </span>
                <div className="flex flex-wrap gap-2">
                  {issueQueueStats.byPriority.map((priority) => (
                    <div
                      key={priority.id || priority.code}
                      className="px-2.5 py-1 rounded-md bg-paper border border-line/60 text-xs font-mono flex items-center gap-2"
                    >
                      <span className="text-ink/70 font-medium">{priority.name}:</span>
                      <span className="font-bold text-ink">{priority.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column: Staff Readiness & Department Coverage (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Staff & Crew Readiness Panel */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-line/50">
              <div className="flex items-center gap-2">
                <HardHat className="size-4 text-ledger" />
                <h3 className="font-display text-sm font-semibold text-ink">
                  Staff & Crew Readiness
                </h3>
              </div>
              <span className="font-mono text-xs text-ink/50">Live Status</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-field/30 border border-line/60 space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-ink/50">
                  Total Staff
                </span>
                <p className="font-display text-xl font-bold text-ink">
                  {staffStats?.totalStaff ?? 0}
                </p>
                <span className="text-[10px] font-mono text-ink/40">
                  {staffStats?.dispatchersCount ?? 0} dispatchers
                </span>
              </div>

              <div className="p-3 rounded-lg bg-field/30 border border-line/60 space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-ink/50">
                  Utilization
                </span>
                <p className="font-display text-xl font-bold text-ink">
                  {staffStats?.technicians?.utilizationRate ?? 0}%
                </p>
                <span className="text-[10px] font-mono text-ink/40">
                  {staffStats?.technicians?.totalCurrentWorkload ?? 0}/
                  {staffStats?.technicians?.totalCapacity ?? 0} workload
                </span>
              </div>
            </div>

            {/* Technician Roster list */}
            {staffStats?.technicianRoster && staffStats.technicianRoster.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-ink/50">
                    Technician Roster
                  </span>
                  <Link
                    href="/department/technicians"
                    className="text-[11px] font-mono text-ledger hover:underline"
                  >
                    View Directory →
                  </Link>
                </div>

                <div className="divide-y divide-line/40 rounded-lg border border-line/40 bg-field/10 overflow-hidden">
                  {staffStats.technicianRoster.map((tech) => (
                    <div key={tech.userId} className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                          <span
                            className={`size-2 rounded-full ${
                              tech.isAvailable ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {tech.name}
                        </span>
                        <span className="font-mono text-[11px] text-ink/60">
                          {tech.currentWorkload}/{tech.maxWorkload} jobs ({tech.utilization}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-ink/40">
                        <span>{tech.employeeId}</span>
                        {tech.phone && <span>{tech.phone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="flex-1 text-xs h-7.5 cursor-pointer active:translate-y-px rounded-xs font-medium bg-paper border border-line/40"
              >
                <Link href="/department/technicians">
                  <Users className="size-3.5 mr-1 text-ink/50" /> Staff Directory
                </Link>
              </Button>

              <Button
                asChild
                variant="secondary"
                size="sm"
                className="flex-1 text-xs h-7.5 cursor-pointer active:translate-y-px rounded-xs font-medium bg-paper border border-line/40"
              >
                <Link href="/department/teams">
                  <Wrench className="size-3.5 mr-1 text-ink/50" /> Teams
                </Link>
              </Button>
            </div>
          </div>

          {/* Department Coverage & Operational Scope */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-line/50">
              <ShieldAlert className="size-3.5 text-ink/50" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold">
                Operational Scope
              </h4>
            </div>

            <div className="space-y-2 text-xs font-body">
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60">Department Code:</span>
                <span className="font-mono text-ink font-semibold">
                  {department?.code || "DEPT"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60">Categories Handled:</span>
                <span className="font-mono text-ink font-medium">
                  {department?.counts?.totalCategories ?? 0} Categories
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60">Maintenance Teams:</span>
                <span className="font-mono text-ink font-medium">
                  {department?.counts?.totalTeams ?? 0} Teams
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60">Status:</span>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-mono border-line/60 bg-paper"
                >
                  {department?.status || "ACTIVE"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Operations Hubs Quick Links */}
          <div className="rounded-xl border border-line/80 bg-paper p-4.5 space-y-2 shadow-2xs">
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink/50 pb-1">
              Operations Hubs
            </h4>
            <div className="space-y-1.5 text-xs font-body">
              <Link
                href="/department/work-orders?status=WORK_ORDER_CREATED"
                className="flex items-center justify-between p-2 rounded-lg border border-line/60 bg-field/20 hover:bg-field/40 text-ink transition-colors cursor-pointer"
              >
                <span>Assign Crew Queue</span>
                <ArrowRight className="size-3 text-ink/40" />
              </Link>
              <Link
                href="/department/work-orders?status=ASSIGNED,TEAM_ASSIGNED,IN_PROGRESS"
                className="flex items-center justify-between p-2 rounded-lg border border-line/60 bg-field/20 hover:bg-field/40 text-ink transition-colors cursor-pointer"
              >
                <span>Active Work Orders</span>
                <ArrowRight className="size-3 text-ink/40" />
              </Link>
              <Link
                href="/department/work-orders?status=PENDING_VERIFICATION"
                className="flex items-center justify-between p-2 rounded-lg border border-line/60 bg-field/20 hover:bg-field/40 text-ink transition-colors cursor-pointer"
              >
                <span>Resolution Verification</span>
                <ArrowRight className="size-3 text-ink/40" />
              </Link>
              <Link
                href="/department/work-orders?status=RESOLVED,CLOSED"
                className="flex items-center justify-between p-2 rounded-lg border border-line/60 bg-field/20 hover:bg-field/40 text-ink transition-colors cursor-pointer"
              >
                <span>Completed Work Orders</span>
                <ArrowRight className="size-3 text-ink/40" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
