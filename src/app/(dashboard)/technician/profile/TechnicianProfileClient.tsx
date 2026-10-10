"use client";

import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Gauge,
  Mail,
  Phone,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTechnicianDashboard, useUpdateTechnicianAvailability } from "@/hooks/staff.hook";
import { cn } from "@/lib/utils";

export function TechnicianProfileClient() {
  const { data: dashData, isLoading, isFetching, refetch } = useTechnicianDashboard();
  const updateAvailability = useUpdateTechnicianAvailability();

  if (isLoading) {
    return (
      <div
        className="flex flex-col gap-6 sm:gap-8 w-full max-w-7xl mx-auto animate-pulse"
        role="status"
        aria-label="Loading profile"
      >
        <div className="h-24 bg-field/30 rounded-xl border border-line/40" />
        <div className="h-44 w-full rounded-xl bg-field/40 border border-line/40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 rounded-xl bg-field/30 border border-line/40" />
          <div className="h-56 rounded-xl bg-field/30 border border-line/40" />
        </div>
      </div>
    );
  }

  const profile = dashData?.profile;
  const kpi = dashData?.kpi;
  const isAvailable = profile?.isAvailable ?? false;
  const utilization = profile?.utilizationRate ?? 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-7xl mx-auto animate-slide-up motion-reduce:animate-none">
      {/* 1. Standard Portal Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-line/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
              Technician Operations
            </span>
            <span className="text-ink/30">•</span>
            <span className="font-mono text-xs text-ink/60">Profile & Shift</span>
            {profile?.employeeId && (
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-xs bg-field/70 text-ink border border-line/60 ml-1">
                {profile.employeeId}
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Technician Profile & Shift
          </h1>
          <p className="font-body text-xs sm:text-sm text-ink/65 max-w-2xl">
            Field credentials, operational crew assignments, active shift availability, and workload
            quotas.
          </p>
        </div>

        {/* Right Header Toolbar: Sync */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 text-xs text-ink/70 hover:text-ink bg-paper border-line/60 cursor-pointer shrink-0"
            title="Refresh profile"
          >
            <RefreshCw className={cn("size-3.5 mr-1.5", isFetching && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* 2. Main Profile Header Card */}
      <div className="bg-paper p-6 sm:p-8 rounded-xl border border-line/70 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="size-20 rounded-xl bg-ledger/10 flex items-center justify-center text-ledger text-2xl font-display font-semibold shrink-0 border border-ledger/20 shadow-xs">
              {profile?.name
                ?.split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("") || "TC"}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-xs bg-field/70 text-ink border border-line/60">
                  {profile?.employeeId || "TEC-001"}
                </span>
                <h2 className="font-display text-xl sm:text-2xl text-ink font-semibold">
                  {profile?.name}
                </h2>
              </div>
              <p className="text-xs font-body text-ink/70">
                {profile?.designation || "Senior Field Operations Technician"}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1 text-xs text-ink/60 font-mono">
                {profile?.email && (
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Mail className="size-3.5 opacity-50 shrink-0" />
                    <span className="truncate break-all">{profile.email}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-3.5 opacity-50 shrink-0" />
                    {profile.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Department Tag */}
          {profile?.department && (
            <div className="flex flex-col items-start md:items-end gap-1 p-3.5 rounded-xl bg-field/30 border border-line/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink/50">
                Assigned Department
              </span>
              <span className="font-display text-xs font-semibold text-ink flex items-center gap-1.5">
                <Building2 className="size-4 text-ledger" />
                {profile.department.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Shift, Capacity & Performance Grid (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Availability Toggle */}
        <div className="bg-paper p-6 rounded-xl border border-line/70 flex flex-col justify-between shadow-2xs gap-5">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-base font-semibold text-ink flex items-center gap-2">
              <CalendarCheck className="size-4.5 text-ledger" />
              Field Shift Status
            </h3>
            <p className="text-xs text-ink/65 leading-relaxed font-body">
              When On Duty, dispatchers and automated routing algorithms will assign emergency and
              civic work orders to your queue.
            </p>
          </div>

          <div className="flex items-center justify-between p-4.5 rounded-xl bg-field/30 border border-line/40">
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-display text-sm font-semibold",
                  isAvailable ? "text-signal-resolved" : "text-ink/50",
                )}
              >
                {isAvailable ? "ON DUTY (Active)" : "OFF DUTY (Unavailable)"}
              </span>
              <span className="text-[11px] font-mono text-ink/40">
                {isAvailable ? "Available for automated dispatch" : "Break or off shift"}
              </span>
            </div>
            <Switch
              checked={isAvailable}
              disabled={updateAvailability.isPending}
              onCheckedChange={(checked) => updateAvailability.mutate(checked)}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Workload Capacity Gauge */}
        <div className="bg-paper p-6 rounded-xl border border-line/70 flex flex-col justify-between shadow-2xs gap-5">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-base font-semibold text-ink flex items-center gap-2">
              <Gauge className="size-4.5 text-ledger" />
              Workload Quota & Capacity
            </h3>
            <p className="text-xs text-ink/65 leading-relaxed font-body">
              Real-time utilization based on assigned and active field operations in progress.
            </p>
          </div>

          <div className="p-4.5 rounded-xl bg-field/30 border border-line/40 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-ink/60">Current Workload:</span>
              <span className="font-semibold text-ink">
                {profile?.currentWorkload ?? 0} / {profile?.maxWorkload ?? 5} Work Orders (
                {utilization.toFixed(0)}%)
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-field overflow-hidden border border-line/40">
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
        </div>

        {/* Assigned Teams & Crews */}
        <div className="bg-paper p-6 rounded-xl border border-line/70 flex flex-col gap-4 shadow-2xs">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-base font-semibold text-ink flex items-center gap-2">
              <Users className="size-4.5 text-ledger" />
              Operational Crews & Teams
            </h3>
            <p className="text-xs text-ink/65 font-body">
              Crew memberships for joint dispatch and collective work orders.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {profile?.teams && profile.teams.length > 0 ? (
              profile.teams.map((team) => (
                <div
                  key={team.id}
                  className="px-3 py-1.5 rounded-lg bg-field/40 border border-line/50 text-xs font-mono text-ink flex items-center gap-1.5"
                >
                  <span className="size-1.5 rounded-full bg-ledger" />
                  {team.name}
                  {team.code && <span className="text-ink/40">({team.code})</span>}
                </div>
              ))
            ) : (
              <span className="text-xs font-body text-ink/40">
                Operating as Independent Rapid Technician
              </span>
            )}
          </div>
        </div>

        {/* Weekly Performance Metrics */}
        <div className="bg-paper p-6 rounded-xl border border-line/70 flex flex-col gap-4 shadow-2xs">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-base font-semibold text-ink flex items-center gap-2">
              <CheckCircle2 className="size-4.5 text-signal-resolved" />
              Performance Snapshot
            </h3>
            <p className="text-xs text-ink/65 font-body">
              Overview of completed and verified operational resolutions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-field/30 border border-line/40 flex flex-col">
              <span className="text-[10px] font-mono text-ink/50 uppercase tracking-wider">
                Completed This Week
              </span>
              <span className="font-display text-2xl font-bold text-ink mt-1">
                {kpi?.completedThisWeekCount ?? 0}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-field/30 border border-line/40 flex flex-col">
              <span className="text-[10px] font-mono text-ink/50 uppercase tracking-wider">
                Overdue Critical
              </span>
              <span
                className={cn(
                  "font-display text-2xl font-bold mt-1",
                  (kpi?.overdueCount ?? 0) > 0 ? "text-signal-open" : "text-ink",
                )}
              >
                {kpi?.overdueCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
