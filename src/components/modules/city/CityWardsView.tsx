"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
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
import {
  useCreateWard,
  useDeleteWard,
  useGetAdminWards,
  useGetAdminZones,
  useGetWardDepartments,
  useUpdateWard,
} from "@/hooks";
import { useCityScope } from "@/hooks/city.hook";
import {
  CITY_DIALOG_CLASS,
  CITY_ROW_CLASS,
  CITY_ROW_SELECTED_CLASS,
  CityEmptyState,
  CityHeader,
  CityStatCard,
  SortHeader,
} from "./city-ui";

interface WardRow {
  id: string;
  name: string;
  number?: string;
  zoneId?: string;
  zone?: { name?: string };
  coverageStatus?: string;
}

const wardColumns: ColumnDef<WardRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortHeader label="Ward" sorted={column.getIsSorted() as false | "asc" | "desc"} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="size-7 rounded-md bg-field border border-line flex items-center justify-center shrink-0">
          <LayoutGrid className="size-3.5 text-ink/50" />
        </span>
        <div>
          <p className="text-xs font-medium text-ink">{row.original.name}</p>
          <p className="font-mono text-[10px] text-ink/45">
            #{row.original.number ?? "—"}
            {row.original.zone?.name ? ` · ${row.original.zone.name}` : ""}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "number",
    header: ({ column }) => (
      <SortHeader label="No." sorted={column.getIsSorted() as false | "asc" | "desc"} />
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono text-ink/70">#{row.original.number ?? "—"}</span>
    ),
  },
  {
    accessorKey: "coverageStatus",
    header: ({ column }) => (
      <SortHeader label="Coverage" sorted={column.getIsSorted() as false | "asc" | "desc"} />
    ),
    cell: ({ row }) => <StatusPill status={row.original.coverageStatus || "ACTIVE"} />,
  },
];

const COVERAGE = ["ACTIVE", "PARTIAL", "INACTIVE"];

export function CityWardsView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CityWardsContent municipalityId={id} />;
}

