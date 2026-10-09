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

  const rows = (query.data?.data ?? []) as Assignment[];
  const total = query.data?.meta?.total ?? rows.length;

  return (
    <div className="flex flex-col gap-5">
      <p className="font-body text-sm text-ink/60" aria-live="polite">
        {total === 0
          ? "No active jobs — accept one from your inbox."
          : `${total} active job${total === 1 ? "" : "s"}. Tap one to continue.`}
      </p>
      <Input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search jobs…"
        aria-label="Search jobs"
        className="bg-field/50 md:max-w-xs"
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Nothing on your plate"
          body="Accepted assignments will appear here until resolved."
          action={
            <Button type="button" size="sm" asChild className="cursor-pointer">
              <Link href="/technician/inbox">Check inbox</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((assignment) => {
            const wo = assignment.workOrder;
            // Logging unlocks only after arrival — before that the job needs Start.
            const arrived = wo?.id
              ? !PRE_ARRIVAL.has((wo.status || "ASSIGNED").toUpperCase())
              : false;
            return (
              <article
                key={assignment.id}
                className="flex items-center gap-3 rounded-xs border border-line/40 bg-paper px-4 py-3 transition-colors hover:border-line sm:px-5 sm:py-4"
              >
                <Link
                  href={wo?.id ? `/technician/work-orders/${wo.id}` : "/technician/queue"}
                  className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1 rounded-xs focus-visible:outline-2 focus-visible:outline-ledger"
                >
                  <span className="truncate font-display text-base font-medium text-ink underline-offset-4 hover:underline">
                    {wo?.title || "Untitled job"}
                  </span>
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
                ) : wo?.id ? (
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
                ) : null}
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
