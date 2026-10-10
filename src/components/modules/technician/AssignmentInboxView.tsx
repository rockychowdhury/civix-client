"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RejectAssignmentDialog } from "@/components/work-orders/RejectAssignmentDialog";
import { useAcceptWorkOrder, useMyQueue, useRejectAssignment } from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import type { Assignment, WorkOrder } from "@/types";

function siteAddress(wo?: WorkOrder | null): string | undefined {
  const location = (wo as { civicIssue?: { location?: { address?: string } } } | null)?.civicIssue
    ?.location;
  return location?.address;
}

function AssignmentCard({
  assignment,
  onAccept,
  onReject,
  accepting,
}: {
  assignment: Assignment;
  onAccept: (assignment: Assignment) => void;
  onReject: (assignment: Assignment) => void;
  accepting: boolean;
}) {
  const wo = assignment.workOrder;
  const rawTitle = wo?.title || "Untitled Job";
  // Strip duplicate trailing "(ISS-...)" if issue number is already shown in badge
  const cleanTitle = rawTitle.replace(/\s*\([A-Z0-9-]+\)$/i, "").trim() || rawTitle;
  const address = siteAddress(wo);
  const category = wo?.civicIssue?.category?.name;
  const issueNumber = wo?.civicIssue?.issueNumber;
  const teamName = assignment.team?.name;

  const priority =
    typeof wo?.priority === "object"
      ? (wo.priority as { name?: string; code?: string }).name ||
        (wo.priority as { name?: string; code?: string }).code
      : wo?.priority;

  const isUrgent =
    priority?.toUpperCase() === "HIGH" ||
    priority?.toUpperCase() === "URGENT" ||
    priority?.toUpperCase() === "CRITICAL";

  const assignedDate = assignment.assignedAt || assignment.createdAt;
  let timeAgo = "";
  if (assignedDate) {
    try {
      timeAgo = formatDistanceToNow(new Date(assignedDate), { addSuffix: true });
    } catch {
      timeAgo = "";
    }
  }

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-line/70 bg-paper p-5 transition-all hover:border-line hover:shadow-xs shadow-2xs">
      <div className="flex flex-col gap-3">
        {/* Header: Issue #, Priority & Dispatched Time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {issueNumber ? (
              <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-xs bg-field/70 text-ink/85 border border-line/50">
                #{issueNumber}
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

          {timeAgo ? (
            <span
              className="flex items-center gap-1 font-mono text-[11px] text-ink/45 shrink-0"
              title={assignedDate}
            >
              <Clock className="size-3 text-ink/35" aria-hidden="true" />
              {timeAgo}
            </span>
          ) : null}
        </div>

        {/* Title & Category */}
        <div className="space-y-1">
          <Link
            href={wo?.id ? `/technician/work-orders/${wo.id}` : "#"}
            className="cursor-pointer font-display text-base font-semibold leading-snug text-ink hover:text-ledger transition-colors line-clamp-2"
          >
            {cleanTitle}
          </Link>
          {category ? (
            <p className="font-body text-xs text-ink/50 tracking-normal">{category}</p>
          ) : null}
        </div>

        {/* Essential Location & Team Data */}
        <div className="space-y-1.5 pt-2 border-t border-line/40 text-xs font-body">
          {address ? (
            <p className="flex items-start gap-1.5 text-ink/70">
              <MapPin className="size-3.5 text-ink/40 mt-0.5 shrink-0" aria-hidden="true" />
              <span className="line-clamp-2 leading-relaxed">{address}</span>
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-ink/40 text-xs italic">
              <MapPin className="size-3.5 opacity-40 shrink-0" aria-hidden="true" />
              <span>Location not specified</span>
            </p>
          )}

          {teamName ? (
            <p className="flex items-center gap-1.5 text-ink/60 text-[11px]">
              <Users className="size-3 text-ink/40 shrink-0" aria-hidden="true" />
              <span>Team: {teamName}</span>
            </p>
          ) : null}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-line/40 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={accepting}
          onClick={() => onAccept(assignment)}
          className="flex-1 h-9 text-xs bg-ledger text-paper hover:bg-ledger/90 cursor-pointer font-medium shadow-2xs active:translate-y-px"
        >
          <Check className="size-3.5 mr-1.5" aria-hidden="true" />
          {accepting ? "Accepting..." : "Accept Job"}
        </Button>

        {assignment.workOrderId ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            asChild
            className="h-9 px-3 text-xs cursor-pointer bg-paper border border-line/60 hover:bg-field/40 text-ink/80"
            title="View job details"
          >
            <Link href={`/technician/work-orders/${assignment.workOrderId}`}>
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onReject(assignment)}
          className="h-9 px-3 text-xs cursor-pointer text-ink/50 hover:text-signal-open hover:bg-signal-open/10 transition-colors"
          title="Decline dispatch"
        >
          Decline
        </Button>
      </div>
    </article>
  );
}

