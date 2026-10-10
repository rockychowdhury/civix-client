"use client";

import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  NotebookPen,
  Pause,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { QuickUpdateSheet } from "@/components/modules/technician/QuickUpdateSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMyWorkOrders, useQuickActionWorkOrder } from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import type { WorkOrder } from "@/types";

type StageKey = "active" | "pending" | "verification" | "completed";

const STAGE_CONFIG: Record<
  StageKey,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  active: {
    title: "Active Field Jobs",
    description: "Field work actively underway or assigned to you for ongoing remediation.",
    icon: Wrench,
  },
  pending: {
    title: "Pending Start Jobs",
    description: "Accepted work orders awaiting field departure or on-site arrival.",
    icon: Clock,
  },
  verification: {
    title: "Jobs Under Verification",
    description: "Completed work entries submitted for supervisor sign-off and quality review.",
    icon: ShieldCheck,
  },
  completed: {
    title: "Completed Work Orders",
    description: "Successfully resolved, verified, and officially closed work orders.",
    icon: CheckCircle2,
  },
};

export function MyWorkView() {
  const searchParams = useSearchParams();
  const rawStage = searchParams.get("stage") as StageKey;
  const stage: StageKey = ["active", "pending", "verification", "completed"].includes(rawStage)
    ? rawStage
    : "active";

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch] = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [loggingWorkOrder, setLoggingWorkOrder] = useState<WorkOrder | null>(null);

  // Reset page when stage changes via routes
  useEffect(() => {
    setPage(1);
  }, [stage]);

  const query = useMyWorkOrders({
    stage,
    searchTerm: debouncedSearch.trim() || undefined,
    page,
    limit,
  });

  const quickAction = useQuickActionWorkOrder();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleQuickAction = (id: string, action: "START" | "PAUSE" | "RESUME") => {
    quickAction.mutate({
      id,
      payload: { action },
    });
  };

  const workOrders = (query.data?.data || []) as WorkOrder[];
  const meta = query.data?.meta;
  const total = meta?.total ?? workOrders.length;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  const currentConfig = STAGE_CONFIG[stage] || STAGE_CONFIG.active;
  const StageIcon = currentConfig.icon;

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
            <span className="font-mono text-xs text-ink/60">Field Work Orders</span>
            {!query.isLoading && (
              <Badge
                variant="secondary"
                className="bg-ink/5 text-ink/70 border-line/40 font-mono text-xs px-2 py-0.5 ml-1"
              >
                {total} total
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <StageIcon className="size-6 text-ledger shrink-0" aria-hidden="true" />
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              {currentConfig.title}
            </h1>
          </div>
          <p className="font-body text-xs sm:text-sm text-ink/65 max-w-2xl">
            {currentConfig.description}
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
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, location..."
              className="h-9 pl-9 pr-7 text-xs bg-paper border-line/60 rounded-md focus-visible:ring-1 focus-visible:ring-ledger font-body text-ink"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
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
            title="Refresh list"
          >
            <RefreshCw className={cn("size-3.5 mr-1.5", query.isFetching && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* 3. Loading Skeleton */}
      {query.isLoading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          role="status"
          aria-label="Loading work orders"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-xl bg-field/30 border border-line/40 animate-pulse flex flex-col justify-between p-5"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-field/60 rounded" />
                  <div className="h-4 w-16 bg-field/40 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-field/70 rounded" />
                <div className="h-4 w-1/2 bg-field/40 rounded" />
                <div className="h-4 w-full bg-field/50 rounded mt-3" />
              </div>
              <div className="h-9 w-full bg-field/60 rounded mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* 4. Error State */}
      {query.isError && (
        <EmptyState
          title="Could not load work orders"
          body="There was an error connecting to the dispatch service. Please retry."
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

      {/* 5. Empty State */}
      {!query.isLoading && !query.isError && workOrders.length === 0 && (
        <EmptyState
          title={
            stage === "active"
              ? "No active work orders"
              : stage === "pending"
                ? "No pending jobs"
                : stage === "verification"
                  ? "No jobs under verification"
                  : "No completed jobs found"
          }
          body={
            searchTerm
              ? `No work orders matched "${searchTerm}". Try a different search.`
              : "Assignments dispatched to you will appear here once accepted."
          }
          action={
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="cursor-pointer bg-paper border border-line/60"
            >
              <Link href="/technician/inbox">Check Assignments Inbox</Link>
            </Button>
          }
        />
      )}

      {/* 6. Work Orders Cards Grid */}
      {!query.isLoading && !query.isError && workOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workOrders.map((wo) => {
            const statusUpper = (wo.status || "").toUpperCase();
            const isInProgress = statusUpper === "IN_PROGRESS";
            const isPaused = statusUpper === "ON_HOLD" || statusUpper === "PAUSED";
            const isCompleted = statusUpper === "RESOLVED" || statusUpper === "CLOSED";
            const isPendingVerif = statusUpper === "PENDING_VERIFICATION";

            const rawTitle = wo.title || "Untitled Job";
            const cleanTitle = rawTitle.replace(/\s*\([A-Z0-9-]+\)$/i, "").trim() || rawTitle;

            const priority =
              typeof wo.priority === "object"
                ? (wo.priority as { name?: string; code?: string }).name ||
                  (wo.priority as { name?: string; code?: string }).code
                : wo.priority;

            const isUrgent =
              priority?.toUpperCase() === "HIGH" ||
              priority?.toUpperCase() === "URGENT" ||
              priority?.toUpperCase() === "CRITICAL";

            const tasks = wo.tasks ?? [];
            const completedTasks = tasks.filter((t) => t.isCompleted).length;

            return (
              <article
                key={wo.id}
                className="group flex flex-col justify-between rounded-xl border border-line/70 bg-paper p-5 transition-all hover:border-line hover:shadow-xs shadow-2xs"
              >
                {/* Top Section: Badges & Metadata */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <StatusPill status={wo.status} />
                      {wo.civicIssue?.issueNumber ? (
                        <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-xs bg-field/70 text-ink/85 border border-line/50">
                          #{wo.civicIssue.issueNumber}
                        </span>
                      ) : null}
                      {priority ? (
                        <span
                          className={cn(
                            "font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-xs border font-medium",
                            isUrgent
                              ? "bg-signal-open/10 text-signal-open border-signal-open/30 font-semibold"
                              : "bg-field/50 text-ink/65 border-line/40",
                          )}
                        >
                          {priority}
                        </span>
                      ) : null}
                    </div>

                    {wo.scheduledAt ? (
                      <span className="flex items-center gap-1 font-mono text-[11px] text-ink/45 shrink-0">
                        <Calendar className="size-3 text-ink/35" />
                        Due {new Date(wo.scheduledAt).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>

                  {/* Title & Category */}
                  <div className="space-y-1">
                    <Link
                      href={`/technician/work-orders/${wo.id}`}
                      className="cursor-pointer font-display text-base font-semibold leading-snug text-ink hover:text-ledger transition-colors line-clamp-2"
                    >
                      {cleanTitle}
                    </Link>
                    {wo.civicIssue?.category?.name ? (
                      <p className="font-body text-xs text-ink/50 tracking-normal">
                        {wo.civicIssue.category.name}
                      </p>
                    ) : null}
                  </div>

                  {/* Location & Task Progress */}
                  <div className="space-y-1.5 pt-2 border-t border-line/40 text-xs font-body">
                    {wo.civicIssue?.location?.address ? (
                      <p className="flex items-start gap-1.5 text-ink/70">
                        <MapPin className="size-3.5 text-ink/40 mt-0.5 shrink-0" />
                        <span className="line-clamp-2 leading-relaxed">
                          {wo.civicIssue.location.address}
                        </span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 text-ink/40 text-xs italic">
                        <MapPin className="size-3.5 opacity-40 shrink-0" />
                        <span>Location not specified</span>
                      </p>
                    )}

                    {tasks.length > 0 ? (
                      <div className="flex items-center gap-1.5 text-ink/60 text-[11px] font-mono">
                        <CheckSquare className="size-3 text-ledger shrink-0" />
                        <span>
                          {completedTasks}/{tasks.length} tasks completed
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 mt-4 border-t border-line/40 flex items-center gap-2">
                  {!isCompleted && !isPendingVerif ? (
                    isInProgress ? (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={quickAction.isPending}
                          onClick={() => handleQuickAction(wo.id, "PAUSE")}
                          className="h-9 px-3 text-xs border border-signal-blocked/40 text-signal-blocked hover:bg-signal-blocked/10 cursor-pointer flex items-center gap-1.5"
                          title="Pause work"
                        >
                          <Pause className="size-3.5 fill-current" />
                          Pause
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setLoggingWorkOrder(wo)}
                          className="h-9 px-3 text-xs border border-line/60 bg-paper text-ink hover:bg-field/40 cursor-pointer flex items-center gap-1.5"
                          title="Log note"
                        >
                          <NotebookPen className="size-3.5 text-ink/60" />
                          Log Note
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          asChild
                          className="flex-1 h-9 text-xs bg-ledger text-paper hover:bg-ledger/90 cursor-pointer font-medium shadow-2xs"
                        >
                          <Link href={`/technician/work-orders/${wo.id}`}>Resolve</Link>
                        </Button>
                      </>
                    ) : isPaused ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          disabled={quickAction.isPending}
                          onClick={() => handleQuickAction(wo.id, "RESUME")}
                          className="flex-1 h-9 text-xs bg-ledger text-paper hover:bg-ledger/90 cursor-pointer flex items-center justify-center gap-1.5 font-medium shadow-2xs"
                        >
                          <Play className="size-3.5 fill-current" />
                          Resume
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setLoggingWorkOrder(wo)}
                          className="h-9 px-3 text-xs border border-line/60 bg-paper text-ink hover:bg-field/40 cursor-pointer"
                          title="Log note"
                        >
                          <NotebookPen className="size-3.5 text-ink/60" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          asChild
                          className="h-9 px-3 text-xs bg-paper border border-line/60 hover:bg-field/40 text-ink/80 cursor-pointer"
                          title="View details"
                        >
                          <Link href={`/technician/work-orders/${wo.id}`}>
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          disabled={quickAction.isPending}
                          onClick={() => handleQuickAction(wo.id, "START")}
                          className="flex-1 h-9 text-xs bg-ledger text-paper hover:bg-ledger/90 cursor-pointer flex items-center justify-center gap-1.5 font-medium shadow-2xs"
                        >
                          <Play className="size-3.5 fill-current" />
                          Start Work
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          asChild
                          className="h-9 px-3 text-xs bg-paper border border-line/60 hover:bg-field/40 text-ink/80 cursor-pointer"
                          title="View details"
                        >
                          <Link href={`/technician/work-orders/${wo.id}`}>
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                      </>
                    )
                  ) : isPendingVerif ? (
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-mono text-[11px] text-signal-in-progress flex items-center gap-1 font-medium">
                        <Clock className="size-3.5" /> Under Verification
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        asChild
                        className="h-9 px-3 text-xs bg-paper border border-line/60 hover:bg-field/40 text-ink/80 cursor-pointer"
                      >
                        <Link href={`/technician/work-orders/${wo.id}`}>
                          Review <ExternalLink className="size-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-mono text-[11px] text-signal-resolved flex items-center gap-1 font-medium">
                        <CheckCircle2 className="size-3.5" /> Resolved & Verified
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        asChild
                        className="h-9 px-3 text-xs bg-paper border border-line/60 hover:bg-field/40 text-ink/80 cursor-pointer"
                      >
                        <Link href={`/technician/work-orders/${wo.id}`}>
                          Report <ExternalLink className="size-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 7. Standardized Pagination Toolbar */}
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

      {/* Quick Update Slide-over Sheet */}
      {loggingWorkOrder && (
        <QuickUpdateSheet
          workOrderId={loggingWorkOrder.id}
          jobTitle={loggingWorkOrder.title}
          open={!!loggingWorkOrder}
          onOpenChange={(open) => {
            if (!open) setLoggingWorkOrder(null);
          }}
        />
      )}
    </div>
  );
}
