"use client";

import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  ImageIcon,
  Mail,
  MapPin,
  NotebookPen,
  Pause,
  Phone,
  Play,
  Square,
  Tag,
  User,
  Users,
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
  useQuickActionWorkOrder,
  useRejectAssignment,
  useSubmitWorkUpdate,
  useUpdateWorkOrderTask,
  useWorkOrderById,
} from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import type { WorkOrder, WorkOrderTask } from "@/types";

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
 * accept → arrive → task checklist → log → resolve, with verification states narrated.
 */
export function WorkExecutionView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const query = useWorkOrderById(id);
  const acceptMutation = useAcceptWorkOrder();
  const rejectMutation = useRejectAssignment();
  const arriveMutation = useSubmitWorkUpdate();
  const updateTaskMutation = useUpdateWorkOrderTask();
  const quickActionMutation = useQuickActionWorkOrder();
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
      <div className="w-full max-w-5xl mx-auto">
        <EmptyState
          title="Job not found"
          body="This work order could not be loaded. It may have been reassigned."
          action={
            <Button
              type="button"
              size="sm"
              asChild
              className="cursor-pointer bg-paper border border-line/60"
            >
              <Link href="/technician/work-orders">Back to Work Orders</Link>
            </Button>
          }
        />
      </div>
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
  const tasks = workOrder.tasks ?? [];
  const citizen = workOrder.civicIssue?.citizen ?? workOrder.civicIssue?.reportedBy;
  const team = workOrder.assignments?.find((a) => a.team)?.team;
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
    <div className="flex max-w-5xl w-full mx-auto flex-col gap-6 sm:gap-8 pb-16 animate-slide-up motion-reduce:animate-none">
      {/* Back Link */}
      <Link
        href="/technician/work-orders"
        className="flex w-fit cursor-pointer items-center gap-1.5 font-body text-xs text-ink/60 transition-colors hover:text-ink active:translate-y-px"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to Work Orders
      </Link>

      {/* Main Job Header Card */}
      <div className="rounded-xl border border-line/70 bg-paper p-6 sm:p-8 shadow-2xs flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-ink/45">
            {workOrder.id.split("-")[0].toUpperCase()}
          </span>
          {workOrder.civicIssue?.issueNumber ? (
            <Badge
              variant="outline"
              className="font-mono text-[11px] text-ink/65 gap-1 border-line/60"
            >
              <Tag className="size-3" aria-hidden="true" />#{workOrder.civicIssue.issueNumber}
            </Badge>
          ) : null}
          {workOrder.department?.name ? (
            <Badge
              variant="secondary"
              className="font-body text-[11px] gap-1 bg-field/60 text-ink/70"
            >
              <Building2 className="size-3 text-ledger" aria-hidden="true" />
              {workOrder.department.name}
            </Badge>
          ) : null}
          {workOrder.scheduledAt ? (
            <span className="font-mono text-xs text-ink/50">
              · Due {new Date(workOrder.scheduledAt).toLocaleDateString()}
            </span>
          ) : null}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight font-semibold tracking-tight text-ink break-words">
          {workOrder.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line/40 pt-4 mt-1">
          <StatusPill status={status} />
          <span
            className={cn(
              "font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-xs border",
              hot
                ? "text-signal-open font-semibold bg-signal-open/10 border-signal-open/30"
                : "text-ink/60 bg-field/40 border-line/40",
            )}
          >
            {priority} priority
          </span>
          {minutesLeft !== null && !done && (
            <SLACountdown minutesLeft={minutesLeft} label="SLA remaining" />
          )}
          {address ? (
            <span className="flex min-w-0 items-center gap-1.5 font-body text-xs text-ink/65">
              <MapPin className="size-3.5 shrink-0 text-ink/40" aria-hidden="true" />
              <span className="truncate">{address}</span>
            </span>
          ) : null}
        </div>
      </div>

      <WorkflowStepper status={status} />

      {pendingAssignment ? (
        <div className="flex flex-col gap-4 border-l-4 border-signal-open p-5 sm:flex-row sm:items-center sm:justify-between bg-signal-open/5 rounded-xl border border-line/60 shadow-2xs">
          <div className="space-y-0.5">
            <h3 className="font-display text-sm font-semibold text-ink">
              New Dispatch Waiting for Response
            </h3>
            <p className="max-w-md font-body text-xs leading-relaxed text-ink/75">
              Dispatch is waiting — accept to take this job, or decline it back to the triage queue.
            </p>
          </div>
          <div className="flex min-h-10 shrink-0 gap-2">
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
              className="cursor-pointer px-5 bg-ledger text-paper hover:bg-ledger/90 text-xs font-medium"
            >
              <Check className="size-3.5 mr-1" aria-hidden="true" />
              Accept
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRejectOpen(true)}
              className="cursor-pointer text-xs text-signal-open hover:text-signal-open hover:bg-signal-open/10"
            >
              Decline
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
            className="w-full sm:w-auto sm:px-8 cursor-pointer bg-ledger text-paper hover:bg-ledger/90 shadow-2xs text-sm font-medium"
          >
            <Play className="size-4 fill-current mr-2" aria-hidden="true" />
            Arrive on site
          </Button>
        </div>
      ) : !done && !cancelled ? (
        <div className="flex flex-wrap items-center gap-3 py-1">
          {status === "IN_PROGRESS" ? (
            <Button
              type="button"
              variant="secondary"
              size="default"
              disabled={quickActionMutation.isPending}
              loading={quickActionMutation.isPending}
              onClick={() =>
                quickActionMutation.mutate({
                  id: workOrder.id,
                  payload: { action: "PAUSE", reason: "Field operation paused by technician" },
                })
              }
              className="w-full sm:w-auto px-5 border-signal-blocked/40 text-signal-blocked hover:bg-signal-blocked/10 cursor-pointer text-xs font-medium"
            >
              <Pause className="size-4 mr-2" aria-hidden="true" />
              Pause Work
            </Button>
          ) : status === "ON_HOLD" || status === "PAUSED" ? (
            <Button
              type="button"
              size="default"
              disabled={quickActionMutation.isPending}
              loading={quickActionMutation.isPending}
              onClick={() =>
                quickActionMutation.mutate({
                  id: workOrder.id,
                  payload: { action: "RESUME" },
                })
              }
              className="w-full sm:w-auto px-5 bg-ledger text-paper hover:bg-ledger/90 cursor-pointer text-xs font-medium"
            >
              <Play className="size-4 mr-2 fill-current" aria-hidden="true" />
              Resume Work
            </Button>
          ) : (
            <Button
              type="button"
              size="default"
              disabled={quickActionMutation.isPending}
              loading={quickActionMutation.isPending}
              onClick={() =>
                quickActionMutation.mutate({
                  id: workOrder.id,
                  payload: { action: "START" },
                })
              }
              className="w-full sm:w-auto px-5 bg-ledger text-paper hover:bg-ledger/90 cursor-pointer text-xs font-medium"
            >
              <Play className="size-4 mr-2 fill-current" aria-hidden="true" />
              Start Work
            </Button>
          )}

          <Button
            type="button"
            size="default"
            onClick={() => setLogOpen(true)}
            className="w-full sm:w-auto sm:px-6 cursor-pointer bg-paper border border-line/60 text-ink hover:bg-field/40 shadow-2xs text-xs font-medium"
          >
            <NotebookPen className="size-4 mr-2" aria-hidden="true" />
            Log update
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={() => {
              const el = document.getElementById("resolution-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-5 border-line/60 bg-paper text-ink hover:text-ink cursor-pointer text-xs font-medium"
          >
            Ready to resolve
          </Button>
        </div>
      ) : null}

      {status === "PENDING_VERIFICATION" ? (
        <div className="flex items-start gap-3.5 border-l-4 border-signal-in-progress bg-signal-in-progress/5 p-5 rounded-xl border border-line/60 shadow-2xs">
          <Clock className="size-5 shrink-0 text-signal-in-progress mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-display text-sm font-semibold text-ink">
              Pending Resolution Verification
            </p>
            <p className="font-body text-xs leading-relaxed text-ink/75">
              Your resolution request was submitted and is now awaiting verification from department
              dispatch. You will be notified once it is approved.
            </p>
          </div>
        </div>
      ) : null}

      {status === "RESOLVED" || status === "CLOSED" ? (
        <div className="flex items-start gap-3.5 border-l-4 border-signal-resolved bg-signal-resolved/5 p-5 rounded-xl border border-line/60 shadow-2xs">
          <CheckCircle2
            className="size-5 shrink-0 text-signal-resolved mt-0.5"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <p className="font-display text-sm font-semibold text-ink">Work Order Completed</p>
            <p className="font-body text-xs leading-relaxed text-ink/75">
              Resolution has been verified and this work order is officially closed.
            </p>
          </div>
        </div>
      ) : null}

      {cancelled ? (
        <p className="border-l-4 border-line/50 p-4 rounded-xl bg-field/30 font-body text-xs text-ink/65">
          This job was cancelled by dispatch.
        </p>
      ) : null}

      {/* Citizen Contact & Field Team Info Card */}
      {citizen || team || workOrder.department ? (
        <section
          aria-label="Contact & Team Details"
          className="rounded-xl border border-line/70 bg-paper p-6 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {citizen ? (
            <div className="flex flex-col gap-2">
              <h2 className="font-mono text-xs uppercase tracking-wider text-ink/50 font-semibold flex items-center gap-1.5">
                <User className="size-3.5 text-ledger" aria-hidden="true" />
                Citizen Reporter Contact
              </h2>
              <div className="rounded-lg border border-line/40 bg-field/20 p-3.5 flex flex-col gap-2">
                <p className="font-display text-sm font-semibold text-ink">
                  {[citizen.firstName, citizen.lastName].filter(Boolean).join(" ") ||
                    "Citizen Reporter"}
                </p>
                {citizen.phone ? (
                  <a
                    href={`tel:${citizen.phone}`}
                    className="flex items-center gap-2 text-xs text-ink/75 hover:text-ledger transition-colors cursor-pointer"
                  >
                    <Phone className="size-3.5 text-ink/50" aria-hidden="true" />
                    <span>{citizen.phone}</span>
                  </a>
                ) : null}
                {citizen.email ? (
                  <a
                    href={`mailto:${citizen.email}`}
                    className="flex items-center gap-2 text-xs text-ink/75 hover:text-ledger transition-colors cursor-pointer"
                  >
                    <Mail className="size-3.5 text-ink/50" aria-hidden="true" />
                    <span className="truncate">{citizen.email}</span>
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {team || workOrder.department ? (
            <div className="flex flex-col gap-2">
              <h2 className="font-mono text-xs uppercase tracking-wider text-ink/50 font-semibold flex items-center gap-1.5">
                <Users className="size-3.5 text-ledger" aria-hidden="true" />
                Dispatched Team & Unit
              </h2>
              <div className="rounded-lg border border-line/40 bg-field/20 p-3.5 flex flex-col gap-2">
                <p className="font-display text-sm font-semibold text-ink">
                  {team?.name || workOrder.department?.name || "Field Unit"}
                </p>
                {team?.code ? (
                  <p className="font-mono text-xs text-ink/60">Unit Code: {team.code}</p>
                ) : null}
                {workOrder.department?.name ? (
                  <p className="font-body text-xs text-ink/65 flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-ink/40" aria-hidden="true" />
                    {workOrder.department.name}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Field Checklist & Tasks Card */}
      <section
        aria-label="Tasks and Checklist"
        className="rounded-xl border border-line/70 bg-paper p-6 shadow-2xs flex flex-col gap-4"
      >
        <div className="flex items-center justify-between border-b border-line/40 pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-4 text-ledger" aria-hidden="true" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-ink/50 font-semibold">
              Field Checklist & Tasks
            </h2>
          </div>
          {tasks.length > 0 ? (
            <Badge variant="outline" className="font-mono text-xs border-line/60 text-ink/70">
              {tasks.filter((t) => t.isCompleted).length} / {tasks.length} Completed
            </Badge>
          ) : null}
        </div>

        {tasks.length === 0 ? (
          <p className="font-body text-xs text-ink/60 py-2">
            No itemized checklist assigned for this order. Complete the work according to
            instructions and log updates.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tasks.map((task: WorkOrderTask) => (
              <button
                key={task.id}
                type="button"
                disabled={done || cancelled || updateTaskMutation.isPending}
                onClick={() =>
                  updateTaskMutation.mutate({
                    workOrderId: workOrder.id,
                    taskId: task.id,
                    payload: { isCompleted: !task.isCompleted },
                  })
                }
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors cursor-pointer",
                  task.isCompleted
                    ? "bg-field/40 border-line/40 text-ink/60 line-through"
                    : "bg-paper border-line/60 text-ink hover:bg-field/20",
                  (done || cancelled) && "cursor-default opacity-80",
                )}
              >
                {task.isCompleted ? (
                  <CheckSquare
                    className="size-4 text-signal-resolved mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <Square className="size-4 text-ink/40 mt-0.5 shrink-0" aria-hidden="true" />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-display text-sm font-medium">{task.title}</span>
                  {task.description ? (
                    <span className="font-body text-xs text-ink/65 no-underline">
                      {task.description}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Instructions Card */}
      <section
        aria-label="Instructions"
        className="rounded-xl border border-line/70 bg-paper p-6 shadow-2xs flex flex-col gap-3"
      >
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink/50 font-semibold">
          Instructions & Work Scope
        </h2>
        <div className="rounded-lg border border-line/40 bg-field/20 p-4 text-ink/85 font-body text-sm leading-relaxed whitespace-pre-wrap">
          {workOrder.description || "No specific instructions provided by dispatch."}
        </div>
      </section>

      {/* Reported issue context & photos Card */}
      {workOrder.civicIssue?.attachments && workOrder.civicIssue.attachments.length > 0 ? (
        <section
          aria-label="Reported photos"
          className="rounded-xl border border-line/70 bg-paper p-6 shadow-2xs flex flex-col gap-3.5"
        >
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink/50 font-semibold flex items-center gap-1.5">
            <ImageIcon className="size-4 text-ink/40" aria-hidden="true" />
            Reported Issue Photos ({workOrder.civicIssue.attachments.length})
          </h2>
          <div className="flex flex-wrap gap-3">
            {workOrder.civicIssue.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block size-24 overflow-hidden rounded-lg border border-line/50 bg-field/40 cursor-pointer shadow-xs"
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

      {/* Site Log Card */}
      <section
        aria-label="Site log"
        className="rounded-xl border border-line/70 bg-paper p-6 shadow-2xs flex flex-col gap-4"
      >
        <div className="flex items-center justify-between border-b border-line/40 pb-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink/50 font-semibold">
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

      {/* Resolution Panel Card */}
      {!cancelled && (!done || workOrder.resolution != null) ? (
        <section
          id="resolution-section"
          aria-label="Resolution"
          className="rounded-xl border border-line/70 bg-paper p-6 shadow-2xs flex flex-col gap-4"
        >
          <div className="border-b border-line/40 pb-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-ink/50 font-semibold">
              Resolution
            </h2>
          </div>
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
