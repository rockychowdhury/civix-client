"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Clock,
  ExternalLink,
  HardHat,
  Loader2,
  MapPin,
  ShieldCheck,
  Tag,
  User,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  useWorkOrderById,
  useWorkOrderResolutions,
  useWorkOrderUpdates,
} from "@/hooks/work-order.hook";
import { AssignTechnicianSelect } from "./AssignTechnicianSelect";
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
  const { data: workOrder, isLoading } = useWorkOrderById(isOpen ? workOrderId : undefined);
  const { data: updates, isLoading: isUpdatesLoading } = useWorkOrderUpdates(
    isOpen ? workOrderId : undefined,
  );
  const { data: resolutionsData } = useWorkOrderResolutions(
    isOpen && workOrderId ? workOrderId : undefined,
  );

  const [isAssigning, setIsAssigning] = useState(false);

  const resolution =
    workOrder?.resolution ||
    (Array.isArray(workOrder?.resolutions) ? workOrder?.resolutions[0] : workOrder?.resolutions) ||
    (Array.isArray(resolutionsData)
      ? resolutionsData[0]
      : resolutionsData?.data?.[0] || resolutionsData?.data || resolutionsData);

  const issue = workOrder?.civicIssue;
  const location = issue?.location;
  const department = workOrder?.department;
  const assignee = workOrder?.currentAssignee;
  const assignments = workOrder?.assignments || [];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-paper border-l border-line p-0 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-ink/40">
            <Loader2 className="h-8 w-8 animate-spin text-ledger" />
            <span className="text-xs font-mono">Retrieving work order dossier...</span>
          </div>
        ) : workOrder ? (
          <>
            {/* Header */}
            <SheetHeader className="p-6 border-b border-line/40 bg-field/30">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono text-xs text-ink/80 bg-paper">
                    WO-{workOrder.id.slice(0, 8).toUpperCase()}
                  </Badge>

                  {/* Priority Badge */}
                  {(() => {
                    const priorityObj = workOrder.priority || issue?.priority;
                    const priority =
                      typeof priorityObj === "object"
                        ? priorityObj?.code || priorityObj?.name || "Normal"
                        : priorityObj || "Normal";
                    const normalized = typeof priority === "string" ? priority.toUpperCase() : "";

                    return (
                      <Badge
                        variant={
                          normalized === "HIGH" ||
                          normalized === "URGENT" ||
                          normalized === "CRITICAL"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {priority}
                      </Badge>
                    );
                  })()}

                  {/* Status Badge */}
                  <Badge
                    variant="default"
                    className="bg-ledger text-paper text-[10px] uppercase tracking-wider"
                  >
                    {workOrder.status.replace(/_/g, " ")}
                  </Badge>

                  {department && (
                    <span className="text-xs font-mono text-ink/60 bg-ink/5 px-2 py-0.5 rounded-xs">
                      {department.code || department.name}
                    </span>
                  )}
                </div>

                <SheetTitle className="font-display text-xl text-ink leading-tight pt-0.5">
                  {workOrder.title}
                </SheetTitle>

                {/* Issue Reference & Location Context */}
                {issue && (
                  <div className="flex items-center gap-3 text-xs text-ink/70 flex-wrap pt-0.5">
                    <Link
                      href={`/track?issueNumber=${issue.issueNumber}`}
                      className="flex items-center gap-1 font-mono text-ledger hover:underline cursor-pointer"
                    >
                      <Tag className="size-3 text-ledger" />
                      #{issue.issueNumber}
                      <ExternalLink className="size-2.5 ml-0.5 opacity-60" />
                    </Link>

                    {location?.address && (
                      <span className="flex items-center gap-1 text-ink/60">
                        <MapPin className="size-3 text-ink/40 shrink-0" />
                        {location.address}
                        {location.landmark ? ` (${location.landmark})` : ""}
                        {location.postalCode ? ` · ${location.postalCode}` : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </SheetHeader>

            {/* Content Dossier */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              {/* Instructions Section */}
              <section className="space-y-2">
                <h3 className="font-display font-medium text-base text-ink">
                  Instructions & Field Brief
                </h3>
                <div className="bg-field/20 border border-line/30 rounded-md p-4 text-xs text-ink/80 whitespace-pre-wrap font-body leading-relaxed">
                  {workOrder.description || "Standard operating procedure applies."}
                </div>
              </section>

              {/* Assignment & Crew Dispatching Section */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-medium text-base text-ink">
                    Crew Assignment
                  </h3>
                  {!assignee && !isAssigning && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAssigning(true)}
                      className="cursor-pointer text-xs h-7 px-3 bg-ledger text-paper hover:bg-ledger/90"
                    >
                      Assign Crew
                    </Button>
                  )}
                </div>

                {isAssigning ? (
                  <div className="p-4 rounded-lg border border-line/50 bg-field/20 space-y-3">
                    <p className="text-xs text-ink/70 font-medium">
                      Select technician or maintenance team:
                    </p>
                    <AssignTechnicianSelect
                      workOrder={workOrder}
                      onCancel={() => setIsAssigning(false)}
                    />
                  </div>
                ) : assignee ? (
                  <div className="p-4 rounded-lg border border-line/40 bg-paper flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-ledger font-mono text-xs font-semibold text-paper">
                        {assignee.firstName?.[0]}
                        {assignee.lastName?.[0]}
                      </span>
                      <div>
                        <p className="font-medium text-ink text-sm">
                          {assignee.firstName} {assignee.lastName}
                        </p>
                        <p className="text-xs text-ink/50 font-mono">
                          {assignee.employeeId ? `ID: ${assignee.employeeId}` : "Technician"}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAssigning(true)}
                      className="cursor-pointer text-xs h-7 px-2.5 bg-paper border border-line/40 text-ink/70 hover:text-ink"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="p-4.5 rounded-lg border border-signal-open/30 bg-signal-open/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-signal-open font-medium">
                      <HardHat className="size-4 shrink-0" />
                      <span>Pending Crew Assignment — Not yet dispatched</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAssigning(true)}
                      className="cursor-pointer text-xs h-7 px-3 bg-ledger text-paper hover:bg-ledger/90 shrink-0"
                    >
                      Assign Now
                    </Button>
                  </div>
                )}
              </section>

              {/* Lifecycle Milestones */}
              <section className="space-y-3">
                <h3 className="font-display font-medium text-base text-ink">
                  Lifecycle Milestones
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-md bg-paper border border-line/40 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-ink/50">Created</span>
                    <p className="text-xs font-medium text-ink font-mono">
                      {workOrder.createdAt
                        ? format(new Date(workOrder.createdAt), "MMM d, yyyy")
                        : "N/A"}
                    </p>
                    <span className="text-[10px] font-mono text-ink/40">
                      {workOrder.createdAt
                        ? format(new Date(workOrder.createdAt), "h:mm a")
                        : ""}
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-paper border border-line/40 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-ink/50">Scheduled</span>
                    <p className="text-xs font-medium text-ink font-mono">
                      {workOrder.scheduledAt
                        ? format(new Date(workOrder.scheduledAt), "MMM d, yyyy")
                        : "Not set"}
                    </p>
                    <span className="text-[10px] font-mono text-ink/40">
                      {workOrder.scheduledAt ? "Target date" : "On-demand"}
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-paper border border-line/40 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-ink/50">Started</span>
                    <p className="text-xs font-medium text-ink font-mono">
                      {workOrder.startedAt
                        ? format(new Date(workOrder.startedAt), "MMM d, yyyy")
                        : "Pending"}
                    </p>
                    <span className="text-[10px] font-mono text-ink/40">
                      {workOrder.startedAt ? "On-site" : "Not commenced"}
                    </span>
                  </div>

                  <div className="p-3 rounded-md bg-paper border border-line/40 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-ink/50">Completed</span>
                    <p className="text-xs font-medium text-ink font-mono">
                      {workOrder.completedAt
                        ? format(new Date(workOrder.completedAt), "MMM d, yyyy")
                        : "Pending"}
                    </p>
                    <span className="text-[10px] font-mono text-ink/40">
                      {workOrder.completedAt ? "Finished" : "In progress"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Assignment Record Log (if assignments exist) */}
              {assignments.length > 0 && (
                <section className="space-y-3">
                  <h3 className="font-display font-medium text-base text-ink">
                    Dispatch Log ({assignments.length})
                  </h3>
                  <div className="divide-y divide-line/40 rounded-lg border border-line/40 bg-paper overflow-hidden">
                    {assignments.map((asg: any) => (
                      <div key={asg.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-medium text-ink">
                            {asg.assignedTo
                              ? `${asg.assignedTo.firstName} ${asg.assignedTo.lastName}`
                              : asg.team
                                ? asg.team.name
                                : "Assigned"}
                          </p>
                          {asg.notes && <p className="text-[11px] text-ink/60">{asg.notes}</p>}
                        </div>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] uppercase border-line/40"
                        >
                          {asg.status?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Resolution & Verification Section */}
              {(resolution || workOrder.status === "PENDING_VERIFICATION") && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-ledger" />
                    <h3 className="font-display font-medium text-base text-ink">
                      Resolution Verification
                    </h3>
                  </div>
                  <ResolutionVerificationCard
                    resolutionId={resolution?.id}
                    initialResolution={resolution}
                    workOrderStatus={workOrder.status}
                  />
                </section>
              )}

              {/* Updates & Activity Ledger */}
              <section className="space-y-3">
                <h3 className="font-display font-medium text-base text-ink">
                  Activity Timeline
                </h3>
                {isUpdatesLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-ink/40" />
                  </div>
                ) : (
                  <WorkOrderStatusLedger
                    updates={workOrder.updates || updates || []}
                    createdAt={workOrder.createdAt}
                  />
                )}
              </section>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-ink/40 text-4xl font-display">!</span>
            <p className="text-ink/60 text-sm">Work order record not found.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
