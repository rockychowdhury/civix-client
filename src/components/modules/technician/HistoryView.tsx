"use client";

import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMyWorkOrders } from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import type { WorkOrder } from "@/types";

export function HistoryView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);
  const limit = 10;

  const query = useMyWorkOrders({
    stage: "completed",
    searchTerm: debouncedSearch.trim() || undefined,
    page,
    limit,
  });

  const workOrders = (query.data?.data || []) as WorkOrder[];
  const meta = query.data?.meta;
  const total = meta?.total ?? workOrders.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / limit));

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
            <span className="font-mono text-xs text-ink/60">Resolution History</span>
            {!query.isLoading && (
              <Badge
                variant="secondary"
                className="bg-ink/5 text-ink/70 border-line/40 font-mono text-xs px-2 py-0.5 ml-1"
              >
                {total} verified record{total === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Resolution History
          </h1>
          <p className="font-body text-xs sm:text-sm text-ink/65 max-w-2xl">
            Historical archive of completed field operations, signed-off civic issues, and verified
            repairs.
          </p>
        </div>

        {/* Right Header Toolbar: Search + Sync */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40 pointer-events-none" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search past completed jobs..."
              className="h-9 pl-9 pr-7 text-xs bg-paper border-line/60 rounded-md focus-visible:ring-1 focus-visible:ring-ledger font-body text-ink"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink cursor-pointer p-2"
                aria-label="Clear search"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Sync Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            className="h-9 px-3 text-xs text-ink/70 hover:text-ink bg-paper border-line/60 cursor-pointer shrink-0"
            title="Refresh history"
          >
            <RefreshCw className={cn("size-3.5 mr-1.5", query.isFetching && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* 2. Loading Skeleton */}
      {query.isLoading && (
        <div className="flex flex-col gap-3.5" role="status" aria-label="Loading history">
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="h-28 w-full rounded-xl bg-field/30 border border-line/40 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* 3. Error State */}
      {query.isError && (
        <EmptyState
          title="History unavailable"
          body="Past jobs could not be loaded. Please check your network and try again."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => query.refetch()}
              className="cursor-pointer bg-paper border border-line/60"
            >
              <RefreshCw className="size-3.5 mr-1.5" /> Retry
            </Button>
          }
        />
      )}

      {/* 4. Empty State */}
      {!query.isLoading && !query.isError && workOrders.length === 0 && (
        <EmptyState
          title="No history yet"
          body={
            searchTerm
              ? `No completed jobs matched "${searchTerm}".`
              : "Completed and verified field operations will collect here once officially resolved."
          }
          action={
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="cursor-pointer bg-paper border border-line/60"
            >
              <Link href="/technician/work-orders">Go to Active Work Orders</Link>
            </Button>
          }
        />
      )}

      {/* 5. History Cards List */}
      {!query.isLoading && !query.isError && workOrders.length > 0 && (
        <div className="flex flex-col gap-3.5">
          {workOrders.map((wo) => {
            const resolution = wo.resolution;
            const latestFeedback = resolution?.feedbacks?.[0];

            return (
              <article
                key={wo.id}
                className="group flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 rounded-xl border border-line/70 bg-paper p-5 sm:p-6 hover:border-line hover:shadow-xs transition-all shadow-2xs"
              >
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={wo.status} />
                    {wo.civicIssue?.issueNumber && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs bg-field/70 text-ink border border-line/50 font-medium">
                        #{wo.civicIssue.issueNumber}
                      </span>
                    )}
                    {wo.civicIssue?.category?.name && (
                      <span className="text-[11px] font-mono text-ink/50">
                        · {wo.civicIssue.category.name}
                      </span>
                    )}
                    {wo.completedAt && (
                      <span className="text-[10px] font-mono text-ink/40 flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-signal-resolved" />
                        Closed {formatDistanceToNow(new Date(wo.completedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/technician/work-orders/${wo.id}`}
                    className="font-display text-base font-semibold text-ink hover:underline cursor-pointer truncate"
                  >
                    {wo.title}
                  </Link>

                  {wo.civicIssue?.location?.address && (
                    <p className="text-xs text-ink/60 flex items-center gap-1.5 truncate font-body">
                      <MapPin className="size-3.5 text-ink/40 shrink-0" />
                      {wo.civicIssue.location.address}
                    </p>
                  )}

                  {/* Resolution Proof Summary */}
                  {resolution?.summary && (
                    <div className="mt-1 p-3 rounded-lg bg-field/30 border border-line/40 text-xs font-body text-ink/80 leading-relaxed">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40 block mb-0.5 font-medium">
                        Resolution Note:
                      </span>
                      {resolution.summary}
                    </div>
                  )}

                  {/* Citizen Feedback Rating */}
                  {latestFeedback && (
                    <div className="flex min-w-0 max-w-full items-center gap-2 text-xs text-ink/75 mt-1 bg-field/20 px-3 py-1.5 rounded-lg border border-line/30 w-fit">
                      <div className="flex shrink-0 items-center text-signal-in-progress">
                        <Star className="size-3.5 fill-current" />
                        <span className="font-mono font-semibold ml-1">
                          {latestFeedback.rating}/5
                        </span>
                      </div>
                      {latestFeedback.comment && (
                        <span className="italic text-ink/60 truncate font-body min-w-0">
                          "{latestFeedback.comment}"
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Action */}
                <div className="shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                    className="h-8.5 text-xs bg-paper border border-line/60 cursor-pointer flex items-center gap-1.5 hover:text-ink"
                  >
                    <Link href={`/technician/work-orders/${wo.id}`}>
                      Full Report <ExternalLink className="size-3" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 6. Standardized Pagination Toolbar */}
      {!query.isLoading && !query.isError && total > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-line/40 text-xs font-mono text-ink/60">
          <div>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} record
            {total === 1 ? "" : "s"}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 p-0 border border-line/40 cursor-pointer disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 p-0 border border-line/40 cursor-pointer disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
