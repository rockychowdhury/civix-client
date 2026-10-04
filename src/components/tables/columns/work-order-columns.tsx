import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { WorkOrder } from "@/types";
import { TechnicianSuggestionInline } from "@/components/work-orders/TechnicianSuggestionInline";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const columns: ColumnDef<WorkOrder, any>[] = [
  {
    accessorKey: "id",
    header: "Work Order #",
    cell: ({ row }: { row: any }) => (
      <span className="font-mono text-xs text-ink/70">
        {row.original.id.split('-')[0].toUpperCase()}
      </span>
    ),
  },
  {
    id: "issue",
    header: "Issue",
    cell: ({ row }: { row: any }) => {
      const issue = row.original.civicIssue;
      if (!issue) return <span className="text-ink/40">No issue attached</span>;
      return (
        <div className="flex flex-col">
          <Link href={`/track?issueNumber=${issue.issueNumber}`} className="font-mono text-sm text-ink hover:text-ledger transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
            {issue.issueNumber}
          </Link>
          <span className="text-xs text-ink/60 max-w-[200px] truncate">{row.original.title}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }: { row: any }) => {
      const priority = row.original.priority || "Normal";
      return (
        <Badge variant={priority === "HIGH" || priority === "URGENT" || priority === "CRITICAL" ? "destructive" : "secondary"} className="text-[10px] uppercase tracking-wider">
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "slaDeadlineAt",
    header: "SLA",
    cell: ({ row }: { row: any }) => {
      const deadline = row.original.slaDeadlineAt;
      if (!deadline) return <span className="text-ink/40 text-xs">No SLA</span>;
      const isPast = new Date(deadline) < new Date();
      return (
        <span className={`text-xs font-mono ${isPast ? 'text-signal-open font-semibold' : 'text-ink/70'}`}>
          {formatDistanceToNow(new Date(deadline), { addSuffix: true })}
        </span>
      );
    }
  },
  {
    id: "assignment",
    header: "Assignment",
    cell: ({ row, table }: { row: any, table: any }) => {
      const meta = table.options.meta as any;
      const currentTab = meta?.currentTab;
      
      // On 'Needs Assignment' tab, render the inline suggestion control
      if (currentTab === "needs-assignment") {
        return <TechnicianSuggestionInline workOrder={row.original} />;
      }
      
      if (currentTab === "technician-queue") {
        if (row.original.status === "WORK_ORDER_CREATED" || row.original.status === "PENDING" || row.original.assignmentStatus === "CONFIRMED" && row.original.status !== "IN_PROGRESS") {
          return (
            <Button 
              size="sm" 
              className="h-8 font-display font-medium tracking-wide bg-ledger hover:bg-ledger/90 text-paper cursor-pointer"
              onClick={(e) => meta?.onAccept?.(row.original.id, e)}
              disabled={meta?.isAccepting}
            >
              Accept
            </Button>
          );
        }
        return <span className="text-xs text-ink/70 font-medium">{row.original.status.replace(/_/g, ' ')}</span>;
      }
      
      // On other tabs, just show assignee name or status
      const assignee = row.original.currentAssignee;
      if (assignee) {
        return (
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-ledger font-mono text-[0.625rem] font-medium text-paper">
              {assignee.firstName?.[0]}{assignee.lastName?.[0]}
            </span>
            <span className="text-sm font-medium">{assignee.firstName} {assignee.lastName}</span>
          </div>
        );
      }
      
      return <span className="text-ink/50 text-sm">Unassigned</span>;
    }
  }
];