function CityWardsContent({ municipalityId }: { municipalityId: string }) {
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [selected, setSelected] = useState<WardRow | null>(null);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({ name: "", number: "", zoneId: "", coverageStatus: "ACTIVE" });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch } = useAdminListParams(municipalityId);
  const query = useGetAdminWards({ searchTerm: debouncedSearch || undefined, municipalityId });
  const zonesQuery = useGetAdminZones({ municipalityId, limit: 100 });
  const deptQuery = useGetWardDepartments(selected?.id ?? "");
  const createMutation = useCreateWard();
  const updateMutation = useUpdateWard();
  const deleteMutation = useDeleteWard();

  const zones = (zonesQuery.data?.data ?? []) as { id: string; name: string }[];

  const rows: WardRow[] = useMemo(() => {
    const all = (query.data?.data ?? []) as WardRow[];
    if (zoneFilter === "ALL") return all;
    return all.filter((w) => w.zoneId === zoneFilter);
  }, [query.data, zoneFilter]);

  const stats = useMemo(() => {
    const all = (query.data?.data ?? []) as WardRow[];
    return {
      total: all.length,
      active: all.filter((w) => (w.coverageStatus || "ACTIVE").toUpperCase() === "ACTIVE").length,
      zones: zones.length,
    };
  }, [query.data, zones.length]);

  const table = useReactTable({
    data: rows,
    columns: wardColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageSize: 10 } },
  });

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Wards unavailable"
        body="Wards could not be loaded. Check your connection and try again."
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

  const covering = (deptQuery.data?.data ?? []) as { id: string; name?: string }[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.zoneId) {
      toast.error("Name and zone are required");
      return;
    }
    const payload = {
      name: form.name.trim(),
      // Backend stores ward numbers as strings.
      number: form.number.trim() || undefined,
      zoneId: form.zoneId,
      coverageStatus: form.coverageStatus,
    };
    if (dialog?.mode === "edit" && selected) {
      updateMutation.mutate(
        { id: selected.id, payload },
        {
          onSuccess: () => {
            setDialog(null);
            query.refetch();
          },
        },
      );
    } else {
      createMutation.mutate(payload as never, {
        onSuccess: () => {
          setDialog(null);
          query.refetch();
        },
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <CityHeader
        eyebrow="Street-level jurisdiction"
        title="Wards"
        description="Street-level jurisdiction with department coverage per ward."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setForm({ name: "", number: "", zoneId: "", coverageStatus: "ACTIVE" });
              setDialog({ mode: "create" });
            }}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs"
          >
            <Plus className="size-3.5 mr-1.5" /> New Ward
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <CityStatCard label="Wards" value={stats.total} sub="Street-level units" />
        <CityStatCard label="Active" value={stats.active} sub="Under coverage" />
        <CityStatCard label="Zones" value={stats.zones} sub="Parent boundaries" />
        <CityStatCard
          label="Avg / zone"
          value={stats.zones ? Math.round((stats.total / stats.zones) * 10) / 10 : "—"}
          sub="Wards per zone"
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <LayoutGrid className="size-3.5" />
          {rows.length} ward{rows.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search wards…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[150px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All zones
              </SelectItem>
              {zones.map((z) => (
                <SelectItem key={z.id} value={z.id} className="text-xs cursor-pointer">
                  {z.name}
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
                      className={`${CITY_ROW_CLASS} ${isSel ? CITY_ROW_SELECTED_CLASS : ""}`}
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
                  <td colSpan={wardColumns.length}>
                    <CityEmptyState title="No wards found." body="Create a ward under a zone." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <DataTablePagination table={table} totalCount={rows.length} />
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-paper border-l border-line p-6 flex flex-col gap-5 overflow-y-auto"
        >
          {selected && (
            <>
              <SheetHeader className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
                    #{selected.number ?? "—"}
                  </span>
                  <StatusPill status={selected.coverageStatus || "ACTIVE"} />
                </div>
                <SheetTitle className="font-display text-xl text-ink">{selected.name}</SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  {selected.zone?.name
                    ? `Part of ${selected.zone.name}.`
                    : "Ward detail and department jurisdiction."}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60">
                  Departments with jurisdiction ({covering.length})
                </h4>
                {deptQuery.isLoading ? (
                  <p className="text-xs font-mono text-ink/40 animate-pulse">
                    Loading departments…
                  </p>
                ) : covering.length === 0 ? (
                  <p className="text-xs text-ink/50 italic rounded-lg border border-line/50 bg-field/20 p-3">
                    No departments mapped to this ward yet.
                  </p>
                ) : (
                  <div className="divide-y divide-line/40 rounded-lg border border-line/50 overflow-hidden">
                    {covering.map((d) => (
                      <div key={d.id} className="p-2.5 text-xs bg-paper text-ink font-medium">
                        {d.name || d.id.slice(0, 8)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-line flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setForm({
                      name: selected.name,
                      number: String(selected.number ?? ""),
                      zoneId: selected.zoneId ?? "",
                      coverageStatus: selected.coverageStatus || "ACTIVE",
                    });
                    setDialog({ mode: "edit" });
                  }}
                  className="flex-1 cursor-pointer text-xs active:translate-y-px"
                >
                  Edit ward
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
        <DialogContent className={CITY_DIALOG_CLASS}>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-base">
                {dialog?.mode === "edit" ? "Edit ward" : "New ward"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                {dialog?.mode === "edit"
                  ? "Update ward number, zone, or boundaries."
                  : "Create a ward under a parent zone."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="ward-name" className="text-xs font-medium text-ink/80">
                  Name *
                </label>
                <Input
                  id="ward-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ward 12"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="ward-number" className="text-xs font-medium text-ink/80">
                  Number
                </label>
                <Input
                  id="ward-number"
                  required
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="12"
                  inputMode="numeric"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <span className="text-xs font-medium text-ink/80">Zone *</span>
                <Select value={form.zoneId} onValueChange={(v) => setForm({ ...form, zoneId: v })}>
                  <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                    <SelectValue placeholder="Select zone…" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id} className="text-xs cursor-pointer">
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-ink/80">Coverage</span>
                <Select
                  value={form.coverageStatus}
                  onValueChange={(v) => setForm({ ...form, coverageStatus: v })}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                    <SelectValue placeholder="Coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    {COVERAGE.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs cursor-pointer">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <DialogContent className={CITY_DIALOG_CLASS}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-base">Delete ward</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              “{selected?.name}” will be permanently deleted.
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
                    query.refetch();
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
