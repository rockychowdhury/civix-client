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
    id: "details",
    header: "Details",
    cell: ({ row }: { row: any }) => {
      const issue = row.original.civicIssue;
      return (
        <div className="flex flex-col gap-1 max-w-[280px]">
          <span className="text-sm font-medium text-ink truncate" title={row.original.title}>
            {row.original.title}
          </span>
          {issue ? (
            <div className="flex items-center gap-2 text-xs text-ink/60">
              <Link href={`/track?issueNumber=${issue.issueNumber}`} className="font-mono hover:text-ledger transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                {issue.issueNumber}
              </Link>
              {issue.location?.address && (
                <>
                  <span>•</span>
                  <span className="truncate">{issue.location.address}</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-xs text-ink/40">No issue attached</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }: { row: any }) => {
      const priorityObj = row.original.priority || row.original.civicIssue?.priority;
      const priority = typeof priorityObj === 'object' && priorityObj !== null ? (priorityObj?.code || priorityObj?.name || "Normal") : (priorityObj || "Normal");
      const normalizedPriority = typeof priority === 'string' ? priority.toUpperCase() : "";
      return (
        <Badge variant={normalizedPriority === "HIGH" || normalizedPriority === "URGENT" || normalizedPriority === "CRITICAL" ? "destructive" : "secondary"} className="text-[10px] uppercase tracking-wider">
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
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-paper font-medium">
          {status.replace(/_/g, ' ')}
        </Badge>
      );
    }
  },
  {
    id: "timing",
    header: "Timing",
    cell: ({ row }: { row: any }) => {
      const created = row.original.createdAt;
      const scheduled = row.original.scheduledAt;
      return (
        <div className="flex flex-col text-xs text-ink/70 space-y-0.5">
          {created && <span>Created: {formatDistanceToNow(new Date(created), { addSuffix: true })}</span>}
          {scheduled && <span className="text-ledger font-medium">Sched: {formatDistanceToNow(new Date(scheduled), { addSuffix: true })}</span>}
        </div>
      );
    }
  },
  {
    id: "assignment",
    header: "Assignment & Actions",
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
      
      return <span className="text-ink/50 text-sm italic">Unassigned</span>;
    }
  }
];
