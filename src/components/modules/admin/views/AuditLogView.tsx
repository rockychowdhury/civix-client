"use client";

import { format } from "date-fns";
import { Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSuperAdminOverview } from "@/hooks";
import type { SuperAdminAuditLog } from "@/types";
import { AdminEmptyState, AdminHeader, AdminStatCard } from "./admin-ui";
import { useAdminListParams } from "./useAdminListParams";

export function AuditLogView() {
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const { search, setSearch, debouncedSearch } = useAdminListParams(
    `${actionFilter}:${resourceFilter}`,
  );
  const query = useGetSuperAdminOverview();

  const logs = useMemo(
    () => (query.data?.data?.actionableQueues?.recentAuditLogs ?? []) as SuperAdminAuditLog[],
    [query.data],
  );

  const actions = useMemo(() => [...new Set(logs.map((l) => l.action))].sort(), [logs]);
  const resources = useMemo(() => [...new Set(logs.map((l) => l.resource))].sort(), [logs]);

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return logs.filter((l) => {
      if (actionFilter !== "ALL" && l.action !== actionFilter) return false;
      if (resourceFilter !== "ALL" && l.resource !== resourceFilter) return false;
      if (
        term &&
        !`${l.action} ${l.resource} ${l.user?.email ?? ""} ${l.user?.displayName ?? ""} ${l.resourceId}`
          .toLowerCase()
          .includes(term)
      )
        return false;
      return true;
    });
  }, [logs, actionFilter, resourceFilter, debouncedSearch]);

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Audit trail unavailable"
        body="The platform trail could not be loaded. Check your connection and try again."
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

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminHeader
        eyebrow="Accountability"
        title="Audit log"
        description="The platform operation trail — who changed what, and when. Newest first."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => query.refetch()}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs"
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard
          label="Events"
          value={logs.length}
          sub="In the trail window"
          icon={<ShieldAlert className="size-4 text-ink/40" />}
        />
        <AdminStatCard label="Actions" value={actions.length} sub="Distinct verbs" />
        <AdminStatCard label="Resources" value={resources.length} sub="Touched domains" />
        <AdminStatCard label="In view" value={filtered.length} sub="Matching filters" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <ShieldAlert className="size-3.5" />
          {filtered.length} event{filtered.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search actor, resource…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[130px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All actions
              </SelectItem>
              {actions.map((a) => (
                <SelectItem key={a} value={a} className="text-xs cursor-pointer">
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[140px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All resources
              </SelectItem>
              {resources.map((r) => (
                <SelectItem key={r} value={r} className="text-xs cursor-pointer">
                  {r.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="w-full rounded-xl border border-line/80 bg-paper overflow-hidden shadow-2xs">
          <AdminEmptyState title="No events match." body="Widen the filters to see more trail." />
        </div>
      ) : (
        <div className="rounded-xl border border-line/80 bg-paper divide-y divide-line/40 overflow-hidden shadow-2xs">
          {filtered.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-3">
              <span className="mt-1.5 size-1.5 rounded-full bg-ledger shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-ink">
                    {log.action}{" "}
                    <span className="font-mono text-[10px] font-normal text-ink/45">
                      {log.resource.replace(/_/g, " ")}
                    </span>
                  </p>
                  <span className="font-mono text-[10px] text-ink/40 shrink-0">
                    {log.createdAt ? format(new Date(log.createdAt), "MMM d, HH:mm") : ""}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-ink/55 truncate">
                  {log.user?.displayName || log.user?.email || "System"} ·{" "}
                  {log.resourceId.slice(0, 8)}
                  {log.ipAddress ? ` · ${log.ipAddress}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
