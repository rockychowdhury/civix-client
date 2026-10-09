"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TECH_DONE_WO_STATUSES } from "@/constant/technician.constant";
import { useMyQueue } from "@/hooks/work-order.hook";
import type { Assignment } from "@/types";

const DONE = new Set<string>([...TECH_DONE_WO_STATUSES]);

/** Closed, verified, and bounced-back jobs plus rejected dispatches. */
export function HistoryView() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const query = useMyQueue({
    searchTerm: debouncedSearch || undefined,
    limit: 100,
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading history">
        <Skeleton className="h-24 w-full bg-field/60" />
        <Skeleton className="h-24 w-full bg-field/60" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <EmptyState
        title="History unavailable"
        body="Past jobs could not be loaded. Check your connection and try again."
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

  const rows = ((query.data?.data ?? []) as Assignment[]).filter(
    (a) =>
      a.status === "REJECTED" || DONE.has(((a.workOrder?.status || "") as string).toUpperCase()),
  );

  return (
    <div className="flex flex-col gap-5">
      <Input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search past jobs…"
        aria-label="Search past jobs"
        className="bg-field/50 md:max-w-xs"
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No history yet"
          body="Resolved jobs and rejected dispatches will collect here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((assignment) => {
            const wo = assignment.workOrder;
            const rejected = assignment.status === "REJECTED";
            return (
              <Link
                key={assignment.id}
                href={wo?.id ? `/technician/work-orders/${wo.id}` : "/technician/history"}
                className="flex min-h-16 cursor-pointer items-center gap-4 rounded-xs border border-line/40 bg-paper px-5 py-4 transition-colors hover:border-line hover:bg-field/30"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-display text-base font-medium text-ink">
                    {wo?.title || "Untitled job"}
                  </span>
                  <span className="truncate font-body text-xs text-ink/55">
                    {rejected
                      ? `Rejected${assignment.notes ? ` — ${assignment.notes}` : ""}`
                      : (wo?.status || "").replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
                <StatusPill status={rejected ? "REJECTED" : wo?.status || "RESOLVED"} />
                <ChevronRight className="size-4 shrink-0 text-ink/40" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
