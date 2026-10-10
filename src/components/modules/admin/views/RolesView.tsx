"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Search, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_PATHS } from "@/constant/admin.constant";
import { useCreateRole, useDeleteRole, useGetRoles, useUpdateRole } from "@/hooks";
import type { AdminRole } from "@/types";
import {
  ADMIN_DIALOG_CLASS,
  ADMIN_ROW_CLASS,
  ADMIN_ROW_SELECTED_CLASS,
  AdminEmptyState,
  AdminHeader,
  AdminStatCard,
  ServerTablePagination,
} from "./admin-ui";
import { useAdminListParams } from "./useAdminListParams";

const columns: ColumnDef<AdminRole, unknown>[] = [
  {
    accessorKey: "name",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Role</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="size-7 rounded-md bg-field border border-line flex items-center justify-center shrink-0">
          <ShieldCheck className="size-3.5 text-ink/50" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink truncate">{row.original.name}</p>
          <p className="font-mono text-[10px] text-ink/45 truncate">{row.original.code}</p>
        </div>
      </div>
    ),
  },
  {
    id: "type",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Type</span>
    ),
    cell: ({ row }) => <StatusPill status={row.original.isSystemRole ? "SYSTEM" : "CUSTOM"} />,
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

export function RolesView() {
  const router = useRouter();
  const [selected, setSelected] = useState<AdminRole | null>(null);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page, setPage, limit, setLimit } =
    useAdminListParams();
  const query = useGetRoles({ searchTerm: debouncedSearch || undefined, page, limit });
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;
  const total = meta?.total ?? rows.length;

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
        title="Roles unavailable"
        body="Roles could not be loaded. Check your connection and try again."
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

  const openCreate = () => {
    setForm({ name: "", description: "" });
    setDialog({ mode: "create" });
  };
  const openEdit = () => {
    if (!selected) return;
    setForm({ name: selected.name, description: selected.description ?? "" });
    setDialog({ mode: "edit" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (dialog?.mode === "edit" && selected) {
      // Backend update needs at least one of name/description.
      updateMutation.mutate(
        {
          id: selected.id,
          payload: {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
          },
        },
        { onSuccess: () => setDialog(null) },
      );
      return;
    }
    // Backend uppercases the name and accepts name/description only.
    createMutation.mutate(
      { name: form.name.trim(), description: form.description.trim() || undefined },
      { onSuccess: () => setDialog(null) },
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminHeader
        eyebrow="Access control"
        title="Roles"
        description="System and custom roles — create roles, then assign permissions from the record."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openCreate}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs"
          >
            <Plus className="size-3.5 mr-1.5" /> New Role
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard label="Roles" value={total.toLocaleString()} sub="Defined roles" />
        <AdminStatCard
          label="System"
          value={rows.filter((r) => r.isSystemRole).length}
          sub="On this page"
        />
        <AdminStatCard
          label="Custom"
          value={rows.filter((r) => !r.isSystemRole).length}
          sub="On this page"
        />
        <AdminStatCard
          label="Page"
          value={rows.length}
          sub={`Showing page ${meta?.page ?? page}`}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <ShieldCheck className="size-3.5" />
          {total.toLocaleString()} role{total === 1 ? "" : "s"}
        </div>
        <div className="relative min-w-[200px] w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
          <Input
            type="text"
            placeholder="Search roles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
          />
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
                table.getRowModel().rows.map((row) => {
                  const isSel = row.original.id === selected?.id;
                  return (
                    <tr
                      key={row.id}
                      data-state={isSel ? "selected" : undefined}
                      onClick={() => setSelected(row.original)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelected(row.original);
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
                    <AdminEmptyState title="No roles found." body="Create the first custom role." />
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

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-paper border-l border-line p-6 flex flex-col gap-5 overflow-y-auto"
        >
          {selected && (
            <>
              <SheetHeader className="space-y-1.5 text-left">
                <StatusPill status={selected.isSystemRole ? "SYSTEM" : "CUSTOM"} />
                <SheetTitle className="font-display text-xl text-ink">{selected.name}</SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  {selected.description || "Role detail and permission matrix."}
                </SheetDescription>
              </SheetHeader>
              <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/20 text-xs">
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Code</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono uppercase bg-field/40 border-line"
                  >
                    {selected.code}
                  </Badge>
                </div>
              </div>
              <div className="pt-4 border-t border-line flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(ADMIN_PATHS.roleDetail(selected.id))}
                  className="w-full cursor-pointer text-xs active:translate-y-px"
                >
                  Open permission matrix
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={openEdit}
                    className="flex-1 cursor-pointer text-xs"
                  >
                    Edit
                  </Button>
                  {!selected.isSystemRole && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(true)}
                      className="flex-1 cursor-pointer text-xs text-signal-open hover:text-signal-open"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-base">
                {dialog?.mode === "edit" ? "Edit role" : "New role"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Names are stored uppercase. Permissions are assigned from the role record.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1">
              <label htmlFor="sys-role-name" className="text-xs font-medium text-ink/80">
                Name *
              </label>
              <Input
                id="sys-role-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ward Supervisor"
                className="h-8.5 text-xs bg-paper border-line rounded-xs font-mono uppercase"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sys-role-desc" className="text-xs font-medium text-ink/80">
                Description
              </label>
              <Textarea
                id="sys-role-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What can this role do?"
                className="bg-paper border-line text-xs rounded-xs resize-none"
              />
            </div>
            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDialog(null)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="cursor-pointer text-xs"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving…"
                  : dialog?.mode === "edit"
                    ? "Save changes"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-base">Delete role</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              “{selected?.name}” will be permanently deleted. Users holding it lose access.
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
              disabled={deleteMutation.isPending || !selected}
              onClick={() => {
                if (!selected) return;
                deleteMutation.mutate(selected.id, {
                  onSuccess: () => {
                    setConfirmDelete(false);
                    setSelected(null);
                  },
                });
              }}
              className="cursor-pointer text-xs"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
