"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Search, UserRound, Users } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ADMIN_USER_STATUSES } from "@/constant/admin.constant";
import {
  useAssignRoleToUser,
  useDeleteUser,
  useGetRoles,
  useGetUserRoles,
  useGetUsers,
  useRemoveRoleFromUser,
  useRestoreUser,
  useUpdateUserStatus,
} from "@/hooks";
import type { AdminUser } from "@/types";
import {
  ADMIN_DIALOG_CLASS,
  ADMIN_ROW_CLASS,
  ADMIN_ROW_SELECTED_CLASS,
  AdminEmptyState,
  AdminHeader,
  ServerTablePagination,
} from "./admin-ui";
import { UserContextMenu } from "./UserContextMenu";
import { useAdminListParams } from "./useAdminListParams";

function roleCodes(row: AdminUser): string {
  const codes = (row.userRoles ?? []).map((ur) => ur?.role?.code || ur?.role?.name).filter(Boolean);
  return codes.join(", ") || "—";
}

const columns: ColumnDef<AdminUser, unknown>[] = [
  {
    accessorKey: "email",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">User</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="size-7 rounded-full bg-field border border-line flex items-center justify-center shrink-0">
          <UserRound className="size-3.5 text-ink/50" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink truncate">
            {row.original.displayName || row.original.email}
          </p>
          <p className="font-mono text-[10px] text-ink/45 truncate">
            {row.original.email}
            {row.original.phone ? ` · ${row.original.phone}` : ""}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "roles",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Roles</span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-ink/70 truncate block max-w-[220px]">
        {roleCodes(row.original)}
      </span>
    ),
  },
  {
    id: "verified",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Verified
      </span>
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px] font-mono uppercase bg-field/40 border-line">
        {row.original.isEmailVerified ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Status</span>
    ),
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
];

