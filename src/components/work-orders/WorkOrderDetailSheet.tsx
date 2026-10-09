"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useWorkOrderById, useWorkOrderUpdates } from "@/hooks/work-order.hook";
import { Loader2, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResolutionVerificationCard } from "./ResolutionVerificationCard";
import { WorkOrderStatusLedger } from "./WorkOrderStatusLedger";

interface WorkOrderDetailSheetProps {
  workOrderId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkOrderDetailSheet({
  workOrderId,
  isOpen,
  onOpenChange,
}: WorkOrderDetailSheetProps) {
  const { data: workOrder, isLoading } = useWorkOrderById(workOrderId);
  const { data: updates, isLoading: isUpdatesLoading } = useWorkOrderUpdates(workOrderId);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-paper border-l border-line p-0 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-ink/40" />
          </div>
        ) : workOrder ? (
          <>
            <SheetHeader className="p-6 border-b border-line/40 bg-field/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="font-mono text-xs text-ink/70">
                      {workOrder.id.split("-")[0].toUpperCase()}
                    </Badge>
                    {(() => {
                      const priorityObj = workOrder.priority || workOrder.civicIssue?.priority;
                      const priority =
                        typeof priorityObj === "object"
                          ? priorityObj?.code || priorityObj?.name || "Normal"
                          : priorityObj || "Normal";
                      const normalizedPriority =
                        typeof priority === "string" ? priority.toUpperCase() : "";
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
                  <SheetTitle className="font-display text-xl text-ink leading-tight">
                    {workOrder.title}
                  </SheetTitle>

                  {workOrder.civicIssue && (
                    <div className="flex items-center gap-4 mt-3 text-sm text-ink/70">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Tag className="h-3.5 w-3.5" />
                        {workOrder.civicIssue.issueNumber}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {workOrder.civicIssue.location?.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Instructions Section */}
              <section>
                <h3 className="font-display font-medium text-lg text-ink mb-3">
                  Instructions & Context
                </h3>
                <div className="bg-field/20 border border-line/20 rounded-md p-4 text-sm text-ink/80 whitespace-pre-wrap font-body">
                  {workOrder.description}
                </div>
              </section>

              {/* Assignment Section */}
              <section>
                <h3 className="font-display font-medium text-lg text-ink mb-3">Assignment</h3>
                <div className="bg-field/20 border border-line/20 rounded-md p-4 flex items-center justify-between">
                  {workOrder.currentAssignee ? (
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-ledger font-mono text-xs font-medium text-paper">
                        {workOrder.currentAssignee.firstName?.[0]}
                        {workOrder.currentAssignee.lastName?.[0]}
                      </span>
                      <div>
                        <p className="font-medium text-ink text-sm">
                          {workOrder.currentAssignee.firstName} {workOrder.currentAssignee.lastName}
                        </p>
                        <p className="text-xs text-ink/60">Assigned Technician</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-ink/50 italic">No technician assigned yet.</span>
                  )}
                </div>
              </section>

              {/* Resolution & Verification Section */}
              {(workOrder.resolution || workOrder.status === "PENDING_VERIFICATION") && (
                <section>
                  <ResolutionVerificationCard
                    resolutionId={workOrder.resolution?.id}
                    initialResolution={workOrder.resolution}
                    workOrderStatus={workOrder.status}
                  />
                </section>
              )}

              {/* Ledger Section */}
              <section>
                <h3 className="font-display font-medium text-lg text-ink mb-4">Activity Ledger</h3>
                {isUpdatesLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-ink/40" />
                  </div>
                ) : (
                  <WorkOrderStatusLedger updates={updates || []} createdAt={workOrder.createdAt} />
                )}
              </section>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-ink/40 text-4xl">!</span>
            <p className="text-ink/60">Work order not found.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
