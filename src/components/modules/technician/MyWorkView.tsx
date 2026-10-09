"use client";

import { NotebookPen, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { QuickUpdateSheet } from "@/components/modules/technician/QuickUpdateSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyQueue, useSubmitWorkUpdate } from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types";

const PRE_ARRIVAL = new Set(["ASSIGNED", "ACCEPTED"]);

/**
 * Stage 2 of the field workflow: accepted jobs being executed.
 * Each row opens the execution page — the single place to log and resolve.
 */
export function MyWorkView() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [logging, setLogging] = useState<Assignment | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "in_progress" | "pending_verification">("all");

  const query = useMyQueue({
    status: "ACCEPTED",
    searchTerm: debouncedSearch || undefined,
    limit: 50,
  });
  const arriveMutation = useSubmitWorkUpdate();

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading your work">
        <Skeleton className="h-24 w-full bg-field/60" />
        <Skeleton className="h-24 w-full bg-field/60" />
        <Skeleton className="h-24 w-full bg-field/60" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <EmptyState
        title="Work list unavailable"
        body="Your jobs could not be loaded. Check your connection and try again."
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

  const allRows = ((query.data?.data ?? []) as Assignment[]).filter((a) => {
    const s = ((a.workOrder?.status || "") as string).toUpperCase();
    return s !== "RESOLVED" && s !== "CLOSED";
  });

  const filteredRows = allRows.filter((a) => {
    const s = ((a.workOrder?.status || "") as string).toUpperCase();
    if (filterTab === "in_progress") {
      return s === "IN_PROGRESS" || s === "ACCEPTED" || s === "ASSIGNED";
    }
    if (filterTab === "pending_verification") {
      return s === "PENDING_VERIFICATION";
    }
    return true;
  });

  const total = filteredRows.length;

  return (
    <div className="flex flex-col gap-5 animate-slide-up motion-reduce:animate-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 rounded-xs border border-line/40 bg-field/30 p-1">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={cn(
              "cursor-pointer rounded-xs px-3 py-1.5 text-xs font-display font-medium transition-colors",
              filterTab === "all"
                ? "bg-ledger text-paper shadow-xs"
                : "text-ink/60 hover:text-ink hover:bg-field/50",
            )}
          >
            All Active ({allRows.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("in_progress")}
            className={cn(
              "cursor-pointer rounded-xs px-3 py-1.5 text-xs font-display font-medium transition-colors",
              filterTab === "in_progress"
                ? "bg-ledger text-paper shadow-xs"
                : "text-ink/60 hover:text-ink hover:bg-field/50",
            )}
          >
            In Progress (
            {
              allRows.filter((a) => {
                const s = (a.workOrder?.status || "").toUpperCase();
                return s === "IN_PROGRESS" || s === "ACCEPTED" || s === "ASSIGNED";
              }).length
            }
            )
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("pending_verification")}
            className={cn(
              "cursor-pointer rounded-xs px-3 py-1.5 text-xs font-display font-medium transition-colors",
              filterTab === "pending_verification"
                ? "bg-ledger text-paper shadow-xs"
                : "text-ink/60 hover:text-ink hover:bg-field/50",
            )}
          >
            In Verification (
            {
              allRows.filter(
                (a) => (a.workOrder?.status || "").toUpperCase() === "PENDING_VERIFICATION",
              ).length
            }
            )
          </button>
        </div>
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs…"
          aria-label="Search jobs"
          className="bg-field/50 md:max-w-xs"
        />
      </div>

      <p className="font-body text-sm text-ink/60" aria-live="polite">
        {total === 0
          ? "No matching active jobs."
          : `${total} active job${total === 1 ? "" : "s"}. Tap one to open.`}
      </p>

      {filteredRows.length === 0 ? (
        <EmptyState
          title="Nothing on your plate"
          body="Accepted assignments will appear here until verified and closed."
          action={
            <Button type="button" size="sm" asChild className="cursor-pointer">
              <Link href="/technician/inbox">Check inbox</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRows.map((assignment) => {
            const wo = assignment.workOrder;
            const statusUpper = (wo?.status || "ASSIGNED").toUpperCase();
            const isPendingVerif = statusUpper === "PENDING_VERIFICATION";
            // Logging unlocks only after arrival — before that the job needs Start.
            const arrived = wo?.id ? !PRE_ARRIVAL.has(statusUpper) : false;

            return (
              <article
                key={assignment.id}
                className="flex items-center gap-3 rounded-xs border border-line/40 bg-paper px-4 py-3 transition-colors hover:border-line sm:px-5 sm:py-4"
              >
                <Link
                  href={wo?.id ? `/technician/work-orders/${wo.id}` : "/technician/queue"}
                  className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1 rounded-xs focus-visible:outline-2 focus-visible:outline-ledger"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-base font-medium text-ink underline-offset-4 hover:underline">
                      {wo?.title || "Untitled job"}
                    </span>
                    {wo?.id ? (
                      <span className="font-mono text-xs text-ink/40">
                        {wo.id.split("-")[0].toUpperCase()}
                      </span>
                    ) : null}
                  </div>
                  <span className="truncate font-body text-xs text-ink/55">
                    {(wo as { civicIssue?: { location?: { address?: string } } } | null)?.civicIssue
                      ?.location?.address || "No address on file"}
                  </span>
                </Link>
                <StatusPill status={wo?.status || "ASSIGNED"} />
                {wo?.id && !arrived ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={arriveMutation.isPending}
                    onClick={() =>
                      arriveMutation.mutate(
                        { id: wo.id, payload: { updateType: "ON_SITE" } },
                        {
                          onSuccess: () => toast.success("On site — clock started"),
                          onError: () => toast.error("Failed to log arrival"),
                        },
                      )
                    }
                    aria-label={`Start ${wo?.title || "job"}`}
                    className="min-h-11 cursor-pointer px-4"
                  >
                    <Play className="size-4 fill-current" aria-hidden="true" />
                    <span className="hidden sm:inline">Start</span>
                  </Button>
                ) : wo?.id && !isPendingVerif ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setLogging(assignment)}
                    aria-label={`Log update for ${wo?.title || "job"}`}
                    className="min-h-11 min-w-11 cursor-pointer px-3"
                  >
                    <NotebookPen className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Log</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    asChild
                    className="min-h-11 cursor-pointer px-3 text-xs text-ink/60"
                  >
                    <Link href={`/technician/work-orders/${wo?.id}`}>Details</Link>
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {logging?.workOrderId ? (
        <QuickUpdateSheet
          workOrderId={logging.workOrderId}
          jobTitle={logging.workOrder?.title}
          open={logging !== null}
          onOpenChange={(open) => {
            if (!open) setLogging(null);
          }}
        />
      ) : null}
    </div>
  );
}
