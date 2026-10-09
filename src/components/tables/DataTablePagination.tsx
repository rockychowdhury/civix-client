"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalCount?: number;
}

export function DataTablePagination<TData>({ table, totalCount }: DataTablePaginationProps<TData>) {
  const currentTotal = totalCount ?? table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-line/40">
      <div className="text-xs text-ink/50 font-mono">
        Showing{" "}
        <span className="font-semibold text-ink">
          {currentTotal === 0 ? 0 : pageIndex * pageSize + 1}-
          {Math.min((pageIndex + 1) * pageSize, currentTotal)}
        </span>{" "}
        of <span className="font-semibold text-ink">{currentTotal}</span> record(s)
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium text-ink/70">Rows per page</p>
          <div className="relative">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-[65px] px-2 justify-between border border-line bg-transparent hover:bg-ink/5 text-ink focus-visible:ring-1 focus-visible:ring-ledger cursor-pointer text-xs"
                >
                  {pageSize}
                  <ArrowDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[65px] min-w-0">
                {[10, 20, 30, 40, 50].map((size) => (
                  <DropdownMenuItem
                    key={size}
                    onClick={() => table.setPageSize(size)}
                    className="justify-center cursor-pointer text-xs"
                  >
                    {size}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-mono text-ink/50 mr-2">
            Page {pageIndex + 1} of {Math.max(1, pageCount)}
          </span>
          <Button
            variant="ghost"
            className="h-8 px-3 text-ink border-0 hover:bg-ink/5 cursor-pointer text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3 text-ink border-0 hover:bg-ink/5 cursor-pointer text-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
