"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Building2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AdminSectionSkeleton } from "@/components/modules/admin";
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
import { ADMIN_PATHS, COVERAGE_STATUSES } from "@/constant/admin.constant";
import {
  useCreateMunicipality,
  useDeleteMunicipality,
  useGetAdminMunicipalities,
  useUpdateMunicipality,
} from "@/hooks";
import type { AdminMunicipality, CoverageStatus } from "@/types";
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

const columns: ColumnDef<AdminMunicipality, unknown>[] = [
  {
    accessorKey: "name",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Municipality
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="size-7 rounded-md bg-field border border-line flex items-center justify-center shrink-0">
          <Building2 className="size-3.5 text-ink/50" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink truncate">{row.original.name}</p>
          <p className="font-mono text-[10px] text-ink/45">{row.original.code}</p>
        </div>
      </div>
    ),
  },
  {
    id: "locale",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Locale</span>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-ink/65 font-mono truncate block max-w-[200px]">
        {[row.original.countryCode, row.original.timezone].filter(Boolean).join(" · ") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "coverageStatus",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Coverage
      </span>
    ),
    cell: ({ row }) => <StatusPill status={row.original.coverageStatus} />,
  },
];

function emptyForm() {
  return { name: "", code: "", countryCode: "", timezone: "", coverageStatus: "ACTIVE" };
}

export function MunicipalitiesView() {
  const router = useRouter();
  const [coverageFilter, setCoverageFilter] = useState("ALL");
  const [selected, setSelected] = useState<AdminMunicipality | null>(null);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; row?: AdminMunicipality } | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState<AdminMunicipality | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page, setPage, limit, setLimit } =
    useAdminListParams(coverageFilter);
  const query = useGetAdminMunicipalities({
    searchTerm: debouncedSearch || undefined,
    coverageStatus: (coverageFilter !== "ALL" ? coverageFilter : undefined) as
      | CoverageStatus
      | undefined,
    page,
    limit,
  });
  // Lightweight active-count for the stat strip (meta only).
  const activeQuery = useGetAdminMunicipalities({ coverageStatus: "ACTIVE", limit: 1 });
  const createMutation = useCreateMunicipality();
  const updateMutation = useUpdateMunicipality();
  const deleteMutation = useDeleteMunicipality();

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;
  const total = meta?.total ?? rows.length;
  const activeTotal =
    (activeQuery.data?.meta as { total?: number } | undefined)?.total ??
    (activeQuery.data?.data ?? []).length;

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
        title="Municipalities unavailable"
        body="Tenant data could not be loaded. Check your connection and try again."
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
    setForm(emptyForm());
    setDialog({ mode: "create" });
  };
  const openEdit = (row: AdminMunicipality) => {
    setForm({
      name: row.name,
      code: row.code,
      countryCode: row.countryCode ?? "",
      timezone: row.timezone ?? "",
      coverageStatus: row.coverageStatus ?? "ACTIVE",
    });
    setDialog({ mode: "edit", row });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    if (dialog?.mode === "edit" && dialog.row) {
      const payload = Object.fromEntries(
        Object.entries({
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          countryCode: form.countryCode.trim() || undefined,
          timezone: form.timezone.trim() || undefined,
          coverageStatus: form.coverageStatus || undefined,
        }).filter(([, v]) => v !== undefined),
      );
      updateMutation.mutate({ id: dialog.row.id, payload }, { onSuccess: () => setDialog(null) });
    } else {
      // Backend create accepts name/code/countryCode/timezone only.
      createMutation.mutate(
        {
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          countryCode: form.countryCode.trim() || undefined,
          timezone: form.timezone.trim() || undefined,
        },
        { onSuccess: () => setDialog(null) },
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminHeader
        eyebrow="Platform tenants"
        title="Municipalities"
        description="Every city on the platform — onboard tenants, track coverage, drill into operations."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openCreate}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs"
          >
            <Plus className="size-3.5 mr-1.5" /> Onboard
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard label="Tenants" value={total.toLocaleString()} sub="On the platform" />
        <AdminStatCard label="Active" value={activeTotal.toLocaleString()} sub="Under coverage" />
        <AdminStatCard
          label="Standing by"
          value={Math.max(0, total - activeTotal).toLocaleString()}
          sub="Inactive or planned"
        />
        <AdminStatCard
          label="Page"
          value={rows.length}
          sub={`Showing page ${meta?.page ?? page}`}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <Building2 className="size-3.5" />
          {total.toLocaleString()} municipalit{total === 1 ? "y" : "ies"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search by name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={coverageFilter} onValueChange={setCoverageFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[140px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Coverage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All coverage
              </SelectItem>
              {COVERAGE_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs cursor-pointer">
                  {s}
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
                      title="No municipalities found."
                      body="Onboard your first tenant city."
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

      {/* Inspector — row click opens the action flow */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-paper border-l border-line p-6 flex flex-col gap-5 overflow-y-auto"
        >
          {selected && (
            <>
              <SheetHeader className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
                    {selected.code}
                  </span>
                  <StatusPill status={selected.coverageStatus} />
                </div>
                <SheetTitle className="font-display text-xl text-ink">{selected.name}</SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  {[selected.countryCode, selected.timezone].filter(Boolean).join(" · ") ||
                    "Tenant detail and lifecycle actions."}
                </SheetDescription>
              </SheetHeader>
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(ADMIN_PATHS.municipalityDetail(selected.id))}
                  className="w-full cursor-pointer text-xs active:translate-y-px"
                >
                  Open full record
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => openEdit(selected)}
                  className="w-full cursor-pointer text-xs active:translate-y-px"
                >
                  Edit details
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(selected)}
                  className="w-full cursor-pointer text-xs text-signal-open hover:text-signal-open"
                >
                  Remove tenant
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
                {dialog?.mode === "edit" ? "Edit municipality" : "Onboard municipality"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Tenants own every department, zone, and issue beneath them.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="muni-name" className="text-xs font-medium text-ink/80">
                  Name *
                </label>
                <Input
                  id="muni-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dhaka North"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="muni-code" className="text-xs font-medium text-ink/80">
                  Code *
                </label>
                <Input
                  id="muni-code"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. DNCC"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs font-mono uppercase"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="muni-country" className="text-xs font-medium text-ink/80">
                  Country code
                </label>
                <Input
                  id="muni-country"
                  value={form.countryCode}
                  onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  placeholder="e.g. BD"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="muni-tz" className="text-xs font-medium text-ink/80">
                  Timezone
                </label>
                <Input
                  id="muni-tz"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  placeholder="e.g. Asia/Dhaka"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
            </div>
            {dialog?.mode === "edit" && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-ink/80">Coverage status</span>
                <Select
                  value={form.coverageStatus}
                  onValueChange={(v) => setForm({ ...form, coverageStatus: v })}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                    <SelectValue placeholder="Coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    {COVERAGE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs cursor-pointer">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
                    : "Onboard"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete !== null} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-base">Remove municipality</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              “{confirmDelete?.name}” and everything under it will be removed. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDelete(null)}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending || !confirmDelete}
              onClick={() => {
                if (!confirmDelete) return;
                deleteMutation.mutate(confirmDelete.id, {
                  onSuccess: () => setConfirmDelete(null),
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
