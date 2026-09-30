import type { ReactNode } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  className?: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyTitle,
  emptyBody,
  className,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyTitle?: string;
  emptyBody?: string;
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? "Nothing here yet"}
        body={emptyBody ?? "New items will appear here as they come in."}
      />
    );
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow className="border-transparent">
          {columns.map((col) => (
            <TableHead key={col.key} align={col.align} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={rowKey(row)}>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align} className={cn("py-3.5", col.className)}>
                {col.render(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
