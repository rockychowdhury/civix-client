"use client";

import { format } from "date-fns";
import { Activity, CircleCheck, CircleX, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getMe, getPermissions, getSuperAdminOverview } from "@/api";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@/hooks/auth.hook";
import { cn } from "@/lib/utils";
import { AdminHeader, AdminStatCard } from "./admin-ui";

interface Probe {
  key: string;
  label: string;
  status: "pending" | "ok" | "down";
  latencyMs: number | null;
  detail: string;
}

const SLOW_MS = 2500;

export function SystemHealthView() {
  const meQuery = useGetMe();
  const [probes, setProbes] = useState<Probe[]>([
    { key: "auth", label: "Auth session", status: "pending", latencyMs: null, detail: "Checking…" },
    {
      key: "permissions",
      label: "Access control",
      status: "pending",
      latencyMs: null,
      detail: "Checking…",
    },
    {
      key: "analytics",
      label: "Analytics engine",
      status: "pending",
      latencyMs: null,
      detail: "Checking…",
    },
  ]);
  const [runId, setRunId] = useState(0);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [recordCounts, setRecordCounts] = useState<{
    users: number;
    municipalities: number;
    issues: number;
  } | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function timeIt<T>(
      fn: () => Promise<T>,
    ): Promise<{ ok: boolean; ms: number; value?: T }> {
      const start = performance.now();
      try {
        const value = await fn();
        return { ok: true, ms: Math.round(performance.now() - start), value };
      } catch {
        return { ok: false, ms: Math.round(performance.now() - start) };
      }
    }
    async function run() {
      const [auth, perms, analytics] = await Promise.all([
        timeIt(() => getMe()),
        timeIt(() => getPermissions({ limit: 1 })),
        timeIt(() => getSuperAdminOverview({ timeRange: "all_time" })),
      ]);
      if (cancelled || !mounted.current) return;
      const me = (auth.value as { data?: { email?: string } } | undefined)?.data;
      setProbes([
        {
          key: "auth",
          label: "Auth session",
          status: auth.ok ? "ok" : "down",
          latencyMs: auth.ms,
          detail: auth.ok ? me?.email || "Session valid" : "Unreachable",
        },
        {
          key: "permissions",
          label: "Access control",
          status: perms.ok ? "ok" : "down",
          latencyMs: perms.ms,
          detail: perms.ok ? "Policy engine reachable" : "Unreachable",
        },
        {
          key: "analytics",
          label: "Analytics engine",
          status: analytics.ok ? "ok" : "down",
          latencyMs: analytics.ms,
          detail: analytics.ok ? "Aggregations live" : "Unreachable",
        },
      ]);
      const data = (
        analytics.value as
          | {
              data?: {
                kpis?: {
                  totalUsers: number;
                  totalMunicipalities: number;
                  totalCivicIssues: number;
                };
              };
            }
          | undefined
      )?.data;
      if (analytics.ok && data) {
        setRecordCounts({
          users: data.kpis?.totalUsers ?? 0,
          municipalities: data.kpis?.totalMunicipalities ?? 0,
          issues: data.kpis?.totalCivicIssues ?? 0,
        });
      }
      setLastRun(new Date());
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [runId]);

  const down = probes.filter((p) => p.status === "down").length;
  const slow = probes.filter((p) => p.status === "ok" && (p.latencyMs ?? 0) > SLOW_MS).length;
  const overall = down > 0 ? "Degraded" : slow > 0 ? "Slow" : "Operational";
  const checking = probes.some((p) => p.status === "pending");

  if (meQuery.isLoading && checking) return <AdminSectionSkeleton />;
  if (meQuery.isError && down === probes.length) {
    return (
      <EmptyState
        title="Platform unreachable"
        body="None of the core services responded. Check your connection and try again."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setRunId((n) => n + 1)}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminHeader
        eyebrow="Live service status"
        title="System health"
        description="Measured live against the API — reachability, latency, and record counts."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setRunId((n) => n + 1)}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs"
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Re-check
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard
          label="Platform"
          value={
            <span
              className={cn(
                overall === "Operational" && "text-signal-resolved",
                overall === "Slow" && "text-signal-progress",
                overall === "Degraded" && "text-signal-open",
              )}
            >
              {checking ? "…" : overall}
            </span>
          }
          sub={lastRun ? `Checked ${format(lastRun, "HH:mm:ss")}` : "Checking…"}
          icon={<Activity className="size-4 text-ink/40" />}
        />
        <AdminStatCard
          label="Users"
          value={(recordCounts?.users ?? 0).toLocaleString()}
          sub="Total accounts"
        />
        <AdminStatCard
          label="Municipalities"
          value={(recordCounts?.municipalities ?? 0).toLocaleString()}
          sub="Tenant cities"
        />
        <AdminStatCard
          label="Civic issues"
          value={(recordCounts?.issues ?? 0).toLocaleString()}
          sub="All-time reports"
        />
      </div>

      <div className="rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="pb-3 border-b border-line/60">
          <h2 className="font-display text-base font-semibold text-ink">Service probes</h2>
          <p className="font-body text-xs text-ink/60 mt-0.5">
            Real timings of core endpoints. Slow marks anything over {SLOW_MS}ms.
          </p>
        </div>
        <div className="divide-y divide-line/40">
          {probes.map((p) => (
            <div key={p.key} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {p.status === "pending" ? (
                  <span className="size-2 rounded-full bg-ink/20 animate-pulse shrink-0" />
                ) : p.status === "ok" ? (
                  <CircleCheck className="size-4 text-signal-resolved shrink-0" />
                ) : (
                  <CircleX className="size-4 text-signal-open shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink">{p.label}</p>
                  <p className="font-mono text-[11px] text-ink/50 truncate">{p.detail}</p>
                </div>
              </div>
              <span className="font-mono text-xs text-ink/60 shrink-0">
                {p.latencyMs == null ? "…" : `${p.latencyMs}ms`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
