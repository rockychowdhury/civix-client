import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import type { CivicIssue } from "@/types";
import { CivicIssueActions } from "./CivicIssueActions";

export const columns: ColumnDef<CivicIssue, any>[] = [
  {
    accessorKey: "issueNumber",
    header: "Issue #",
    cell: ({ row }: { row: any }) => (
      <span className="font-mono text-sm text-ink cursor-pointer">
        {row.getValue("issueNumber")}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: { row: any }) => {
      const category = row.original.category?.name || "Unknown";
      return <span>{category}</span>;
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
      const normalizedPriority = typeof priority === "string" ? priority.toUpperCase() : "";
      return (
        <div className="flex items-center gap-2">
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
