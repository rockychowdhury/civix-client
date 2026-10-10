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
import { Clock, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
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
  useCreateSlaPolicy,
  useDeleteSlaPolicy,
  useGetAdminCategories,
  useGetAdminSlaPolicies,
  useUpdateSlaPolicy,
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

interface SlaRow {
  id: string;
  responseMinutes?: number;
  resolutionMinutes?: number;
  assignmentType?: string;
  version?: number;
  categoryId?: string | null;
  priorityId?: string | null;
  category?: { name?: string };
  priority?: { id?: string; name?: string; code?: string };
  municipality?: { name?: string };
}

function fmt(min?: number): string {
  if (min == null) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const slaColumns: ColumnDef<SlaRow, unknown>[] = [
  {
    id: "scope",
    header: () => <SortHeader label="Scope" sorted={false} />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink truncate">
          {row.original.category?.name || "Global policy"}
        </p>
        <p className="font-mono text-[10px] text-ink/45 truncate">
          {row.original.priority?.name || row.original.priority?.code || "Any priority"}
          {row.original.municipality?.name ? ` · ${row.original.municipality.name}` : ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "responseMinutes",
    header: ({ column }) => (
      <SortHeader label="Respond" sorted={column.getIsSorted() as false | "asc" | "desc"} />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink/75">{fmt(row.original.responseMinutes)}</span>
    ),
  },
  {
    accessorKey: "resolutionMinutes",
    header: ({ column }) => (
      <SortHeader label="Resolve" sorted={column.getIsSorted() as false | "asc" | "desc"} />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink/75">{fmt(row.original.resolutionMinutes)}</span>
    ),
  },
  {
    id: "version",
    header: () => <SortHeader label="Ver" sorted={false} />,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink/50">v{row.original.version ?? 1}</span>
    ),
  },
];

export function CitySlaPoliciesView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CitySlaContent municipalityId={id} />;
}

function CitySlaContent({ municipalityId }: { municipalityId: string }) {
  const [selected, setSelected] = useState<SlaRow | null>(null);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    responseMinutes: "",
    resolutionMinutes: "",
    assignmentType: "",
    categoryId: "",
    priorityId: "",
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch } = useAdminListParams(municipalityId);
  const query = useGetAdminSlaPolicies({ municipalityId });
  const categoriesQuery = useGetAdminCategories({ limit: 100 });
  const createMutation = useCreateSlaPolicy();
  const updateMutation = useUpdateSlaPolicy();
  const deleteMutation = useDeleteSlaPolicy();

  const categories = (categoriesQuery.data?.data ?? []) as { id: string; name: string }[];

  // No priorities endpoint exists — derive known priorities from saved policies.
  const knownPriorities = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of (query.data?.data ?? []) as SlaRow[]) {
      const pid = r.priorityId || (r as { priority?: { id?: string } }).priority?.id;
      if (pid && !map.has(pid)) {
        map.set(pid, r.priority?.name || r.priority?.code || pid.slice(0, 8));
      }
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [query.data]);

  const rows: SlaRow[] = useMemo(() => {
    const all = (query.data?.data ?? []) as SlaRow[];
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return all;
    return all.filter((r) =>
      `${r.category?.name ?? ""} ${r.priority?.name ?? ""} ${r.municipality?.name ?? ""}`
        .toLowerCase()
        .includes(term),
    );
  }, [query.data, debouncedSearch]);

  const table = useReactTable({
    data: rows,
    columns: slaColumns,
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
        title="SLA policies unavailable"
        body="SLA policies could not be loaded. Check your connection and try again."
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.responseMinutes || !form.resolutionMinutes) {
      toast.error("Response and resolution targets are required");
      return;
    }
    // Backend create requires categoryId + priorityId alongside municipalityId.
    if (dialog?.mode !== "edit" && (!form.categoryId || !form.priorityId)) {
      toast.error("Category and priority are required for a new policy");
      return;
    }
    if (dialog?.mode === "edit" && selected) {
      updateMutation.mutate(
        {
          id: selected.id,
          payload: {
            responseMinutes: Number(form.responseMinutes),
            resolutionMinutes: Number(form.resolutionMinutes),
            assignmentType: form.assignmentType || undefined,
          },
        },
        {
          onSuccess: () => {
            setDialog(null);
            query.refetch();
          },
        },
      );
      return;
    }
    createMutation.mutate(
      {
        responseMinutes: Number(form.responseMinutes),
        resolutionMinutes: Number(form.resolutionMinutes),
        assignmentType: form.assignmentType || undefined,
        categoryId: form.categoryId || undefined,
        priorityId: form.priorityId || undefined,
        municipalityId,
      } as never,
      {
        onSuccess: () => {
          setDialog(null);
          query.refetch();
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <CityHeader
        eyebrow="Resolution targets"
        title="SLA Policies"
        description="Response and resolution time targets — unmatched issues fall back to the next matching policy."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setForm({
                responseMinutes: "",
                resolutionMinutes: "",
                assignmentType: "",
                categoryId: "",
                priorityId: "",
              });
              setDialog({ mode: "create" });
            }}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs"
          >
            <Plus className="size-3.5 mr-1.5" /> New Policy
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <CityStatCard
          label="Policies"
          value={rows.length}
          sub="Active targets"
          icon={<Clock className="size-4 text-ink/40" />}
        />
        <CityStatCard
          label="Scoped"
          value={rows.filter((r) => r.categoryId).length}
          sub="Category-specific"
        />
        <CityStatCard
          label="Global"
          value={rows.filter((r) => !r.categoryId).length}
          sub="Fallback policies"
        />
        <CityStatCard
          label="Fastest response"
          value={
            rows.length
              ? fmt(
                  Math.min(
                    ...rows
                      .map((r) => r.responseMinutes ?? Infinity)
                      .filter((n) => Number.isFinite(n)),
                  ),
                )
              : "—"
          }
          sub="Across policies"
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <Clock className="size-3.5" />
          {rows.length} polic{rows.length === 1 ? "y" : "ies"}
        </div>
        <div className="relative min-w-[200px] w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
          <Input
            type="text"
            placeholder="Filter by category or priority…"
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
                  <td colSpan={slaColumns.length}>
                    <CityEmptyState
                      title="No SLA policies found."
                      body="Set your first response target."
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
                <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70 w-fit">
                  v{selected.version ?? 1}
                </span>
                <SheetTitle className="font-display text-xl text-ink">
                  {selected.category?.name || "Global policy"}
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  {selected.priority?.name || selected.priority?.code || "Any priority"} ·{" "}
                  {selected.assignmentType || "Any assignment"}
                </SheetDescription>
              </SheetHeader>
              <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/20 text-xs">
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Respond in</span>
                  <span className="font-mono font-semibold text-ink">
                    {fmt(selected.responseMinutes)}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Resolve in</span>
                  <span className="font-mono font-semibold text-ink">
                    {fmt(selected.resolutionMinutes)}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-line flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setForm({
                      responseMinutes: String(selected.responseMinutes ?? ""),
                      resolutionMinutes: String(selected.resolutionMinutes ?? ""),
                      assignmentType: selected.assignmentType ?? "",
                      categoryId: selected.categoryId ?? "",
                      priorityId: "",
                    });
                    setDialog({ mode: "edit" });
                  }}
                  className="flex-1 cursor-pointer text-xs active:translate-y-px"
                >
                  Edit targets
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
                {dialog?.mode === "edit" ? "Edit SLA targets" : "New SLA policy"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                {dialog?.mode === "edit"
                  ? "Adjust response or resolution time targets."
                  : "Create an SLA policy with target deadlines."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="sla-resp" className="text-xs font-medium text-ink/80">
                  Respond (min) *
                </label>
                <Input
                  id="sla-resp"
                  type="number"
                  required
                  min={1}
                  value={form.responseMinutes}
                  onChange={(e) => setForm({ ...form, responseMinutes: e.target.value })}
                  placeholder="240"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sla-reso" className="text-xs font-medium text-ink/80">
                  Resolve (min) *
                </label>
                <Input
                  id="sla-reso"
                  type="number"
                  required
                  min={1}
                  value={form.resolutionMinutes}
                  onChange={(e) => setForm({ ...form, resolutionMinutes: e.target.value })}
                  placeholder="2880"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs font-mono"
                />
              </div>
            </div>
            {dialog?.mode !== "edit" && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-ink/80">Category *</span>
                    <Select
                      value={form.categoryId || ""}
                      onValueChange={(v) => setForm({ ...form, categoryId: v })}
                    >
                      <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="text-xs cursor-pointer">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-ink/80">Priority *</span>
                    <Select
                      value={form.priorityId || ""}
                      onValueChange={(v) => setForm({ ...form, priorityId: v })}
                    >
                      <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {knownPriorities.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs cursor-pointer">
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {knownPriorities.length === 0 && (
                  <p className="text-[11px] font-body text-ink/50">
                    No prior policies yet — create one policy first, then its priority becomes
                    selectable for the next.
                  </p>
                )}
                <div className="space-y-1">
                  <span className="text-xs font-medium text-ink/80">Assignment</span>
                  <Select
                    value={form.assignmentType || "NONE"}
                    onValueChange={(v) =>
                      setForm({ ...form, assignmentType: v === "NONE" ? "" : v })
                    }
                  >
                    <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                      <SelectValue placeholder="Any…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE" className="text-xs cursor-pointer">
                        Any
                      </SelectItem>
                      <SelectItem value="INDIVIDUAL" className="text-xs cursor-pointer">
                        Individual
                      </SelectItem>
                      <SelectItem value="TEAM" className="text-xs cursor-pointer">
                        Team
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
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
            <DialogTitle className="font-display text-base">Delete SLA policy</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              Issues fall back to the next matching policy.
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
