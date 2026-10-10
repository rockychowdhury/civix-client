"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { KeyRound, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetPermissions } from "@/hooks";
import type { AdminPermission } from "@/types";
import {
  ADMIN_ROW_CLASS,
  AdminEmptyState,
  AdminHeader,
  AdminStatCard,
  ServerTablePagination,
} from "./admin-ui";
import { useAdminListParams } from "./useAdminListParams";

const columns: ColumnDef<AdminPermission, unknown>[] = [
  {
    accessorKey: "action",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Permission
      </span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-ink bg-field/70 border border-line/60 px-2 py-0.5 rounded-xs">
        {row.original.action}:{row.original.resource}
      </span>
    ),
  },
  {
    id: "description",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Description
      </span>
    ),
    cell: ({ row }) => (
      <span className="block max-w-md truncate text-xs text-ink/65">
        {row.original.description || "—"}
      </span>
    ),
  },
];

export function PermissionsView() {
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page, setPage, limit, setLimit } = useAdminListParams(
    `${actionFilter}:${resourceFilter}`,
  );
  const query = useGetPermissions({
    searchTerm: debouncedSearch || undefined,
    action: actionFilter !== "ALL" ? actionFilter : undefined,
    resource: resourceFilter !== "ALL" ? resourceFilter : undefined,
    page,
    limit,
  });

  // Catalogue is small — one wide fetch feeds the filter dropdowns.
  const allQuery = useGetPermissions({ limit: 200 });
  const allRows = (allQuery.data?.data ?? []) as AdminPermission[];

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;
  const total = meta?.total ?? rows.length;

  const actions = useMemo(() => [...new Set(allRows.map((p) => p.action))].sort(), [allRows]);
  const resources = useMemo(() => [...new Set(allRows.map((p) => p.resource))].sort(), [allRows]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Permissions unavailable"
        body="The permission catalogue could not be loaded. Check your connection and try again."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => query.refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminHeader
        eyebrow="Access control"
        title="Permissions"
        description="The platform permission catalogue — read-only. Assign bundles from a role record."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard
          label="Permissions"
          value={total.toLocaleString()}
          sub="Defined grants"
          icon={<KeyRound className="size-4 text-ink/40" />}
        />
        <AdminStatCard label="Actions" value={actions.length} sub="Distinct verbs" />
        <AdminStatCard label="Resources" value={resources.length} sub="Protected domains" />
        <AdminStatCard
          label="Page"
          value={rows.length}
          sub={`Showing page ${meta?.page ?? page}`}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <KeyRound className="size-3.5" />
          {total.toLocaleString()} permission{total === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search action, resource…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[130px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All actions
              </SelectItem>
              {actions.map((a) => (
                <SelectItem key={a} value={a} className="text-xs cursor-pointer">
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[140px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All resources
              </SelectItem>
              {resources.map((r) => (
                <SelectItem key={r} value={r} className="text-xs cursor-pointer">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full rounded-xl border border-line/80 bg-paper overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-line/40">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className="h-11 px-4 first:pl-5 last:pr-5 cursor-pointer align-middle"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className={`${ADMIN_ROW_CLASS} cursor-default`}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4 first:pl-5 last:pr-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr className="border-none">
                  <td colSpan={columns.length}>
                    <AdminEmptyState
                      title="No permissions match."
                      body="Try a different search or filter."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ServerTablePagination
          page={meta?.page ?? page}
          totalPages={meta?.totalPages ?? 1}
          total={total}
          limit={meta?.limit ?? limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}
