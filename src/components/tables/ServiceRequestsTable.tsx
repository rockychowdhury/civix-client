"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./columns/service-request-columns";
import type { ServiceRequest } from "@/types";

interface ServiceRequestsTableProps {
  data: ServiceRequest[];
  onRowClick?: (request: ServiceRequest) => void;
  selectedId?: string;
}

export function ServiceRequestsTable({ data, onRowClick, selectedId }: ServiceRequestsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id} className="border-b border-line/40 hover:bg-transparent">
              {headerGroup.headers.map((header: any) => {
                return (
                  <TableHead key={header.id} className="text-ink/40 font-display text-[10px] uppercase tracking-widest h-14 align-bottom pb-4 px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id} className="py-6 px-4 group-hover:px-5 transition-all duration-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={columns.length} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-ink/5 flex items-center justify-center mb-2">
                    <span className="text-ink/20 text-xl font-display">?</span>
                  </div>
                  <p className="text-ink/50 font-body text-lg">No reports found.</p>
                  <p className="text-ink/30 font-body text-sm">Adjust your filters to see more results.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
