import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TechnicianSuggestionInline } from "@/components/work-orders/TechnicianSuggestionInline";
import type { WorkOrder } from "@/types";

export const columns: ColumnDef<WorkOrder, any>[] = [
  {
    id: "civicIssueNumber",
    header: "Civic Issue",
    cell: ({ row }: { row: any }) => {
      const issue = row.original.civicIssue;
      if (issue) {
        return (
          <Link
            href={`/track?issueNumber=${issue.issueNumber}`}
            className="font-mono text-sm hover:text-ledger transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {issue.issueNumber}
          </Link>
        );
      }
      return (
        <span className="font-mono text-sm text-ink/70">
          {row.original.id.split("-")[0].toUpperCase()}
        </span>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }: { row: any }) => {
      const priorityObj = row.original.civicIssue?.priority || row.original.priority;
      const priority =
        typeof priorityObj === "object" && priorityObj !== null
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
          className="text-[10px] uppercase tracking-wider"
        >
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: any }) => {
      const status = row.original.status || "UNKNOWN";
      return (
        <Badge
          variant="outline"
          className="text-[10px] uppercase tracking-wider bg-paper font-medium"
        >
          {status.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    id: "timing",
    header: "Timing",
    cell: ({ row }: { row: any }) => {
      const created = row.original.createdAt;
      const scheduled = row.original.scheduledAt;
      return (
        <div className="flex flex-col text-xs text-ink/70 space-y-0.5">
          {created && (
            <span>Created: {formatDistanceToNow(new Date(created), { addSuffix: true })}</span>
          )}
          {scheduled && (
            <span className="text-ledger font-medium">
              Sched: {formatDistanceToNow(new Date(scheduled), { addSuffix: true })}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "resolutionDeadline",
    header: "Resolution Deadline",
    cell: ({ row }: { row: any }) => {
      const deadline = row.original.civicIssue?.resolutionDeadlineAt;
      if (!deadline) return <span className="text-xs text-ink/40">N/A</span>;
      return (
        <span className="text-xs text-ink/70">
          {formatDistanceToNow(new Date(deadline), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    id: "assignment",
    header: "Assignments",
    cell: ({ row, table }: { row: any; table: any }) => {
      const meta = table.options.meta as any;
      const currentTab = meta?.currentTab;

      const assignment = row.original.assignments?.[0];
      const assignee = assignment?.assignedTo || row.original.currentAssignee;
      const team = assignment?.team;

      if (assignee || team) {
        return (
          <div className="flex flex-col gap-1">
            {assignee && (
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-ledger font-mono text-[0.625rem] font-medium text-paper">
                  {assignee.firstName?.[0]}
                  {assignee.lastName?.[0]}
                </span>
                <span className="text-sm font-medium">
                  {assignee.firstName} {assignee.lastName}
                </span>
                {assignee.employeeId && (
                  <span className="text-xs font-mono text-ink/50 bg-ink/5 px-1.5 py-0.5 rounded-sm">
                    {assignee.employeeId}
                  </span>
                )}
              </div>
            )}
            {team && (
              <div className="text-xs text-ink/70 flex items-center gap-1">
                Team: <span className="font-medium text-ink">{team.name}</span>
              </div>
            )}
          </div>
        );
      }

      if (currentTab === "technician-queue") {
        const isPending = row.original.assignmentStatus === "PENDING";
        const woStatus = row.original.status;
        const assignmentId = row.original.assignmentId || row.original.id;
        const workOrderId = row.original.id;

        if (isPending) {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-7 px-3 text-xs font-display font-medium tracking-wide bg-ledger hover:bg-ledger/90 text-paper cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  meta?.onAccept?.(assignmentId, e);
                }}
                disabled={meta?.isAccepting}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2.5 text-xs font-display font-medium tracking-wide border border-signal-open/40 text-signal-open hover:bg-signal-open/10 hover:border-signal-open cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  meta?.onReject?.(assignmentId, row.original, e);
                }}
                disabled={meta?.isRejecting}
              >
                Reject
              </Button>
            </div>
          );
        }

        if (woStatus === "ASSIGNED" || woStatus === "SCHEDULED") {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-7 px-3 text-xs font-display font-medium tracking-wide bg-signal-progress/90 hover:bg-signal-progress text-paper cursor-pointer shadow-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  meta?.onStart?.(workOrderId, e);
                }}
                disabled={meta?.isStarting}
              >
                Start Work
              </Button>
            </div>
          );
        }

        if (woStatus === "ON_HOLD") {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 px-3 text-xs font-display font-medium tracking-wide border-signal-progress/50 text-signal-progress hover:bg-signal-progress/10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  meta?.onStart?.(workOrderId, e);
                }}
                disabled={meta?.isStarting}
              >
                Resume
              </Button>
            </div>
          );
        }

        if (woStatus === "IN_PROGRESS") {
          return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-signal-progress/15 text-signal-progress">
              <span className="size-1.5 rounded-full bg-signal-progress animate-pulse" />
              In Progress
            </span>
          );
        }

        return (
          <span className="text-xs text-ink/70 font-medium">
            {row.original.assignmentStatus?.replace(/_/g, " ") || woStatus?.replace(/_/g, " ")}
          </span>
        );
      }

      if (currentTab !== "technician-queue") {
        return <TechnicianSuggestionInline workOrder={row.original} />;
      }

      return <span className="text-ink/50 text-sm italic">Unassigned</span>;
    },
  },
];
