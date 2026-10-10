"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gauge,
  Inbox,
  MapPin,
  Pause,
  Play,
  RefreshCw,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RejectAssignmentDialog } from "@/components/work-orders/RejectAssignmentDialog";
import { useTechnicianDashboard, useUpdateTechnicianAvailability } from "@/hooks/staff.hook";
import { useQuickActionWorkOrder, useRejectAssignment } from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import type { Assignment, WorkOrder, WorkUpdate } from "@/types";

export function TechnicianOverviewView() {
  const { data, isLoading, isFetching, isError, refetch } = useTechnicianDashboard();
  const updateAvailability = useUpdateTechnicianAvailability();
  const rejectMutation = useRejectAssignment();
  const quickAction = useQuickActionWorkOrder();

  const [rejectDialogAssignment, setRejectDialogAssignment] = useState<Assignment | null>(null);

  if (isLoading) {
    return (
      <div
        className="flex flex-col gap-6 sm:gap-8 w-full max-w-7xl mx-auto animate-pulse"
        role="status"
        aria-label="Loading dashboard"
      >
        <div className="h-24 bg-field/30 rounded-xl border border-line/40" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {["kpi-1", "kpi-2", "kpi-3", "kpi-4", "kpi-5"].map((id) => (
            <div key={id} className="h-24 bg-field/30 rounded-xl border border-line/40" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-field/30 rounded-xl border border-line/40" />
          <div className="lg:col-span-4 h-96 bg-field/30 rounded-xl border border-line/40" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <EmptyState
          title="Technician Dashboard Unavailable"
          body="Could not load your shift metrics and assigned queues. Please check your network and try again."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => refetch()}
              className="cursor-pointer bg-paper border border-line/60"
            >
              <RefreshCw className="size-3.5 mr-1.5" /> Retry Loading
            </Button>
          }
        />
      </div>
    );
  }

  const { profile, kpi, queues } = data;
  const isAvailable = profile?.isAvailable ?? false;
  const utilization = profile?.utilizationRate ?? 0;

  const handleToggleAvailability = (checked: boolean) => {
    updateAvailability.mutate(checked);
  };

  const handleQuickAction = (id: string, action: "START" | "PAUSE" | "RESUME") => {
    quickAction.mutate({
      id,
      payload: { action },
    });
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-7xl mx-auto animate-slide-up motion-reduce:animate-none">
      {/* 1. Standard Portal Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-line/60">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
              Technician Operations
            </span>
            <span className="text-ink/30">•</span>
            <span className="font-mono text-xs text-ink/60">Live Shift Console</span>
            {profile?.employeeId && (
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-xs bg-field/70 text-ink border border-line/60">
                {profile.employeeId}
              </span>
            )}
            {profile?.department && (
              <Badge
                variant="outline"
                className="border-line/60 text-[11px] font-mono text-ink/70 gap-1"
              >
                <Building2 className="size-3 text-ledger" />
                {profile.department.name}
              </Badge>
            )}
            {profile?.teams && profile.teams.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-field/70 text-[11px] font-mono text-ink/70 gap-1"
              >
                <Users className="size-3 text-ink/50" />
                {profile.teams.map((t) => t.name).join(", ")}
              </Badge>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Welcome back, {profile?.name || "Technician"}
          </h1>
          <p className="font-body text-xs sm:text-sm text-ink/65 max-w-2xl">
            Live overview of your field assignments, shift workload capacity, and resolution queue.
          </p>
        </div>

        {/* Right Header Action Area: Shift Duty Toggle + Refresh */}
        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap sm:flex-nowrap">
          {/* Shift Duty Status Switch */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg border border-line/60 bg-paper shadow-2xs">
            <div className="flex flex-col items-end">
              <span
                className={cn(
                  "font-display text-xs font-semibold leading-tight",
                  isAvailable ? "text-signal-resolved" : "text-ink/40",
                )}
              >
                {isAvailable ? "ON DUTY" : "OFF DUTY"}
              </span>
              <span className="text-[10px] font-mono text-ink/40">
                {isAvailable ? "Receiving jobs" : "On break / off shift"}
              </span>
            </div>
            <Switch
              id="shift-toggle"
              checked={isAvailable}
              disabled={updateAvailability.isPending}
              onCheckedChange={handleToggleAvailability}
              className="cursor-pointer"
            />
          </div>

          {/* Sync Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 text-xs text-ink/70 hover:text-ink bg-paper border-line/60 cursor-pointer shrink-0"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={cn("size-3.5 mr-1.5", isFetching && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* 2. Action Required Alert: Incoming Dispatches */}
      {queues?.pendingAssignments && queues.pendingAssignments.length > 0 && (
        <div className="rounded-xl border border-line/80 bg-paper p-4.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs border-l-4 border-l-signal-open">
          <div className="flex items-start gap-3.5">
            <div className="size-9 rounded-full bg-signal-open/10 flex items-center justify-center text-signal-open shrink-0 mt-0.5">
              <ShieldAlert className="size-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold text-ink">
                  New Dispatches Awaiting Acceptance
                </h2>
                <Badge
                  variant="outline"
                  className="border-signal-open/40 bg-signal-open/10 text-signal-open text-[10px] font-mono font-medium"
                >
                  {queues.pendingAssignments.length} pending
                </Badge>
              </div>
              <p className="font-body text-xs text-ink/70 leading-relaxed">
                Dispatch has assigned new civic work orders to you. Review job locations and scope
                to accept into your active roster or re-route.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="primary"
            size="sm"
            className="cursor-pointer text-xs shrink-0 self-start sm:self-auto active:translate-y-px rounded-xs font-medium"
          >
            <Link href="/technician/inbox">
              Review Dispatches <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* 3. Key Performance Indicators (5 Metrics Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Link
          href="/technician/inbox"
          className="group rounded-xl border border-line/70 bg-paper p-4.5 sm:p-5 hover:border-line hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink/50 flex items-center justify-between">
            Pending Dispatch
            <Inbox className="size-4 text-ink/30 group-hover:text-ink/60 transition-colors" />
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {kpi?.pendingAssignmentsCount ?? 0}
            </span>
            {(kpi?.pendingAssignmentsCount ?? 0) > 0 ? (
              <span className="text-[10px] font-mono font-medium text-signal-open">
                Action required
              </span>
            ) : (
              <span className="text-[10px] font-mono text-ink/40">All clear</span>
            )}
          </div>
        </Link>

        <Link
          href="/technician/work-orders?stage=active"
          className="group rounded-xl border border-line/70 bg-paper p-4.5 sm:p-5 hover:border-line hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink/50 flex items-center justify-between">
            Active Jobs
            <Wrench className="size-4 text-ink/30 group-hover:text-ink/60 transition-colors" />
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {kpi?.activeWorkOrdersCount ?? 0}
            </span>
            <span className="text-[10px] font-mono text-ink/40">In execution</span>
          </div>
        </Link>

        <Link
          href="/technician/work-orders?stage=verification"
          className="group rounded-xl border border-line/70 bg-paper p-4.5 sm:p-5 hover:border-line hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink/50 flex items-center justify-between">
            Under Verification
            <Clock className="size-4 text-ink/30 group-hover:text-ink/60 transition-colors" />
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {kpi?.pendingVerificationCount ?? 0}
            </span>
            <span className="text-[10px] font-mono text-ink/40">Manager sign-off</span>
          </div>
        </Link>

        <Link
          href="/technician/history"
          className="group rounded-xl border border-line/70 bg-paper p-4.5 sm:p-5 hover:border-line hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink/50 flex items-center justify-between">
            Resolved This Week
            <CheckCircle2 className="size-4 text-ink/30 group-hover:text-ink/60 transition-colors" />
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {kpi?.completedThisWeekCount ?? 0}
            </span>
            <span className="text-[10px] font-mono text-signal-resolved">Verified</span>
          </div>
        </Link>

        <div className="rounded-xl border border-line/70 bg-paper p-4.5 sm:p-5 flex flex-col justify-between shadow-2xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink/50 flex items-center justify-between">
            Overdue SLAs
            <AlertCircle className="size-4 text-ink/30" />
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={cn(
                "font-display text-2xl sm:text-3xl font-bold",
                (kpi?.overdueCount ?? 0) > 0 ? "text-signal-open" : "text-ink",
              )}
            >
              {kpi?.overdueCount ?? 0}
            </span>
            <span className="text-[10px] font-mono text-ink/40">Critical alerts</span>
          </div>
        </div>
      </div>

      {/* 4. Asymmetrical Operational Command Section (8 cols / 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Active Field Work Orders Console */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-xl border border-line/70 bg-paper p-5 sm:p-6 flex flex-col gap-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/40 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-base font-semibold text-ink">
                    Active Field Work Orders
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-ink/5 text-ink/70 border-line/40 font-mono text-xs px-2 py-0.5"
                  >
                    {queues?.activeWorkOrders?.length ?? 0} active
                  </Badge>
                </div>
                <p className="font-body text-xs text-ink/60">
                  Direct operations underway in your assigned field sector.
                </p>
              </div>

              <Button
                size="sm"
                variant="ghost"
                asChild
                className="text-xs cursor-pointer text-ink/70 hover:text-ink self-start sm:self-auto"
              >
                <Link href="/technician/work-orders">
                  View Full Roster <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>

            {queues?.activeWorkOrders && queues.activeWorkOrders.length > 0 ? (
              <div className="flex flex-col gap-3">
                {queues.activeWorkOrders.map((wo: WorkOrder) => {
                  const status = (wo.status || "").toUpperCase();
                  const isStarted = status === "IN_PROGRESS";
                  return (
                    <div
                      key={wo.id}
                      className="p-4 rounded-lg border border-line/50 bg-field/15 hover:bg-field/30 hover:border-line/70 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5"
                    >
                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill status={wo.status} />
                          {wo.civicIssue?.issueNumber && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs bg-field/70 text-ink border border-line/40 font-medium">
                              #{wo.civicIssue.issueNumber}
                            </span>
                          )}
                          {wo.civicIssue?.category?.name && (
                            <span className="text-[11px] font-mono text-ink/50">
                              · {wo.civicIssue.category.name}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/technician/work-orders/${wo.id}`}
                          className="font-display text-sm font-semibold text-ink hover:underline cursor-pointer truncate"
                        >
                          {wo.title}
                        </Link>

                        {wo.civicIssue?.location?.address && (
                          <p className="text-xs text-ink/60 flex items-center gap-1.5 truncate font-body">
                            <MapPin className="size-3 text-ink/40 shrink-0" />
                            {wo.civicIssue.location.address}
                          </p>
                        )}
                      </div>

                      {/* 1-Tap Quick Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-line/30 w-full sm:w-auto justify-end">
                        {!isStarted ? (
                          <Button
                            size="sm"
                            onClick={() => handleQuickAction(wo.id, "START")}
                            disabled={quickAction.isPending}
                            className="h-8 text-xs bg-ledger text-paper hover:bg-ledger/90 cursor-pointer flex items-center gap-1.5 font-medium shadow-2xs"
                          >
                            <Play className="size-3 fill-current" />
                            Start Work
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleQuickAction(wo.id, "PAUSE")}
                              disabled={quickAction.isPending}
                              className="h-8 text-xs border border-line/40 text-ink hover:bg-field cursor-pointer flex items-center gap-1.5"
                            >
                              <Pause className="size-3 fill-current" />
                              Pause
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              asChild
                              className="h-8 text-xs cursor-pointer font-medium"
                            >
                              <Link href={`/technician/work-orders/${wo.id}`}>Resolve</Link>
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-8 w-8 p-0 cursor-pointer text-ink/40 hover:text-ink"
                        >
                          <Link href={`/technician/work-orders/${wo.id}`} title="View Details">
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-ink/50 font-body flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="size-7 text-signal-resolved/50" />
                <p>No active field work orders currently. All caught up!</p>
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="mt-2 text-xs cursor-pointer"
                >
                  <Link href="/technician/inbox">Check Incoming Dispatches</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Shift Capacity Meter & Recent Field Activity */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Workload Capacity Meter Card */}
          <div className="rounded-xl border border-line/70 bg-paper p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
            <div className="border-b border-line/40 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold text-ink flex items-center gap-1.5">
                  <Gauge className="size-4 text-ink/50" />
                  Shift Capacity
                </h3>
                <p className="font-body text-xs text-ink/50">Current dispatch quota utilization.</p>
              </div>
              <span className="font-mono text-xs font-semibold text-ink">
                {profile?.currentWorkload ?? 0}/{profile?.maxWorkload ?? 5} Jobs
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink/60">Utilization Rate:</span>
                <span className="font-semibold text-ink">{utilization.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-field/80 overflow-hidden border border-line/40">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    utilization > 80
                      ? "bg-signal-open"
                      : utilization > 50
                        ? "bg-signal-in-progress"
                        : "bg-signal-resolved",
                  )}
                  style={{ width: `${Math.min(100, Math.max(5, utilization))}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-line/30 flex justify-between items-center text-xs font-mono text-ink/60">
              <span>Duty Status:</span>
              <span
                className={cn("font-medium", isAvailable ? "text-signal-resolved" : "text-ink/40")}
              >
                {isAvailable ? "Ready for assignments" : "Offline / On break"}
              </span>
            </div>
          </div>

          {/* Recent Field Updates Timeline Card */}
          <div className="rounded-xl border border-line/70 bg-paper p-5 sm:p-6 flex flex-col gap-4 shadow-2xs">
            <div className="border-b border-line/40 pb-3">
              <h3 className="font-display text-sm font-semibold text-ink">Recent Field Updates</h3>
              <p className="font-body text-xs text-ink/50">Your latest logged site milestones.</p>
            </div>

            {queues?.recentUpdates && queues.recentUpdates.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {queues.recentUpdates.slice(0, 5).map((update: WorkUpdate) => (
                  <div
                    key={update.id}
                    className="p-3 rounded-lg border border-line/40 bg-field/20 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-semibold text-ledger px-1.5 py-0.5 rounded-xs bg-ledger/10">
                        {update.updateType}
                      </span>
                      {update.createdAt && (
                        <span className="text-[10px] font-mono text-ink/40">
                          {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {update.note && (
                      <p className="text-ink/75 line-clamp-2 leading-relaxed font-body mt-0.5">
                        {update.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-ink/40 font-body">
                No site updates logged today.
              </div>
            )}

            <div className="pt-2 border-t border-line/30 flex justify-between items-center text-xs">
              <span className="text-ink/50 font-body">Field Equipment Ready</span>
              <Link
                href="/technician/profile"
                className="font-medium text-ledger hover:underline cursor-pointer"
              >
                Profile & Shift &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Assignment Confirmation Modal */}
      {rejectDialogAssignment && (
        <RejectAssignmentDialog
          open={!!rejectDialogAssignment}
          onOpenChange={(open) => !open && setRejectDialogAssignment(null)}
          workOrderTitle={rejectDialogAssignment.workOrder?.title}
          isPending={rejectMutation.isPending}
          onConfirm={(reason) => {
            rejectMutation.mutate(
              { id: rejectDialogAssignment.id, reason },
              {
                onSuccess: () => setRejectDialogAssignment(null),
              },
            );
          }}
        />
      )}
    </div>
  );
}
