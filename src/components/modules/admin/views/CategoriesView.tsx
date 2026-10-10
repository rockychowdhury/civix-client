"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Search, Tags } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCategory,
  useDeleteCategory,
  useGetAdminCategories,
  useGetCategoryChildren,
  useUpdateCategory,
} from "@/hooks";
import { useGetDepartments } from "@/hooks/department.hook";
import { useGetAdminMunicipalities } from "@/hooks/municipality.hook";
import type { Category } from "@/types";
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

const columns: ColumnDef<Category, unknown>[] = [
  {
    accessorKey: "name",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Category
      </span>
    ),
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink truncate">{row.original.name}</p>
        <p className="font-mono text-[10px] text-ink/45 truncate">
          {row.original.slug || "—"}
          {row.original.department?.name ? ` · ${row.original.department.name}` : ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "baseSeverity",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Severity
      </span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink/70">{row.original.baseSeverity ?? "—"}</span>
    ),
  },
  {
    id: "state",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">State</span>
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px] font-mono uppercase bg-field/40 border-line">
        {row.original.isActive === false ? "Archived" : "Live"}
      </Badge>
    ),
  },
];

export function CategoriesView() {
  const [municipalityFilter, setMunicipalityFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [selected, setSelected] = useState<Category | null>(null);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    workInstructions: "",
    departmentId: "",
    parentId: "",
    baseSeverity: "",
    isActive: true,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page, setPage, limit, setLimit } = useAdminListParams(
    `${municipalityFilter}:${deptFilter}`,
  );
  const query = useGetAdminCategories({
    searchTerm: debouncedSearch || undefined,
    departmentId: deptFilter !== "ALL" ? deptFilter : undefined,
    page,
    limit,
  });
  const municipalitiesQuery = useGetAdminMunicipalities({ limit: 100 });
  const departmentsQuery = useGetDepartments(
    municipalityFilter !== "ALL" ? { municipalityId: municipalityFilter } : undefined,
  );
  const childrenQuery = useGetCategoryChildren(selected?.id ?? "");
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const municipalities = (municipalitiesQuery.data?.data ?? []) as { id: string; name: string }[];
  const departments = (departmentsQuery.data?.data ?? []) as { id: string; name: string }[];
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;
  const total = meta?.total ?? rows.length;
  const roots = useMemo(() => rows.filter((c) => c.parentId == null), [rows]);
  const children = (childrenQuery.data?.data ?? []) as Category[];

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
        title="Categories unavailable"
        body="Categories could not be loaded. Check your connection and try again."
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
    setForm({
      name: "",
      description: "",
      workInstructions: "",
      departmentId: deptFilter !== "ALL" ? deptFilter : "",
      parentId: "",
      baseSeverity: "",
      isActive: true,
    });
    setDialog({ mode: "create" });
  };
  const openEdit = () => {
    if (!selected) return;
    setForm({
      name: selected.name,
      description: selected.description ?? "",
      workInstructions: selected.workInstructions ?? "",
      departmentId: selected.departmentId ?? "",
      parentId: selected.parentId ?? "",
      baseSeverity: selected.baseSeverity != null ? String(selected.baseSeverity) : "",
      isActive: selected.isActive !== false,
    });
    setDialog({ mode: "edit" });
  };

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (dialog?.mode === "edit" && selected) {
      updateMutation.mutate(
        {
          id: selected.id,
          payload: Object.fromEntries(
            Object.entries({
              name: form.name.trim(),
              slug: slugify(form.name),
              description: form.description.trim() || undefined,
              workInstructions: form.workInstructions.trim() || undefined,
              departmentId: form.departmentId || undefined,
              parentId: form.parentId || undefined,
              baseSeverity: form.baseSeverity ? Number(form.baseSeverity) : undefined,
              isActive: form.isActive,
            }).filter(([, v]) => v !== undefined),
          ),
        },
        { onSuccess: () => setDialog(null) },
      );
      return;
    }
    // Backend create requires name + slug (min 2).
    createMutation.mutate(
      {
        name: form.name.trim(),
        slug: slugify(form.name),
        description: form.description.trim() || undefined,
        workInstructions: form.workInstructions.trim() || undefined,
        departmentId: form.departmentId || undefined,
        parentId: form.parentId || undefined,
        baseSeverity: form.baseSeverity ? Number(form.baseSeverity) : undefined,
        isActive: form.isActive,
      } as never,
      { onSuccess: () => setDialog(null) },
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminHeader
        eyebrow="Service catalog"
        title="Categories"
        description="Service types across the platform — create categories, nest subcategories, route departments."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openCreate}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs"
          >
            <Plus className="size-3.5 mr-1.5" /> New Category
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard label="Categories" value={total.toLocaleString()} sub="Service types" />
        <AdminStatCard
          label="Live"
          value={rows.filter((c) => c.isActive !== false).length}
          sub="On this page"
        />
        <AdminStatCard label="Root" value={roots.length} sub="Top-level on this page" />
        <AdminStatCard label="Departments" value={departments.length} sub="Routable units" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <Tags className="size-3.5" />
          {total.toLocaleString()} categor{total === 1 ? "y" : "ies"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select
            value={municipalityFilter}
            onValueChange={(v) => {
              setMunicipalityFilter(v);
              setDeptFilter("ALL");
            }}
          >
            <SelectTrigger className="h-8.5 text-xs w-[160px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Municipality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All municipalities
              </SelectItem>
              {municipalities.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs cursor-pointer">
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[150px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All departments
              </SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id} className="text-xs cursor-pointer">
                  {d.name}
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
                    <AdminEmptyState
                      title="No categories found."
                      body="Create the first service type."
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

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-paper border-l border-line p-6 flex flex-col gap-5 overflow-y-auto"
        >
          {selected && (
            <>
              <SheetHeader className="space-y-1.5 text-left">
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono uppercase bg-field/40 border-line w-fit"
                >
                  {selected.isActive === false ? "Archived" : "Live"}
                </Badge>
                <SheetTitle className="font-display text-xl text-ink">{selected.name}</SheetTitle>
                <SheetDescription className="text-xs text-ink/60 font-mono">
                  /{selected.slug}
                </SheetDescription>
              </SheetHeader>
              {selected.description && (
                <p className="text-xs font-body text-ink/70 leading-relaxed">
                  {selected.description}
                </p>
              )}
              {selected.workInstructions && (
                <div className="p-3.5 rounded-lg bg-field/30 border border-line text-xs font-body text-ink/80 leading-relaxed">
                  {selected.workInstructions}
                </div>
              )}
              <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/20 text-xs">
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Department</span>
                  <span className="text-ink font-medium truncate">
                    {selected.department?.name || "Unrouted"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Severity</span>
                  <span className="font-mono text-ink">{selected.baseSeverity ?? "—"}</span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Subcategories</span>
                  <span className="font-mono text-ink">
                    {childrenQuery.isLoading ? "…" : children.length}
                  </span>
                </div>
              </div>
              {children.length > 0 && (
                <div className="rounded-lg border border-line/50 divide-y divide-line/40 overflow-hidden">
                  {children.map((c) => (
                    <div key={c.id} className="p-2.5 text-xs text-ink bg-paper">
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-4 border-t border-line flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={openEdit}
                  className="flex-1 cursor-pointer text-xs active:translate-y-px"
                >
                  Edit category
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="cursor-pointer text-xs text-signal-open hover:text-signal-open"
                >
                  Delete
                </Button>
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
                {dialog?.mode === "edit" ? "Edit category" : "New category"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                URL slug is derived from the name automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1">
              <label htmlFor="sys-cat-name" className="text-xs font-medium text-ink/80">
                Name *
              </label>
              <Input
                id="sys-cat-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Pothole"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sys-cat-desc" className="text-xs font-medium text-ink/80">
                Description
              </label>
              <Textarea
                id="sys-cat-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What counts as this?"
                className="bg-paper border-line text-xs rounded-xs resize-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sys-cat-work" className="text-xs font-medium text-ink/80">
                Work instructions
              </label>
              <Textarea
                id="sys-cat-work"
                rows={2}
                value={form.workInstructions}
                onChange={(e) => setForm({ ...form, workInstructions: e.target.value })}
                placeholder="How should crews handle this?"
                className="bg-paper border-line text-xs rounded-xs resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <span className="text-xs font-medium text-ink/80">Department</span>
                <Select
                  value={form.departmentId || "NONE"}
                  onValueChange={(v) => setForm({ ...form, departmentId: v === "NONE" ? "" : v })}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                    <SelectValue placeholder="Department…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE" className="text-xs cursor-pointer">
                      Unrouted
                    </SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs cursor-pointer">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-ink/80">Parent</span>
                <Select
                  value={form.parentId || "NONE"}
                  onValueChange={(v) => setForm({ ...form, parentId: v === "NONE" ? "" : v })}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                    <SelectValue placeholder="Parent…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE" className="text-xs cursor-pointer">
                      Root category
                    </SelectItem>
                    {roots
                      .filter((c) => c.id !== selected?.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs cursor-pointer">
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 items-end">
              <div className="space-y-1">
                <label htmlFor="sys-cat-sev" className="text-xs font-medium text-ink/80">
                  Severity (1–10)
                </label>
                <Input
                  id="sys-cat-sev"
                  type="number"
                  min={1}
                  max={10}
                  value={form.baseSeverity}
                  onChange={(e) => setForm({ ...form, baseSeverity: e.target.value })}
                  placeholder="3"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-ink/80 pb-2">
                <Switch
                  id="sys-cat-active"
                  checked={form.isActive}
                  onCheckedChange={(c) => setForm({ ...form, isActive: c })}
                  aria-label="Category active"
                  className="cursor-pointer"
                />
                <label htmlFor="sys-cat-active" className="cursor-pointer">
                  Active
                </label>
              </div>
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
            <DialogTitle className="font-display text-base">Delete category</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              “{selected?.name}” and its routing will be permanently removed.
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
