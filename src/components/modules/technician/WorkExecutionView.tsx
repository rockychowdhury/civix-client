"use client";

import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  ImageIcon,
  MapPin,
  NotebookPen,
  Play,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { SLACountdown } from "@/components/layout/dashboard/SLACountdown";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { QuickUpdateSheet } from "@/components/modules/technician/QuickUpdateSheet";
import { ResolutionPanel } from "@/components/modules/technician/ResolutionPanel";
import { UpdatesTimeline } from "@/components/modules/technician/UpdatesTimeline";
import { WorkflowStepper } from "@/components/modules/technician/WorkflowStepper";
import { Badge } from "@/components/ui/badge";
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

  // Calculate SLA time remaining if resolution deadline exists
  const deadline = workOrder.civicIssue?.resolutionDeadlineAt;
  const minutesLeft = deadline
    ? Math.round((new Date(deadline).getTime() - Date.now()) / (1000 * 60))
    : null;

  return (
    <div className="flex max-w-3xl flex-col gap-8 pb-12 animate-slide-up motion-reduce:animate-none">
      <div className="flex flex-col gap-3">
        <Link
          href="/technician/queue"
          className="flex w-fit cursor-pointer items-center gap-1.5 font-body text-sm text-ink/55 transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          My Work
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-ink/45">
            {workOrder.id.split("-")[0].toUpperCase()}
          </span>
          {workOrder.civicIssue?.issueNumber ? (
            <Badge variant="outline" className="font-mono text-[11px] text-ink/65 gap-1">
              <Tag className="size-3" aria-hidden="true" />
              {workOrder.civicIssue.issueNumber}
            </Badge>
          ) : null}
          {workOrder.department?.name ? (
            <Badge variant="secondary" className="font-body text-[11px] gap-1 bg-field/60">
              <Building2 className="size-3 text-ink/50" aria-hidden="true" />
              {workOrder.department.name}
            </Badge>
          ) : null}
          {workOrder.scheduledAt ? (
            <span className="font-mono text-xs text-ink/50">
              · Due {new Date(workOrder.scheduledAt).toLocaleDateString()}
            </span>
          ) : null}
        </div>
        <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-ink md:text-4xl">
          {workOrder.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line/30 py-3">
          <StatusPill status={status} />
          <span
            className={cn(
              "font-mono text-[0.6875rem] uppercase tracking-widest",
              hot ? "text-signal-open font-semibold" : "text-ink/50",
            )}
          >
            {priority} priority
          </span>
          {minutesLeft !== null && !done && (
            <SLACountdown minutesLeft={minutesLeft} label="SLA remaining" />
          )}
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
        <div className="flex flex-col gap-4 border-l-2 border-signal-open py-2 pl-5 sm:flex-row sm:items-center sm:justify-between bg-signal-open/5 p-4 rounded-xs">
          <p className="max-w-md font-body text-sm leading-relaxed text-ink/80">
            Dispatch is waiting — accept to take this job, or reject it back to the queue.
          </p>
          <div className="flex min-h-11 shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              disabled={acceptMutation.isPending}
              loading={acceptMutation.isPending}
              loadingText="Accepting…"
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
        <div className="flex flex-wrap items-center gap-3 py-1">
          <Button
            type="button"
            size="lg"
            onClick={() => setLogOpen(true)}
            className="min-h-12 w-full cursor-pointer sm:w-auto sm:px-10"
          >
            <NotebookPen className="size-4" aria-hidden="true" />
            Log update
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => {
              const el = document.getElementById("resolution-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="min-h-12 w-full cursor-pointer sm:w-auto px-6 border-line/40 text-ink/80 hover:text-ink"
          >
            Ready to resolve
          </Button>
        </div>
      ) : null}

      {status === "PENDING_VERIFICATION" ? (
        <div className="flex items-start gap-3 border-l-2 border-signal-progress bg-signal-progress/5 p-4 rounded-xs">
          <Clock className="size-5 shrink-0 text-signal-progress mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-display text-sm font-semibold text-ink">
              Pending Resolution Verification
            </p>
            <p className="font-body text-sm leading-relaxed text-ink/75">
              Your resolution request was submitted and is now awaiting verification from department
              dispatch. You will be notified once it is approved.
            </p>
          </div>
        </div>
      ) : null}

      {status === "RESOLVED" || status === "CLOSED" ? (
        <div className="flex items-start gap-3 border-l-2 border-signal-resolved bg-signal-resolved/5 p-4 rounded-xs">
          <CheckCircle2
            className="size-5 shrink-0 text-signal-resolved mt-0.5"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <p className="font-display text-sm font-semibold text-ink">Work Order Completed</p>
            <p className="font-body text-sm leading-relaxed text-ink/75">
              Resolution has been verified and this work order is closed.
            </p>
          </div>
        </div>
      ) : null}

      {cancelled ? (
        <p className="border-l-2 border-line py-1 pl-5 font-body text-sm text-ink/65">
          This job was cancelled by dispatch.
        </p>
      ) : null}

      <section aria-label="Instructions" className="flex flex-col gap-2">
        <h2 className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/45">
          Instructions & Work Scope
        </h2>
        <div className="rounded-xs border border-line/30 bg-field/20 p-4 text-ink/85 font-body text-[0.9375rem] leading-relaxed whitespace-pre-wrap">
          {workOrder.description || "No specific instructions provided by dispatch."}
        </div>
      </section>

      {/* Reported issue context & photos */}
      {workOrder.civicIssue?.attachments && workOrder.civicIssue.attachments.length > 0 ? (
        <section aria-label="Reported photos" className="flex flex-col gap-3">
          <h2 className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/45 flex items-center gap-1.5">
            <ImageIcon className="size-3.5" aria-hidden="true" />
            Reported Issue Photos ({workOrder.civicIssue.attachments.length})
          </h2>
          <div className="flex flex-wrap gap-3">
            {workOrder.civicIssue.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block size-24 overflow-hidden rounded-xs border border-line/40 bg-field/40 cursor-pointer shadow-xs"
              >
                <Image
                  src={att.url}
                  alt="Civic issue evidence"
                  fill
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/0 flex items-center justify-center opacity-0 transition-opacity group-hover:bg-ink/30 group-hover:opacity-100">
                  <ExternalLink className="size-4 text-paper" aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="Site log" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/45">
            Site Log · {updates.length}
          </h2>
          {!done && !cancelled && arrived ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLogOpen(true)}
              className="text-xs text-ink/70 hover:text-ink cursor-pointer h-8"
            >
              <NotebookPen className="size-3.5 mr-1" aria-hidden="true" />
              Add update
            </Button>
          ) : null}
        </div>
        <UpdatesTimeline updates={updates} />
      </section>

      {!cancelled && (!done || workOrder.resolution != null) ? (
        <section
          id="resolution-section"
          aria-label="Resolution"
          className="flex flex-col gap-3 border-t border-line/30 pt-6"
        >
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
