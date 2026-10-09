"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  MapPin,
  Paperclip,
  Play,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ResolutionUpdateForm } from "@/components/forms/ResolutionUpdateForm";
import { WorkUpdateForm } from "@/components/forms/WorkUpdateForm";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RejectAssignmentDialog } from "@/components/work-orders/RejectAssignmentDialog";
import { WorkOrderStatusLedger } from "@/components/work-orders/WorkOrderStatusLedger";
import {
  useAcceptWorkOrder,
  useRejectAssignment,
  useStartWorkOrder,
  useUpdateWorkOrderStatus,
  useWorkOrderById,
  useWorkOrderUpdates,
} from "@/hooks/work-order.hook";

const TECHNICIAN_STATUSES = ["IN_PROGRESS", "ON_HOLD"];

interface TechnicianWorkOrderDetailClientProps {
  id: string;
}

export function TechnicianWorkOrderDetailClient({ id }: TechnicianWorkOrderDetailClientProps) {
  const router = useRouter();
  const { data: workOrderData, isLoading: isLoadingWO, isError: isErrorWO } = useWorkOrderById(id);
  const { data: updatesData, isLoading: isLoadingUpdates } = useWorkOrderUpdates(id);

  const updateStatus = useUpdateWorkOrderStatus();
  const acceptOrder = useAcceptWorkOrder();
  const rejectOrder = useRejectAssignment();
  const startOrder = useStartWorkOrder();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  if (isLoadingWO || isLoadingUpdates) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
        <div className="h-8 w-8 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-4" />
        <span className="tracking-wide text-sm">Loading details...</span>
      </div>
    );
  }

  if (isErrorWO || !workOrderData?.data) {
    return (
      <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
          <span className="text-signal-open text-xl font-display">!</span>
        </div>
        <p className="text-signal-open font-medium text-lg">Work order not found</p>
        <Link
          href="/technician/queue"
          className="text-ledger underline text-sm hover:text-ledger/80 cursor-pointer"
        >
          Return to Queue
        </Link>
      </div>
    );
  }

  const workOrder = workOrderData.data;
  const updates = updatesData?.data || [];
  const priorityObj = workOrder.priority || workOrder.civicIssue?.priority;
  const priority =
    typeof priorityObj === "object" && priorityObj !== null
      ? priorityObj?.code || priorityObj?.name || "Normal"
      : priorityObj || "Normal";
  const normalizedPriority = typeof priority === "string" ? priority.toUpperCase() : "";

  const isCompleted =
    workOrder.status === "RESOLVED" ||
    workOrder.status === "CLOSED" ||
    workOrder.status === "PENDING_VERIFICATION";

  // Check assignment status
  const currentAssignment = workOrder.assignments?.[0];
  const assignmentId = currentAssignment?.id || workOrder.assignmentId;
  const isPendingAssignment = currentAssignment?.status === "PENDING";

  const handleAcceptAssignment = () => {
    if (!assignmentId) return;
    acceptOrder.mutate(
      { id: assignmentId },
      {
        onSuccess: () => {
          toast.success("Assignment accepted successfully");
        },
        onError: () => {
          toast.error("Failed to accept assignment");
        },
      },
    );
  };

  const handleConfirmReject = (reason: string) => {
    if (!assignmentId) return;
    rejectOrder.mutate(
      { id: assignmentId, reason },
      {
        onSuccess: () => {
          toast.success("Assignment rejected. Dispatch notified.");
          setRejectDialogOpen(false);
          router.push("/technician/queue");
        },
        onError: () => {
          toast.error("Failed to reject assignment");
        },
      },
    );
  };

  const handleStartWork = () => {
    startOrder.mutate(
      { id: workOrder.id },
      {
        onSuccess: () => {
          toast.success("Work started! Status changed to In Progress");
        },
        onError: () => {
          toast.error("Failed to start work order");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-slide-up motion-reduce:animate-none pb-24">
      {/* Header - Minimal Chrome */}
      <div className="flex flex-col gap-4">
        <Link
          href="/technician/queue"
          className="flex items-center text-sm font-medium text-ink/50 hover:text-ink transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Queue
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold text-ink">
              {workOrder.id.split("-")[0].toUpperCase()}
            </h1>
            <Badge
              variant={
                normalizedPriority === "HIGH" ||
                normalizedPriority === "URGENT" ||
                normalizedPriority === "CRITICAL"
                  ? "destructive"
                  : "secondary"
              }
              className="text-xs uppercase tracking-wider"
            >
              {priority}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Start Work Action Button */}
            {!isCompleted &&
              !isPendingAssignment &&
              (workOrder.status === "ASSIGNED" || workOrder.status === "SCHEDULED") && (
                <Button
                  onClick={handleStartWork}
                  disabled={startOrder.isPending}
                  className="cursor-pointer bg-signal-progress hover:bg-signal-progress/90 text-paper font-display text-xs uppercase tracking-wider h-8 px-3 flex items-center gap-1.5 shadow-xs"
                >
                  {startOrder.isPending ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                  Start Work
                </Button>
              )}

            {/* Status Pill & Dropdown */}
            {!isCompleted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ledger"
                  >
                    <StatusPill status={workOrder.status} />
                    <div className="h-6 w-6 rounded-full bg-field/50 border border-line/20 flex items-center justify-center text-ink/50 group-hover:bg-field group-hover:text-ink transition-colors cursor-pointer">
                      {updateStatus.isPending ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-paper border-line text-ink">
                  {TECHNICIAN_STATUSES.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      disabled={workOrder.status === s || updateStatus.isPending}
                      className="cursor-pointer"
                      onClick={() => {
                        updateStatus.mutate(
                          { id, payload: { status: s } },
                          {
                            onSuccess: () =>
                              toast.success(`Status updated to ${s.replace(/_/g, " ")}`),
                            onError: () => toast.error("Failed to update status"),
                          },
                        );
                      }}
                    >
                      Mark as {s.replace(/_/g, " ")}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <StatusPill status={workOrder.status} />
            )}
          </div>
        </div>
        <h2 className="font-display text-xl text-ink/90">{workOrder.title}</h2>
      </div>

      {/* Assignment Pending Action Banner */}
      {isPendingAssignment && (
        <div className="p-4 rounded-lg bg-signal-open/10 border border-signal-open/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-signal-open shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-ink">Action Required: New Assignment</p>
              <p className="text-xs text-ink/70">
                You have been dispatched to this work order. Accept to confirm your availability, or
                reject to reassign.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleAcceptAssignment}
              disabled={acceptOrder.isPending}
              className="h-8 px-4 font-display font-medium text-xs bg-ledger hover:bg-ledger/90 text-paper cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {acceptOrder.isPending ? "Accepting..." : "Accept Work Order"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRejectDialogOpen(true)}
              disabled={rejectOrder.isPending}
              className="h-8 px-3 font-display font-medium text-xs border border-signal-open/40 text-signal-open hover:bg-signal-open/10 hover:border-signal-open cursor-pointer"
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Location */}
      {workOrder.civicIssue?.location && (
        <div className="bg-field/30 p-4 rounded-lg border border-line/20 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-ink/50 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-ink">{workOrder.civicIssue.location.address}</p>
            <p className="text-sm text-ink/60">
              {workOrder.civicIssue.location.ward} / {workOrder.civicIssue.location.zone}
            </p>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-paper p-6 rounded-lg border border-line">
        <h3 className="font-display font-medium text-ink mb-2">Instructions / Description</h3>
        <p className="text-ink/80 whitespace-pre-wrap">{workOrder.description}</p>

        {workOrder.civicIssue?.attachments?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-line/20">
            <div className="flex items-center gap-2 text-sm font-medium text-ink/70 mb-3">
              <Paperclip className="h-4 w-4" />
              Reference Photos ({workOrder.civicIssue.attachments.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {workOrder.civicIssue.attachments.map((_att: any, i: number) => (
                <div
                  key={i}
                  className="h-20 w-20 rounded-md bg-field/50 border border-line/30 flex items-center justify-center text-xs text-ink/40"
                >
                  Photo {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions / Ledger Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col: Ledger */}
        <div className="w-full md:w-1/2">
          <h3 className="font-display font-medium text-lg text-ink mb-4">Activity</h3>
          <WorkOrderStatusLedger createdAt={workOrder.createdAt} updates={updates} />
        </div>

        {/* Right Col: Forms */}
        {!isCompleted && (
          <div className="w-full md:w-1/2 flex flex-col gap-8">
            <div>
              <h3 className="font-display font-medium text-lg text-ink mb-4">Post an Update</h3>
              <WorkUpdateForm workOrderId={workOrder.id} />
            </div>

            <div className="pt-8 border-t border-line/20">
              <ResolutionUpdateForm workOrderId={workOrder.id} />
            </div>
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      <RejectAssignmentDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        workOrderTitle={workOrder.title}
        onConfirm={handleConfirmReject}
        isPending={rejectOrder.isPending}
      />
    </div>
  );
}
