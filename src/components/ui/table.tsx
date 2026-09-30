"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead data-slot="table-header" className={cn("border-b border-line", className)} {...props} />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-line transition-colors hover:bg-ink/[0.015] data-[state=selected]:bg-ink/[0.03]",
        className,
      )}
      {...props}
    />
  );
}

type TableHeadProps = React.ComponentProps<"th"> & {
  align?: "left" | "right" | "center";
};

function TableHead({ className, align = "left", ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 align-middle font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink/50 first:pl-0 last:pr-0",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  );
}

type TableCellProps = React.ComponentProps<"td"> & {
  align?: "left" | "right" | "center";
};

function TableCell({ className, align = "left", ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle font-body text-sm text-ink/80 first:pl-0 last:pr-0",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    />
  );
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
