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
import { Map as MapIcon, Plus, Search } from "lucide-react";
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
  useCreateZone,
  useDeleteZone,
  useGetAdminZones,
  useGetWardsByZone,
  useUpdateZone,
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

interface ZoneRow {
  id: string;
  name: string;
  coverageStatus?: string;
  municipalityId?: string;
  _count?: { wards?: number };
}

const zoneColumns: ColumnDef<ZoneRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortHeader label="Zone" sorted={column.getIsSorted() as false | "asc" | "desc"} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="size-7 rounded-md bg-field border border-line flex items-center justify-center shrink-0">
          <MapIcon className="size-3.5 text-ink/50" />
        </span>
        <div>
          <p className="text-xs font-medium text-ink">{row.original.name}</p>
          <p className="font-mono text-[10px] text-ink/45">{row.original.id.slice(0, 8)}…</p>
        </div>
      </div>
    ),
  },
  {
    id: "wards",
    header: () => <SortHeader label="Wards" sorted={false} />,
    cell: ({ row }) => (
      <span className="text-xs font-mono text-ink/70">{row.original._count?.wards ?? "—"}</span>
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

export function CityZonesView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CityZonesContent municipalityId={id} />;
}

function CityZonesContent({ municipalityId }: { municipalityId: string }) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<ZoneRow | null>(null);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({ name: "", coverageStatus: "ACTIVE" });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch } = useAdminListParams(municipalityId);
  const query = useGetAdminZones({ searchTerm: debouncedSearch || undefined, municipalityId });
  const wardsQuery = useGetWardsByZone(selected?.id ?? "");
  const createMutation = useCreateZone();
  const updateMutation = useUpdateZone();
  const deleteMutation = useDeleteZone();

  const rows: ZoneRow[] = useMemo(() => {
    const all = (query.data?.data ?? []) as ZoneRow[];
    if (statusFilter === "ALL") return all;
    return all.filter((z) => (z.coverageStatus || "ACTIVE").toUpperCase() === statusFilter);
  }, [query.data, statusFilter]);

  const stats = useMemo(() => {
    const all = (query.data?.data ?? []) as ZoneRow[];
    return {
      total: all.length,
      active: all.filter((z) => (z.coverageStatus || "ACTIVE").toUpperCase() === "ACTIVE").length,
      wards: all.reduce((n, z) => n + (z._count?.wards ?? 0), 0),
    };
  }, [query.data]);

  const table = useReactTable({
    data: rows,
    columns: zoneColumns,
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
        title="Zones unavailable"
        body="Zones could not be loaded. Check your connection and try again."
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

  const zoneWards = (wardsQuery.data?.data ?? []) as {
    id: string;
    name: string;
    number?: string;
  }[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Zone name is required");
      return;
    }
    if (dialog?.mode === "edit" && selected) {
      updateMutation.mutate(
        {
          id: selected.id,
          payload: { name: form.name.trim(), coverageStatus: form.coverageStatus },
        },
        {
          onSuccess: () => {
            setDialog(null);
            query.refetch();
          },
        },
      );
    } else {
      // Backend create accepts name + municipalityId only.
      createMutation.mutate({ name: form.name.trim(), municipalityId } as never, {
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
        eyebrow="Jurisdiction & geography"
        title="Zones"
        description="Administrative boundaries of your city — define zones, then drill into wards."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setForm({ name: "", coverageStatus: "ACTIVE" });
              setDialog({ mode: "create" });
            }}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs"
          >
            <Plus className="size-3.5 mr-1.5" /> New Zone
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <CityStatCard label="Zones" value={stats.total} sub="City boundaries" />
        <CityStatCard label="Active" value={stats.active} sub="Under coverage" />
        <CityStatCard label="Wards" value={stats.wards} sub="Across all zones" />
        <CityStatCard
          label="Avg wards"
          value={stats.total ? Math.round((stats.wards / stats.total) * 10) / 10 : "—"}
          sub="Per zone"
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <MapIcon className="size-3.5" />
          {rows.length} zone{rows.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search zones…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[130px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Coverage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All coverage
              </SelectItem>
              {COVERAGE.map((c) => (
                <SelectItem key={c} value={c} className="text-xs cursor-pointer">
                  {c}
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
                  <td colSpan={zoneColumns.length}>
                    <CityEmptyState
                      title="No zones found."
                      body="Define your first zone boundary."
                    />
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
                <StatusPill status={selected.coverageStatus || "ACTIVE"} />
                <SheetTitle className="font-display text-xl text-ink">{selected.name}</SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  Zone boundary and its wards.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60">
                  Wards in this zone ({zoneWards.length})
                </h4>
                {wardsQuery.isLoading ? (
                  <p className="text-xs font-mono text-ink/40 animate-pulse">Loading wards…</p>
                ) : zoneWards.length === 0 ? (
                  <p className="text-xs text-ink/50 italic rounded-lg border border-line/50 bg-field/20 p-3">
                    No wards in this zone yet.
                  </p>
                ) : (
                  <div className="divide-y divide-line/40 rounded-lg border border-line/50 overflow-hidden">
                    {zoneWards.map((w) => (
                      <div
                        key={w.id}
                        className="p-2.5 text-xs bg-paper flex items-center justify-between gap-2"
                      >
                        <span className="text-ink font-medium">{w.name}</span>
                        {w.number != null && (
                          <span className="font-mono text-[10px] text-ink/50">#{w.number}</span>
                        )}
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
                      coverageStatus: selected.coverageStatus || "ACTIVE",
                    });
                    setDialog({ mode: "edit" });
                  }}
                  className="flex-1 cursor-pointer text-xs active:translate-y-px"
                >
                  Edit zone
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
                {dialog?.mode === "edit" ? "Edit zone" : "New zone"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                {dialog?.mode === "edit"
                  ? "Update zone naming or boundary status."
                  : "Create a new administrative zone."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1">
              <label htmlFor="zone-name" className="text-xs font-medium text-ink/80">
                Name *
              </label>
              <Input
                id="zone-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Zone 4"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
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
                    {COVERAGE.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs cursor-pointer">
                        {c}
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
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className={CITY_DIALOG_CLASS}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-base">Delete zone</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              “{selected?.name}” will be permanently deleted along with its ward mappings.
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
