"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Paperclip } from "lucide-react";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { formatWard, formatZone } from "@/lib/utils";
import type { ServiceRequest } from "@/types";

export const columns: ColumnDef<ServiceRequest, any>[] = [
  {
    accessorKey: "trackingNumber",
    header: "Tracking #",
    cell: ({ row }: { row: any }) => (
      <span className="font-mono text-sm text-ink cursor-pointer hover:underline">
        {row.getValue("trackingNumber")}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: { row: any }) => {
      const category = row.original.category?.name || row.original.categoryId;
      const needsReview = row.original.needsReview;
      return (
        <div className="flex items-center gap-2">
          <span>{category}</span>
          {needsReview && (
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--color-signal-open)" }}
              title="Needs Review"
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }: { row: any }) => (
      <div className="max-w-[200px] truncate text-ink/70" title={row.getValue("description")}>
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }: { row: any }) => {
      const loc = row.original.location;
      if (!loc) return <span className="text-ink/50">Unknown</span>;
      return (
        <div className="flex flex-col">
          <span>
            {formatWard(loc.ward)} / {formatZone(loc.zone)}
          </span>
          <span className="text-xs text-ink/60 truncate">{loc.address}</span>
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
    accessorKey: "linkedIssue",
    header: "Linked Issue",
    cell: ({ row }: { row: any }) => {
      const issue = row.original.linkedIssue;
      const needsReview = row.original.needsReview;

      if (issue) {
        return (
          <span className="font-mono text-sm text-ink/70 cursor-pointer hover:text-ink">
            {issue.issueNumber}
          </span>
        );
      }

      if (needsReview) {
        return (
          <Badge
            variant="secondary"
            className="text-[10px] uppercase tracking-wider text-signal-open border-signal-open/20 bg-signal-open/5"
          >
            Needs Review
          </Badge>
        );
      }

      return <span className="text-ink/40">—</span>;
    },
  },
  {
    accessorKey: "attachments",
    header: "Attachments",
    cell: ({ row }: { row: any }) => {
      const attachments = row.original.attachments || [];
      if (attachments.length === 0) return null;
      return (
        <div className="flex items-center gap-1 text-xs text-ink/60">
          <Paperclip className="h-3 w-3" />
          <span>{attachments.length}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }: { row: any }) => {
      const dateStr = row.getValue("submittedAt") as string;
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return (
        <span title={date.toLocaleString()} className="text-ink/70 whitespace-nowrap">
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      );
    },
  },
];
