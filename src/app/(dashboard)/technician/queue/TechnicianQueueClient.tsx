"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { WorkOrdersTable } from "@/components/tables/WorkOrdersTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RejectAssignmentDialog } from "@/components/work-orders/RejectAssignmentDialog";
import {
  useAcceptWorkOrder,
  useMyQueue,
  useRejectAssignment,
  useStartWorkOrder,
} from "@/hooks/work-order.hook";
import type { WorkOrder } from "@/types";

export function TechnicianQueueClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get("filter") || "today";

  const { data: queueData, isLoading, isError, refetch } = useMyQueue({ filter: currentFilter });
  const assignments = queueData?.data || [];
  const workOrders: WorkOrder[] = assignments.map((a: any) => ({
    ...(a.workOrder || {}),
    assignmentId: a.id,
    assignmentStatus: a.status,
  }));

  const { mutate: acceptOrder, isPending: isAccepting } = useAcceptWorkOrder();
  const { mutate: rejectOrder, isPending: isRejecting } = useRejectAssignment();
  const { mutate: startOrder, isPending: isStarting } = useStartWorkOrder();

  const [rejectDialogState, setRejectDialogState] = useState<{
    open: boolean;
    assignmentId: string;
    workOrderTitle: string;
  }>({
    open: false,
    assignmentId: "",
    workOrderTitle: "",
  });

  const handleFilterChange = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", newFilter);
    router.push(`?${params.toString()}`);
  };

  const handleAccept = (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    acceptOrder(
      { id: assignmentId },
      {
        onSuccess: () => {
          toast.success("Work order assignment accepted");
        },
        onError: () => {
          toast.error("Failed to accept work order");
        },
      },
    );
  };

  const handleOpenReject = (assignmentId: string, workOrder: WorkOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setRejectDialogState({
      open: true,
      assignmentId,
      workOrderTitle: workOrder.title || `WO-${workOrder.id?.slice(0, 8)}`,
    });
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectDialogState.assignmentId) return;

    rejectOrder(
      { id: rejectDialogState.assignmentId, reason },
      {
        onSuccess: () => {
          toast.success("Assignment rejected. Dispatch notified.");
          setRejectDialogState({ open: false, assignmentId: "", workOrderTitle: "" });
        },
        onError: () => {
          toast.error("Failed to reject assignment");
        },
      },
    );
  };

  const handleStart = (workOrderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startOrder(
      { id: workOrderId },
      {
        onSuccess: () => {
          toast.success("Work started! Status marked as In Progress");
        },
        onError: () => {
          toast.error("Failed to start work order");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up motion-reduce:animate-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My Queue</h1>
          <p className="text-xs text-ink/60 mt-0.5">
            Accept assignments, initiate site work, and log progress updates.
          </p>
        </div>
        <Tabs value={currentFilter} onValueChange={handleFilterChange}>
          <TabsList className="bg-field/50 border border-line/20 p-1">
            <TabsTrigger
              value="today"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              Today
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              This Week
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              All Upcoming
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
          <div className="h-8 w-8 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-4" />
          <span className="tracking-wide text-sm">Loading your assignments...</span>
        </div>
      ) : isError ? (
        <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
            <span className="text-signal-open text-xl font-display">!</span>
          </div>
          <p className="text-signal-open font-medium text-lg">Unable to load queue</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-ledger underline text-sm hover:text-ledger/80 cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : (
        <WorkOrdersTable
          data={workOrders}
          currentTab="technician-queue"
          onRowClick={(workOrder) => {
            router.push(`/technician/work-orders/${workOrder.id}`);
          }}
          onAccept={handleAccept}
          isAccepting={isAccepting}
          onReject={handleOpenReject}
          isRejecting={isRejecting}
          onStart={handleStart}
          isStarting={isStarting}
        />
      )}

      <RejectAssignmentDialog
        open={rejectDialogState.open}
        onOpenChange={(open) => setRejectDialogState((prev) => ({ ...prev, open }))}
        workOrderTitle={rejectDialogState.workOrderTitle}
        onConfirm={handleConfirmReject}
        isPending={isRejecting}
      />
    </div>
  );
}
