"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RejectAssignmentDialog } from "@/components/work-orders/RejectAssignmentDialog";
import { useAcceptWorkOrder, useMyQueue, useRejectAssignment } from "@/hooks/work-order.hook";
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
  return (
    <article className="flex flex-col gap-4 rounded-xs border border-line/40 bg-paper px-5 py-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status="PENDING" />
          {wo?.id ? (
            <span className="font-mono text-xs text-ink/50">
              {wo.id.split("-")[0].toUpperCase()}
            </span>
          ) : null}
          {wo?.civicIssue?.issueNumber ? (
            <span className="font-mono text-xs text-ink/45">#{wo.civicIssue.issueNumber}</span>
          ) : null}
          {wo?.priority ? (
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
              ·{" "}
              {typeof wo.priority === "object"
                ? (wo.priority as { name?: string; code?: string }).name ||
                  (wo.priority as { name?: string; code?: string }).code
                : wo.priority}
            </span>
          ) : null}
        </div>
        <Link
          href={wo?.id ? `/technician/work-orders/${wo.id}` : "#"}
          className="cursor-pointer font-display text-lg font-medium leading-snug text-ink underline-offset-4 hover:underline"
        >
          {wo?.title || "Untitled job"}
        </Link>
        {siteAddress(wo) ? (
          <p className="font-body text-sm text-ink/60">{siteAddress(wo)}</p>
        ) : null}
      </div>
      <div className="flex min-h-11 flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          size="sm"
          disabled={accepting}
          onClick={() => onAccept(assignment)}
          className="min-h-11 flex-1 cursor-pointer sm:flex-none sm:px-8"
        >
          Accept job
        </Button>
        {assignment.workOrderId ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            asChild
            className="min-h-11 flex-1 sm:flex-none"
          >
            <Link href={`/technician/work-orders/${assignment.workOrderId}`}>Details</Link>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onReject(assignment)}
          className="min-h-11 cursor-pointer text-signal-open hover:text-signal-open"
        >
          Reject
        </Button>
      </div>
    </article>
  );
}

/**
 * Stage 1 of the field workflow: new dispatches awaiting accept / reject.
 * One focal action per card (Accept); reject stays one tap away.
 */
export function AssignmentInboxView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [rejecting, setRejecting] = useState<Assignment | null>(null);

  const query = useMyQueue({
    status: "PENDING",
    searchTerm: debouncedSearch || undefined,
    limit: 50,
  });
  const acceptMutation = useAcceptWorkOrder();
  const rejectMutation = useRejectAssignment();

  const handleAccept = (assignment: Assignment) => {
    acceptMutation.mutate(
      { id: assignment.id },
      {
        onSuccess: () => {
          toast.success("Job accepted — you're on it");
          if (assignment.workOrderId) {
            router.push(`/technician/work-orders/${assignment.workOrderId}`);
          }
        },
        onError: () => toast.error("Failed to accept job"),
      },
    );
  };

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading inbox">
        <Skeleton className="h-28 w-full bg-field/60" />
        <Skeleton className="h-28 w-full bg-field/60" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <EmptyState
        title="Inbox unavailable"
        body="New assignments could not be loaded. Check your connection and try again."
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
          ? "Nothing waiting — dispatch will appear here."
          : `${total} job${total === 1 ? "" : "s"} waiting for your call.`}
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
          title="All caught up"
          body="No pending assignments. Accepted work lives under My Work."
        />
      ) : (
        <div className="flex flex-col gap-4">
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
                toast.success("Rejected — dispatch notified");
                setRejecting(null);
              },
              onError: () => toast.error("Failed to reject assignment"),
            },
          );
        }}
        isPending={rejectMutation.isPending}
      />
    </div>
  );
}