export function AssignmentInboxView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [rejecting, setRejecting] = useState<Assignment | null>(null);

  const query = useMyQueue({
    status: "PENDING",
    searchTerm: debouncedSearch.trim() || undefined,
    page,
    limit,
  });
  const acceptMutation = useAcceptWorkOrder();
  const rejectMutation = useRejectAssignment();

  const handleAccept = (assignment: Assignment) => {
    acceptMutation.mutate(
      { id: assignment.id },
      {
        onSuccess: () => {
          toast.success("Job accepted — assigned to your active queue");
          if (assignment.workOrderId) {
            router.push(`/technician/work-orders/${assignment.workOrderId}`);
          }
        },
        onError: () => toast.error("Failed to accept job"),
      },
    );
  };

  const rows = (query.data?.data ?? []) as Assignment[];
  const meta = query.data?.meta;
  const total = meta?.total ?? rows.length;
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
            <span className="font-mono text-xs text-ink/60">Assignments Inbox</span>
            {!query.isLoading && (
              <Badge
                variant="secondary"
                className="bg-ink/5 text-ink/70 border-line/40 font-mono text-xs px-2 py-0.5 ml-1"
              >
                {total} pending
              </Badge>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Assignments Inbox
          </h1>
          <p className="font-body text-xs sm:text-sm text-ink/65 max-w-2xl">
            Incoming field dispatches — accept to take a job and start your shift, or decline to
            return it to dispatch triage.
          </p>
        </div>

        {/* Right Header Toolbar: Search + Sync */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40 pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search pending dispatches..."
              className="h-9 pl-9 pr-7 text-xs bg-paper border-line/60 rounded-md focus-visible:ring-1 focus-visible:ring-ledger font-body text-ink"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
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
            title="Refresh inbox"
          >
            <RefreshCw className={cn("size-3.5 mr-1.5", query.isFetching && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* 2. Loading State */}
      {query.isLoading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          role="status"
          aria-label="Loading inbox"
        >
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div
              key={id}
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

      {/* 3. Error State */}
      {query.isError && (
        <EmptyState
          title="Inbox unavailable"
          body="New assignments could not be loaded. Check your connection and try again."
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
      {!query.isLoading && !query.isError && rows.length === 0 && (
        <EmptyState
          title="All caught up"
          body="No pending assignments waiting. Newly routed work will land here for your review."
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

      {/* 5. Assignment Cards Grid */}
      {!query.isLoading && !query.isError && rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              accepting={acceptMutation.isPending}
              onAccept={handleAccept}
              onReject={setRejecting}
            />
          ))}
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

      <RejectAssignmentDialog
        open={rejecting !== null}
        onOpenChange={(open) => {
          if (!open) setRejecting(null);
        }}
        workOrderTitle={rejecting?.workOrder?.title}
        onConfirm={(reason) => {
          if (!rejecting) return;
          rejectMutation.mutate(
            { id: rejecting.id, reason },
            {
              onSuccess: () => {
                toast.success("Declined — dispatch notified");
                setRejecting(null);
              },
              onError: () => toast.error("Failed to decline assignment"),
            },
          );
        }}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
}