export function UsersView() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuUser, setMenuUser] = useState<AdminUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [roleToAssign, setRoleToAssign] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page, setPage, limit, setLimit } =
    useAdminListParams(statusFilter);
  const query = useGetUsers({
    searchTerm: debouncedSearch || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    page,
    limit,
  });
  const statusMutation = useUpdateUserStatus();
  const restoreMutation = useRestoreUser();
  const deleteMutation = useDeleteUser();

  const rolesQuery = useGetUserRoles(selected?.id ?? "");
  const allRolesQuery = useGetRoles({ limit: 100 });
  const assignMutation = useAssignRoleToUser();
  const removeMutation = useRemoveRoleFromUser();

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;
  const total = meta?.total ?? rows.length;

  const assigned = rolesQuery.data?.data ?? [];
  const assignable = (allRolesQuery.data?.data ?? []).filter(
    (r) => !assigned.some((a) => a.id === r.id),
  );

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
        title="Users unavailable"
        body="Platform accounts could not be loaded. Check your connection and try again."
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

  const openSheet = (user: AdminUser) => {
    setSelected(user);
    setRoleToAssign("");
    setSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminHeader
        eyebrow="Access & identity"
        title="Users"
        description="Every platform account — left-click a row to inspect, right-click to act in place."
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <Users className="size-3.5" />
          {total.toLocaleString()} user{total === 1 ? "" : "s"}
          {query.isFetching && (
            <Loader2 className="size-3.5 animate-spin" aria-label="Updating results" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search by email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[140px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All statuses
              </SelectItem>
              {ADMIN_USER_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs cursor-pointer">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border border-line/80 bg-paper overflow-hidden shadow-2xs transition-opacity duration-150 ${query.isFetching ? "opacity-70" : ""}`}
      >
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
                table.getRowModel().rows.map((row) => {
                  const isSel = row.original.id === selected?.id;
                  return (
                    <tr
                      key={row.id}
                      data-state={isSel ? "selected" : undefined}
                      onClick={() => {
                        setSelected(row.original);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelected(row.original);
                        setMenuUser(row.original);
                        setMenuPosition({ x: e.clientX, y: e.clientY });
                        setMenuOpen(true);
                      }}
                      className={`${ADMIN_ROW_CLASS} ${isSel ? ADMIN_ROW_SELECTED_CLASS : ""}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3.5 px-4 first:pl-5 last:pr-5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr className="border-none">
                  <td colSpan={columns.length}>
                    <AdminEmptyState
                      title="No users found."
                      body="Try a different search or clear the status filter."
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

      {/* Cursor-anchored action bar (right-click) */}
      <UserContextMenu
        user={menuUser}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPosition}
        onViewDetails={() => menuUser && openSheet(menuUser)}
        onRemove={() => setConfirmDelete(true)}
      />

      <Sheet
        open={sheetOpen}
        onOpenChange={(o) => {
          setSheetOpen(o);
          if (!o) setSelected(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-paper border-l border-line p-6 flex flex-col gap-5 overflow-y-auto"
        >
          {selected && (
            <>
              <SheetHeader className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono uppercase bg-field/40 border-line"
                  >
                    {roleCodes(selected)}
                  </Badge>
                  <StatusPill status={selected.status} />
                </div>
                <SheetTitle className="font-display text-xl text-ink">
                  {selected.displayName || selected.email}
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60 font-mono">
                  {selected.email}
                  {selected.phone ? ` · ${selected.phone}` : ""} ·{" "}
                  {selected.isEmailVerified ? "verified" : "unverified"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-ink/80">Moderation status</span>
                <div className="grid grid-cols-2 gap-2">
                  {ADMIN_USER_STATUSES.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={selected.status?.toUpperCase() === s ? "primary" : "secondary"}
                      size="sm"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate(
                          { id: selected.id, status: s },
                          {
                            onSuccess: () =>
                              setSelected({ ...selected, status: s as AdminUser["status"] }),
                          },
                        )
                      }
                      className="text-[11px] font-mono cursor-pointer"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-ink/80">Roles ({assigned.length})</span>
                {rolesQuery.isLoading ? (
                  <p className="text-xs font-mono text-ink/40 animate-pulse">Loading roles…</p>
                ) : assigned.length > 0 ? (
                  <div className="divide-y divide-line/40 rounded-lg border border-line/50 overflow-hidden">
                    {assigned.map((role) => (
                      <div
                        key={role.id}
                        className="p-2.5 flex items-center justify-between gap-2 text-xs bg-paper"
                      >
                        <span className="min-w-0">
                          <span className="font-mono font-medium text-ink">{role.code}</span>
                          <span className="text-ink/50"> · {role.name}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={removeMutation.isPending}
                          onClick={() =>
                            removeMutation.mutate({ roleId: role.id, userId: selected.id })
                          }
                          className="cursor-pointer text-xs h-6 px-2 text-signal-open hover:text-signal-open shrink-0"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink/50 italic rounded-lg border border-line/50 bg-field/20 p-3">
                    No roles assigned.
                  </p>
                )}
                <div className="flex gap-2">
                  <Select
                    value={roleToAssign || "NONE"}
                    onValueChange={(v) => setRoleToAssign(v === "NONE" ? "" : v)}
                  >
                    <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs flex-1">
                      <SelectValue placeholder="Select a role…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE" className="text-xs cursor-pointer">
                        Select a role…
                      </SelectItem>
                      {assignable.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.id}
                          className="text-xs cursor-pointer"
                        >
                          {role.name} ({role.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!roleToAssign || assignMutation.isPending}
                    onClick={() =>
                      assignMutation.mutate(
                        { userId: selected.id, payload: { roleId: roleToAssign } },
                        { onSuccess: () => setRoleToAssign("") },
                      )
                    }
                    className="cursor-pointer text-xs shrink-0"
                  >
                    {assignMutation.isPending ? "Assigning…" : "Assign"}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-line flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreMutation.mutate(selected.id)}
                  className="flex-1 cursor-pointer text-xs"
                >
                  Restore
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 cursor-pointer text-xs text-signal-open hover:text-signal-open"
                >
                  Remove
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-base">Remove user</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              “{(menuUser && menuOpen ? menuUser : selected)?.email}” will be soft-deleted. The
              account can be restored later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending || (!selected && !menuUser)}
              onClick={() => {
                const target = menuOpen && menuUser ? menuUser : selected;
                if (!target) return;
                deleteMutation.mutate(target.id, {
                  onSuccess: () => {
                    setConfirmDelete(false);
                    setSelected(null);
                    setSheetOpen(false);
                  },
                });
              }}
              className="cursor-pointer text-xs"
            >
              {deleteMutation.isPending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
