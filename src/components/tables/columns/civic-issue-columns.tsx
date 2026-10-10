import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import type { CivicIssue } from "@/types";

export const columns: ColumnDef<CivicIssue, any>[] = [
  {
    accessorKey: "issueNumber",
    header: "Issue #",
    cell: ({ row }: { row: any }) => {
      const ward = row.original.ward;
      const wardName = typeof ward === "string" ? ward : ward?.name;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-sm font-medium text-ink cursor-pointer">
            {row.getValue("issueNumber")}
          </span>
          {wardName && <span className="text-[11px] text-ink/50 font-body">{wardName}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: { row: any }) => {
      const category = row.original.category?.name || "Unknown";
      const address = row.original.location?.address;
      return (
        <div className="flex flex-col gap-0.5 max-w-[220px]">
          <span className="font-medium text-ink/90 truncate">{category}</span>
          {address && (
            <span className="text-[11px] text-ink/50 truncate" title={address}>
              {address}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "workOrder",
    header: "Work Order / Crew",
    cell: ({ row }: { row: any }) => {
      const latestWo = row.original.workOrders?.[0];
      if (!latestWo) {
        return <span className="text-xs text-ink/35 italic">None</span>;
      }
      const assigneeName = latestWo.currentAssignee?.name;
      const empId = latestWo.currentAssignee?.employeeId;
      return (
        <div className="flex flex-col gap-0.5 text-xs max-w-[180px]">
          <span className="text-ink/80 font-medium truncate">{assigneeName || "Pending Crew"}</span>
          {empId && <span className="text-[10px] font-mono text-ink/50 truncate">{empId}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }: { row: any }) => {
      const priorityObj = row.original.priority;
      const priority =
        typeof priorityObj === "object"
          ? priorityObj?.code || priorityObj?.name || "Normal"
          : priorityObj || "Normal";
      const overridden = !!row.original.priorityOverriddenBy;
      const hasEscalation = (row.original.escalations?.length ?? 0) > 0;
      const normalizedPriority = typeof priority === "string" ? priority.toUpperCase() : "";
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant={
              normalizedPriority === "HIGH" ||
              normalizedPriority === "URGENT" ||
              normalizedPriority === "CRITICAL"
                ? "destructive"
                : "secondary"
            }
            className="text-[10px] uppercase tracking-wider font-mono"
          >
            {priority}
          </Badge>
          {hasEscalation && (
            <Badge
              variant="outline"
              className="text-[9px] uppercase tracking-wider text-signal-open border-signal-open/40 bg-signal-open/5 px-1 py-0"
            >
              Escalated
            </Badge>
          )}
          {overridden && (
            <span className="text-[10px] text-ink/40 italic" title="Priority overridden by manager">
              *
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: any }) => <StatusPill status={row.getValue("status")} />,
  },
  {
    accessorKey: "reportedCount",
    header: "Reports",
    cell: ({ row }: { row: any }) => {
      const count = row.getValue("reportedCount") as number;
      return <span className="text-ink/70">{count || 1}</span>;
    },
  },
  {
    id: "deadlines",
    header: "Deadlines",
    enableSorting: false,
    cell: ({ row }: { row: any }) => {
      const status = row.getValue("status") as string;
      const isResolved = status === "RESOLVED" || status === "CLOSED";
      if (isResolved) {
        return (
          <div className="flex flex-col text-xs text-ink/70">
            {row.original.resolvedAt && (
              <span>
                Resolved:{" "}
                {formatDistanceToNow(new Date(row.original.resolvedAt), { addSuffix: true })}
              </span>
            )}
            {row.original.closedAt && (
              <span>
                Closed: {formatDistanceToNow(new Date(row.original.closedAt), { addSuffix: true })}
              </span>
            )}
          </div>
        );
      }
      return (
        <div className="flex flex-col text-xs text-ink/70">
          {row.original.responseDeadlineAt && (
            <span>
              Res:{" "}
              {formatDistanceToNow(new Date(row.original.responseDeadlineAt), { addSuffix: true })}
            </span>
          )}
          {row.original.resolutionDeadlineAt && (
            <span>
              Fix:{" "}
              {formatDistanceToNow(new Date(row.original.resolutionDeadlineAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
      );
    },
  },
];
