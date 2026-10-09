"use client";

import { useSearchParams } from "next/navigation";
import { useWorkOrderById, useWorkOrderUpdates } from "@/hooks/work-order.hook";
import { Loader2, MoveLeft, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function WorkOrderHistoryClient() {
  const searchParams = useSearchParams();
  const workOrderId = searchParams.get("workOrderId") || "";

  const { data: workOrder, isLoading: isOrderLoading, isError } = useWorkOrderById(workOrderId);
  const { data: updates, isLoading: isUpdatesLoading } = useWorkOrderUpdates(workOrderId);

  if (!workOrderId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">
          No Work Order Selected
        </h1>
        <p className="text-ink/60 mb-6">Please provide a work order ID to view its history.</p>
        <Link href="/department/work-orders" className="text-ledger hover:underline">
          Return to Work Orders Queue
        </Link>
      </div>
    );
  }

  if (isOrderLoading || isUpdatesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-ink/40" />
      </div>
    );
  }

  if (isError || !workOrder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">Work Order Not Found</h1>
        <p className="text-ink/60 mb-6">
          We couldn't load the history for this work order. It may not exist.
        </p>
        <Link href="/department/work-orders" className="text-ledger hover:underline">
          Return to Work Orders Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-paper flex flex-col md:flex-row">
      {/* Left panel: Info */}
      <div className="w-full md:w-1/3 lg:w-2/5 border-b md:border-b-0 md:border-r border-line/20 p-6 md:p-10 flex flex-col gap-8 bg-field/30">
        <div>
          <Link
            href="/department/work-orders"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-ink/60 hover:text-ink transition-colors mb-8 cursor-pointer"
          >
            <MoveLeft size={16} />
            Back to Queue
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="font-mono text-sm text-ink/70 bg-paper">
              {workOrder.id.split("-")[0].toUpperCase()}
            </Badge>
            {(() => {
              const priorityObj = workOrder.priority || workOrder.civicIssue?.priority;
              const priority =
                typeof priorityObj === "object"
                  ? priorityObj?.code || priorityObj?.name || "Normal"
                  : priorityObj || "Normal";
              const normalizedPriority = typeof priority === "string" ? priority.toUpperCase() : "";
              return (
                <Badge
                  variant={
                    normalizedPriority === "HIGH" ||
                    normalizedPriority === "URGENT" ||
                    normalizedPriority === "CRITICAL"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {priority}
                </Badge>
              );
            })()}
            <Badge variant="default" className="bg-ledger text-paper">
              {workOrder.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <h1 className="font-display text-3xl font-semibold text-ink leading-tight mb-4">
            {workOrder.title}
          </h1>

          {workOrder.civicIssue && (
            <div className="flex flex-col gap-3 mt-6 bg-paper p-4 rounded-md border border-line/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Attached Issue
              </span>
              <div className="flex items-center gap-4 text-sm text-ink/80">
                <Link
                  href={`/track?issueNumber=${workOrder.civicIssue.issueNumber}`}
                  className="flex items-center gap-1.5 font-mono hover:text-ledger cursor-pointer"
                >
                  <Tag className="h-4 w-4" />
                  {workOrder.civicIssue.issueNumber}
                </Link>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {workOrder.civicIssue.location?.address}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <h3 className="font-display font-medium text-lg text-ink mb-3">Current Assignment</h3>
          <div className="bg-paper border border-line/20 rounded-md p-4">
            {workOrder.currentAssignee ? (
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-ledger font-mono text-sm font-medium text-paper">
                  {workOrder.currentAssignee.firstName?.[0]}
                  {workOrder.currentAssignee.lastName?.[0]}
                </span>
                <div>
                  <p className="font-medium text-ink">
                    {workOrder.currentAssignee.firstName} {workOrder.currentAssignee.lastName}
                  </p>
                  <p className="text-xs text-ink/60">Technician</p>
                </div>
              </div>
            ) : (
              <span className="text-sm text-ink/50 italic">No technician assigned yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Ledger */}
      <div className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto">
        <h2 className="font-display text-2xl font-medium text-ink mb-8">Full Lifecycle History</h2>

        {updates?.length > 0 ? (
          <div className="max-w-2xl">
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-line/40 before:to-transparent">
              {updates.map((update: any, i: number) => (
                <div key={i} className="relative flex items-start group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-paper bg-ledger text-paper shrink-0 shadow-[0_0_0_4px_var(--color-paper)] mt-1 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-paper" />
                  </div>
                  <div className="ml-6 w-full p-5 rounded-lg border border-line/20 bg-paper shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-base font-semibold text-ink">
                        {update.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-mono text-ink/50">
                        {format(new Date(update.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    {update.notes ? (
                      <p className="text-sm text-ink/70 mt-3 whitespace-pre-wrap">{update.notes}</p>
                    ) : (
                      <p className="text-sm text-ink/40 mt-1 italic">Status updated.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-xl text-center py-12 border border-dashed border-line/30 rounded-xl bg-field/10">
            <p className="text-ink/50 italic">No history recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
