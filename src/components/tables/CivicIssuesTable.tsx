"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Inbox,
  Search,
} from "lucide-react";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CivicIssue } from "@/types";
import { columns } from "./columns/civic-issue-columns";
import { DataTablePagination } from "./DataTablePagination";

interface CivicIssuesTableProps {
  data: CivicIssue[];
  currentStage?: string;
  searchTerm?: string;
  totalCount?: number;
  onRowClick?: (issue: CivicIssue, event: React.MouseEvent) => void;
  selectedId?: string;
}

const EMPTY_STATES: Record<string, { title: string; description: string; icon: any }> = {
  queue: {
    title: "Issue Queue is Clear",
    description:
      "All incoming civic reports have been triaged and converted into active work orders.",
    icon: Inbox,
  },
  in_progress: {
    title: "No In-Progress Remediation",
    description:
      "There are currently no active civic issues undergoing field repairs or maintenance.",
    icon: Clock,
  },
  resolved: {
    title: "No Resolved Issues",
    description: "No civic issues verified as resolved or officially closed in this log.",
    icon: CheckCircle2,
  },
  escalated: {
    title: "Zero Active Escalations",
    description: "All departmental issues are currently within standard SLA response windows.",
    icon: AlertTriangle,
  },
};

export function CivicIssuesTable({
  data,
  currentStage = "queue",
  searchTerm,
  totalCount,
  onRowClick,
  selectedId,
}: CivicIssuesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const emptyState = searchTerm?.trim()
    ? {
        title: "No Matching Issues",
        description: `No civic issues found matching "${searchTerm}". Try adjusting your keywords or active filters.`,
        icon: Search,
      }
    : EMPTY_STATES[currentStage] || {
        title: "No Issues Found",
        description: "No civic issues are available in this view.",
        icon: Inbox,
      };

  const EmptyIcon = emptyState.icon;

  return (
    <div className="w-full space-y-4">
      <div className="border border-line/30 rounded-md bg-paper overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-line/40 hover:bg-transparent bg-field/30"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-ink/50 font-display text-[10px] uppercase tracking-widest h-12 align-bottom pb-3 px-4 first:pl-6 cursor-pointer hover:text-ink/80 transition-colors text-left"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="w-3 flex-shrink-0 flex items-center justify-center">
                            {{
                              asc: <ArrowUp className="h-3 w-3" />,
                              desc: <ArrowDown className="h-3 w-3" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className="h-3 w-3 opacity-20" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.original.id === selectedId ? "selected" : undefined}
                  className={`border-b border-line/20 transition-all duration-200 hover:bg-ink/[0.02] cursor-pointer group ${
                    row.original.id === selectedId
                      ? "bg-ink/[0.04] shadow-[inset_3px_0_0_0_var(--color-ledger)] border-line/30"
                      : ""
                  }`}
                  onClick={(e) => onRowClick?.(row.original, e)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onRowClick?.(row.original, e);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-4 px-4 first:pl-6 transition-all duration-200"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={columns.length} className="h-72 text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-3.5 max-w-md mx-auto">
                    <div className="h-12 w-12 rounded-full bg-field border border-line/40 flex items-center justify-center text-ledger shadow-xs">
                      <EmptyIcon className="h-6 w-6 stroke-[1.75]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-display font-medium text-ink tracking-tight">
                        {emptyState.title}
                      </h3>
                      <p className="text-xs text-ink/60 font-body leading-relaxed max-w-sm mx-auto">
                        {emptyState.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - always rendered at bottom */}
      <DataTablePagination table={table} totalCount={totalCount} />
    </div>
  );
}
