"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { teamColumns } from "./columns/team-columns";
import type { ITeam } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamTableProps {
  data: ITeam[];
  isLoading?: boolean;
}

export function TeamTable({ data, isLoading }: TeamTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns: teamColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
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
          {isLoading ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={teamColumns.length} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-ink/5 flex items-center justify-center mb-2 animate-pulse" />
                  <p className="text-ink/50 font-body text-lg animate-pulse">Loading teams...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: any) => (
              <TableRow
                key={row.id}
                className="border-b border-line/10 transition-all duration-300 hover:bg-ink/[0.02] group"
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
              <TableCell colSpan={teamColumns.length} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-ink/5 flex items-center justify-center mb-2">
                    <span className="text-ink/20 text-xl font-display">?</span>
                  </div>
                  <p className="text-ink/50 font-body text-lg">No teams found.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-6 lg:space-x-8 px-4 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-ink/70">Rows per page</p>
          <div className="relative">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-[65px] px-2 justify-between border border-line bg-transparent hover:bg-ink/5 text-ink focus-visible:ring-1 focus-visible:ring-ledger cursor-pointer"
                >
                  {table.getState().pagination.pageSize}
                  <ArrowDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[65px] min-w-0">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <DropdownMenuItem
                    key={pageSize}
                    onClick={() => table.setPageSize(pageSize)}
                    className="justify-center cursor-pointer"
                  >
                    {pageSize}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="h-8 px-3 text-ink border-0 hover:bg-ink/5 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3 text-ink border-0 hover:bg-ink/5 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
