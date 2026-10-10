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
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Inbox,
  Search,
  ShieldCheck,
  UserCheck,
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
import type { WorkOrder } from "@/types";
import { columns } from "./columns/work-order-columns";
import { DataTablePagination } from "./DataTablePagination";

function getEmptyState(tab: string, searchTerm?: string) {
  if (searchTerm && searchTerm.trim()) {
    return {
      icon: Search,
      title: `No work orders matching "${searchTerm.trim()}"`,
      description:
        "Try adjusting or clearing your search term to view other department work orders.",
    };
  }

  switch (tab) {
    case "WORK_ORDER_CREATED":
      return {
        icon: UserCheck,
        title: "All Work Orders Assigned",
        description:
          "All work orders have already been handed over to a technician or maintenance crew. Newly created dispatches will appear here.",
      };
    case "ASSIGNED,TEAM_ASSIGNED,IN_PROGRESS":
      return {
        icon: CheckCircle2,
        title: "No Active Field Operations",
        description:
          "There is currently no ongoing field work in progress. Work orders will appear here once assigned crews begin work.",
      };
    case "PENDING_VERIFICATION":
      return {
        icon: ShieldCheck,
        title: "No Resolutions Awaiting Verification",
        description:
          "All submitted resolution records have been verified. Work orders will appear here when technicians finish field work and submit proof.",
      };
    case "RESOLVED,CLOSED":
      return {
        icon: Archive,
        title: "No Completed Work Orders Yet",
        description:
          "No work orders have reached completed status yet. Verified and signed-off jobs will be archived here for record keeping.",
      };
    default:
      return {
        icon: Inbox,
        title: "No Work Orders Found",
        description: "There are currently no work orders recorded for this section.",
      };
  }
}

interface WorkOrdersTableProps {
  data: WorkOrder[];
  currentTab: string;
  searchTerm?: string;
  totalCount?: number;
  onRowClick?: (workOrder: WorkOrder, event: React.MouseEvent) => void;
  selectedId?: string;
  onAccept?: (assignmentId: string, e: React.MouseEvent) => void;
  isAccepting?: boolean;
  onReject?: (assignmentId: string, workOrder: WorkOrder, e: React.MouseEvent) => void;
  isRejecting?: boolean;
  onStart?: (workOrderId: string, e: React.MouseEvent) => void;
  isStarting?: boolean;
}

export function WorkOrdersTable({
  data,
  currentTab,
  searchTerm,
  totalCount,
  onRowClick,
  selectedId,
  onAccept,
  isAccepting,
  onReject,
  isRejecting,
  onStart,
  isStarting,
}: WorkOrdersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const emptyState = getEmptyState(currentTab, searchTerm);
  const EmptyIcon = emptyState.icon;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    meta: {
      currentTab,
      onAccept,
      isAccepting,
      onReject,
      isRejecting,
      onStart,
      isStarting,
    },
  });

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id} className="border-b border-line/40 hover:bg-transparent">
              {headerGroup.headers.map((header: any) => {
                return (
                  <TableHead
                    key={header.id}
                    className="text-ink/40 font-display text-[10px] uppercase tracking-widest h-14 align-bottom pb-4 px-4 first:pl-6 cursor-pointer hover:text-ink/80 transition-colors text-left"
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
            table.getRowModel().rows.map((row: any) => (
              <TableRow
                key={row.id}
                data-state={row.original.id === selectedId ? "selected" : undefined}
                className={`border-b border-line/10 transition-all duration-300 hover:bg-ink/[0.02] cursor-pointer group ${
                  row.original.id === selectedId
                    ? "bg-ink/[0.03] shadow-[inset_3px_0_0_0_var(--color-ledger)] border-line/20"
                    : ""
                }`}
                onClick={(e) => onRowClick?.(row.original, e)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onRowClick?.(row.original, e);
                }}
              >
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell
                    key={cell.id}
                    className="py-6 px-4 first:pl-6 transition-all duration-300"
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

      {/* Pagination */}
      <DataTablePagination table={table} totalCount={totalCount} />
    </div>
  );
}
