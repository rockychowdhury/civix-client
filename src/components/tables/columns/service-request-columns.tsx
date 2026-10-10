"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Paperclip, User, Wrench } from "lucide-react";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import type { ServiceRequest } from "@/types";

export const columns: ColumnDef<ServiceRequest, any>[] = [
  {
    accessorKey: "trackingNumber",
    header: "Tracking #",
    cell: ({ row }: { row: any }) => {
      const submittedAt = row.original.submittedAt || row.original.createdAt;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-sm font-medium text-ink cursor-pointer hover:underline">
            {row.getValue("trackingNumber")}
          </span>
          {submittedAt && (
            <span className="text-[11px] text-ink/50 font-body">
              {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "citizen",
    header: "Citizen",
    cell: ({ row }: { row: any }) => {
      const citizen = row.original.citizen;
      const citizenName =
        citizen?.name ||
        citizen?.user?.name ||
        (citizen?.user?.email ? citizen.user.email.split("@")[0] : null);
      const email = citizen?.user?.email;
      const phone = citizen?.phone || citizen?.user?.phone;
      const trustScore = citizen?.trustScore ?? citizen?.trustLevel;

      return (
        <div className="flex flex-col gap-0.5 max-w-[180px]">
          <div className="flex items-center gap-1.5 truncate">
            <User className="size-3 text-ink/40 shrink-0" />
            <span className="font-medium text-xs text-ink/90 truncate">
              {citizenName || "Anonymous Citizen"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-ink/50 truncate">
            {email ? (
              <span className="truncate">{email}</span>
            ) : phone ? (
              <span>{phone}</span>
            ) : null}
            {trustScore !== undefined && trustScore !== null && (
              <span className="font-mono text-[9px] bg-field px-1 py-0.2 rounded-xs text-ledger">
                ★{trustScore}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category & Location",
    cell: ({ row }: { row: any }) => {
      const category = row.original.category?.name || "General Service";
      const loc = row.original.location;
      const address = loc?.address;
      const landmark = loc?.landmark;

      return (
        <div className="flex flex-col gap-0.5 max-w-[220px]">
          <span className="font-medium text-xs text-ink/90 truncate">{category}</span>
          {address && (
            <span
              className="text-[11px] text-ink/50 truncate"
              title={`${address}${landmark ? ` (${landmark})` : ""}`}
            >
              {address}
              {landmark ? ` • ${landmark}` : ""}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "linkedIssue",
    header: "Civic Issue & Crew",
    cell: ({ row }: { row: any }) => {
      const civicIssue = row.original.civicIssue || row.original.linkedIssue;
      const latestWo = row.original.civicIssue?.workOrders?.[0];
      const assigneeName = latestWo?.currentAssignee?.name;

      if (!civicIssue) {
        return (
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-mono tracking-wider text-signal-progress border-signal-progress/30 bg-signal-progress/5"
          >
            Needs Triage
          </Badge>
        );
      }

      return (
        <div className="flex flex-col gap-0.5 max-w-[180px]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-medium text-ink cursor-pointer hover:underline">
              {civicIssue.issueNumber}
            </span>
            {row.original.needsReview && (
              <span
                className="size-1.5 rounded-full bg-signal-open shrink-0"
                title="Needs review"
              />
            )}
          </div>
          {assigneeName ? (
            <span className="text-[11px] text-ink/60 flex items-center gap-1 truncate">
              <Wrench className="size-2.5 text-ledger shrink-0" />
              {assigneeName}
            </span>
          ) : (
            <span className="text-[10px] text-ink/40 italic">Pending Crew</span>
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
    accessorKey: "attachments",
    header: "Evidence",
    cell: ({ row }: { row: any }) => {
      const attachments = row.original.attachments || [];
      if (attachments.length === 0) {
        return <span className="text-xs text-ink/30">—</span>;
      }
      return (
        <div className="flex items-center gap-1 text-xs text-ink/60">
          <Paperclip className="h-3 w-3 text-ink/40" />
          <span className="font-mono text-[11px]">{attachments.length}</span>
        </div>
      );
    },
  },
];
