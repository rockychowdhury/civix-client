"use client";

import { ArrowLeft, Check, MapPin, NotebookPen, Play } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { QuickUpdateSheet } from "@/components/modules/technician/QuickUpdateSheet";
import { ResolutionPanel } from "@/components/modules/technician/ResolutionPanel";
import { UpdatesTimeline } from "@/components/modules/technician/UpdatesTimeline";
import { WorkflowStepper } from "@/components/modules/technician/WorkflowStepper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RejectAssignmentDialog } from "@/components/work-orders/RejectAssignmentDialog";
import { TECH_DONE_WO_STATUSES } from "@/constant/technician.constant";
import {
  useAcceptWorkOrder,
  useRejectAssignment,
  useSubmitWorkUpdate,
  useWorkOrderById,
} from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import type { WorkOrder } from "@/types";

function priorityLabel(workOrder: WorkOrder): string {
  const p: unknown = workOrder.priority ?? workOrder.civicIssue?.priority;
  if (typeof p === "string") return p;
  if (p && typeof p === "object") {
    const obj = p as { code?: string; name?: string };
    return obj.code || obj.name || "Normal";
  }
  return "Normal";
}

const DONE = new Set<string>([...TECH_DONE_WO_STATUSES]);

/**
 * Stage 3 of the field workflow: one job, fully executable —
 * accept → arrive → log → resolve, with verification states narrated.
 * Editorial layout: the title carries the page, one isolated action per
 * stage, hairlines and whitespace do the grouping — no boxed cards.
 */
