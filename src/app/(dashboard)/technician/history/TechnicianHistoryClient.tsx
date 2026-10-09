"use client";

import { useRouter } from "next/navigation";
import { WorkOrdersTable } from "@/components/tables/WorkOrdersTable";
import { useMyQueue } from "@/hooks/work-order.hook";

export function TechnicianHistoryClient() {
  const router = useRouter();

  const { data: queueData, isLoading, isError, refetch } = useMyQueue({ filter: "history" });
  const assignments = queueData?.data || [];
  const rawWorkOrders = assignments.map((a: any) => ({
    ...(a.workOrder || {}),
    assignmentId: a.id,
    assignmentStatus: a.status,
  }));
  const workOrders =
    rawWorkOrders.length > 0
      ? rawWorkOrders.some((wo: any) => wo.status === "RESOLVED" || wo.status === "CLOSED")
        ? rawWorkOrders.filter((wo: any) => wo.status === "RESOLVED" || wo.status === "CLOSED")
        : rawWorkOrders
      : [];

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Completed Work</h1>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
          <div className="h-8 w-8 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-4" />
          <span className="tracking-wide text-sm">Loading history...</span>
        </div>
      ) : isError ? (
        <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
            <span className="text-signal-open text-xl font-display">!</span>
          </div>
          <p className="text-signal-open font-medium text-lg">Unable to load history</p>
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
          currentTab="completed" // Reuse the completed tab configuration
          onRowClick={(workOrder) => {
            router.push(`/technician/work-orders/${workOrder.id}`);
          }}
        />
      )}
    </div>
  );
}