export function WorkExecutionView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const query = useWorkOrderById(id);
  const acceptMutation = useAcceptWorkOrder();
  const rejectMutation = useRejectAssignment();
  const arriveMutation = useSubmitWorkUpdate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-5" role="status" aria-label="Loading job">
        <Skeleton className="h-4 w-40 bg-field" />
        <Skeleton className="h-10 w-3/4 bg-field" />
        <Skeleton className="h-6 w-full bg-field/60" />
        <Skeleton className="h-48 w-full bg-field/50" />
      </div>
    );
  }

  // NOTE: useWorkOrderById resolves to the work order itself
  // (getWorkOrderById already unwraps the response envelope).
  if (query.isError || query.data == null) {
    return (
      <EmptyState
        title="Job not found"
        body="This work order could not be loaded. It may have been reassigned."
        action={
          <Button type="button" size="sm" asChild className="cursor-pointer">
            <Link href="/technician/queue">Back to My Work</Link>
          </Button>
        }
      />
    );
  }

  const workOrder = query.data as WorkOrder;
  const status = (workOrder.status || "ASSIGNED").toUpperCase();
  const pendingAssignment = workOrder.assignments?.find((a) => a.status === "PENDING");
  const activeAssignment =
    pendingAssignment ??
    workOrder.assignments?.find((a) => a.status === "ACCEPTED") ??
    workOrder.assignments?.[0];
  const updates = workOrder.updates ?? [];
  const priority = priorityLabel(workOrder);
  const hot =
    priority.toUpperCase() === "HIGH" ||
    priority.toUpperCase() === "URGENT" ||
    priority.toUpperCase() === "CRITICAL";
  const done = DONE.has(status);
  const cancelled = status === "CANCELLED";
  const address = (workOrder.civicIssue?.location as { address?: string } | undefined)?.address;
  const arrived = status !== "ASSIGNED" && status !== "ACCEPTED";

  return (
    <div className="flex max-w-3xl flex-col gap-8 pb-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/technician/queue"
          className="flex w-fit cursor-pointer items-center gap-1.5 font-body text-sm text-ink/55 transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          My Work
        </Link>
        <p className="font-mono text-xs uppercase tracking-widest text-ink/45">
          {workOrder.id.split("-")[0].toUpperCase()}
          {workOrder.scheduledAt
            ? ` · Due ${new Date(workOrder.scheduledAt).toLocaleDateString()}`
            : ""}
        </p>
        <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-ink md:text-4xl">
          {workOrder.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line/30 py-3">
          <StatusPill status={status} />
          <span
            className={cn(
              "font-mono text-[0.6875rem] uppercase tracking-widest",
              hot ? "text-signal-open" : "text-ink/50",
            )}
          >
            {priority} priority
          </span>
          {address ? (
            <span className="flex min-w-0 items-center gap-1.5 font-body text-sm text-ink/60">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{address}</span>
            </span>
          ) : null}
        </div>
      </div>

      <WorkflowStepper status={status} />

      {pendingAssignment ? (
        <div className="flex flex-col gap-4 border-l-2 border-signal-open py-1 pl-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md font-body text-sm leading-relaxed text-ink/80">
            Dispatch is waiting — accept to take this job, or reject it back to the queue.
          </p>
          <div className="flex min-h-11 shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              disabled={acceptMutation.isPending}
              onClick={() =>
                acceptMutation.mutate(
                  { id: pendingAssignment.id },
                  {
                    onSuccess: () => toast.success("Job accepted — you're on it"),
                    onError: () => toast.error("Failed to accept job"),
                  },
                )
              }
              className="min-h-11 cursor-pointer px-6"
            >
              <Check className="size-4" aria-hidden="true" />
              Accept
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRejectOpen(true)}
              className="min-h-11 cursor-pointer text-signal-open hover:text-signal-open"
            >
              Reject
            </Button>
          </div>
        </div>
      ) : !done && !cancelled && !arrived ? (
        <div className="py-1">
          <Button
            type="button"
            size="lg"
            disabled={arriveMutation.isPending}
            loading={arriveMutation.isPending}
            loadingText="Logging arrival…"
            onClick={() =>
              arriveMutation.mutate(
                { id: workOrder.id, payload: { updateType: "ON_SITE" } },
                {
                  onSuccess: () => toast.success("On site — clock started"),
                  onError: () => toast.error("Failed to log arrival"),
                },
              )
            }
            className="min-h-12 w-full cursor-pointer sm:w-auto sm:px-10"
          >
            <Play className="size-4 fill-current" aria-hidden="true" />
            Arrive on site
          </Button>
        </div>
      ) : !done && !cancelled ? (
        <div className="py-1">
          <Button
            type="button"
            size="lg"
            onClick={() => setLogOpen(true)}
            className="min-h-12 w-full cursor-pointer sm:w-auto sm:px-10"
          >
            <NotebookPen className="size-4" aria-hidden="true" />
            Log update
          </Button>
        </div>
      ) : null}

      {status === "PENDING_VERIFICATION" ? (
        <p className="border-l-2 border-signal-progress py-1 pl-5 font-body text-sm leading-relaxed text-ink/75">
          Resolution submitted — dispatch is verifying. You&apos;ll be notified if it bounces back.
        </p>
      ) : null}
      {status === "RESOLVED" || status === "CLOSED" ? (
        <p className="border-l-2 border-signal-resolved py-1 pl-5 font-body text-sm leading-relaxed text-ink/75">
          Job closed — nice work. It now lives in your history.
        </p>
      ) : null}
      {cancelled ? (
        <p className="border-l-2 border-line py-1 pl-5 font-body text-sm text-ink/65">
          This job was cancelled by dispatch.
        </p>
      ) : null}

      <section aria-label="Instructions" className="flex flex-col gap-2">
        <h2 className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/45">
          Instructions
        </h2>
        <p className="max-w-2xl font-body text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-ink/85">
          {workOrder.description}
        </p>
      </section>

      <section aria-label="Site log" className="flex flex-col gap-4">
        <h2 className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/45">
          Site log · {updates.length}
        </h2>
        <UpdatesTimeline updates={updates} />
      </section>

      {!done && !cancelled ? (
        <section aria-label="Resolution" className="flex flex-col gap-3">
          <h2 className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/45">
            Resolution
          </h2>
          <ResolutionPanel workOrderId={workOrder.id} resolution={workOrder.resolution} />
        </section>
      ) : null}

      <RejectAssignmentDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        workOrderTitle={workOrder.title}
        onConfirm={(reason) => {
          if (!activeAssignment) return;
          rejectMutation.mutate(
            { id: activeAssignment.id, reason },
            {
              onSuccess: () => {
                toast.success("Rejected — dispatch notified");
                router.push("/technician/inbox");
              },
              onError: () => toast.error("Failed to reject assignment"),
            },
          );
        }}
        isPending={rejectMutation.isPending}
      />

      <QuickUpdateSheet
        workOrderId={workOrder.id}
        jobTitle={workOrder.title}
        open={logOpen}
        onOpenChange={setLogOpen}
      />
    </div>
  );
}
