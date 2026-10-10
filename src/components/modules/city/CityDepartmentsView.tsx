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
import { Building2, CircleCheck, MapPin, Plus, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useAttachDepartmentServiceAreas,
  useCreateDepartment,
  useGetAdminWards,
  useGetDepartmentById,
  useGetDepartments,
  useRemoveDepartmentServiceArea,
  useUpdateDepartment,
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

interface DeptRow {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string;
  municipality?: { name?: string };
  serviceAreas?: { id: string; ward?: { id: string; name: string; number?: string } }[];
  _count?: { serviceAreas?: number };
}

const deptColumns: ColumnDef<DeptRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortHeader label="Department" sorted={column.getIsSorted() as false | "asc" | "desc"} />
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
    id: "contact",
    header: () => <SortHeader label="Contact" sorted={false} />,
    cell: ({ row }) => (
      <span className="text-xs text-ink/65 font-mono truncate block max-w-[200px]">
        {row.original.email || row.original.phone || "—"}
      </span>
    ),
  },
  {
    id: "coverage",
    header: () => <SortHeader label="Wards" sorted={false} />,
    cell: ({ row }) => {
      const n = row.original.serviceAreas?.length ?? row.original._count?.serviceAreas ?? 0;
      return (
        <span className="inline-flex items-center gap-1 text-xs font-mono text-ink/70">
          <MapPin className="size-3 text-ink/35" />
          {n}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortHeader label="Status" sorted={column.getIsSorted() as false | "asc" | "desc"} />
    ),
    cell: ({ row }) => <StatusPill status={row.original.status || "ACTIVE"} />,
  },
];

function emptyForm() {
  return { name: "", code: "", description: "", email: "", phone: "" };
}

export function CityDepartmentsView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CityDepartmentsContent municipalityId={id} />;
}

function CityDepartmentsContent({ municipalityId }: { municipalityId: string }) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<DeptRow | null>(null);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit" } | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [attachOpen, setAttachOpen] = useState(false);
  const [pickedWards, setPickedWards] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch } = useAdminListParams(municipalityId);
  const query = useGetDepartments({ municipalityId });
  const wardsQuery = useGetAdminWards({ municipalityId, limit: 100 });
  const detailQuery = useGetDepartmentById(selected?.id ?? "");
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const attachMutation = useAttachDepartmentServiceAreas();
  const removeAreaMutation = useRemoveDepartmentServiceArea();

  const rows: DeptRow[] = useMemo(() => {
    const all = (query.data?.data ?? []) as DeptRow[];
    const term = debouncedSearch.trim().toLowerCase();
    return all.filter((d) => {
      if (statusFilter !== "ALL" && (d.status || "ACTIVE").toUpperCase() !== statusFilter)
        return false;
      if (term && !`${d.name} ${d.code}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [query.data, debouncedSearch, statusFilter]);

  const stats = useMemo(() => {
    const all = (query.data?.data ?? []) as DeptRow[];
    return {
      total: all.length,
      active: all.filter((d) => (d.status || "ACTIVE").toUpperCase() === "ACTIVE").length,
      covered: all.filter((d) => (d.serviceAreas?.length ?? d._count?.serviceAreas ?? 0) > 0)
        .length,
    };
  }, [query.data]);

  const table = useReactTable({
    data: rows,
    columns: deptColumns,
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
        title="Departments unavailable"
        body="Departments could not be loaded. Check your connection and try again."
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

  const wards = (wardsQuery.data?.data ?? []) as { id: string; name: string; number?: string }[];
  const detail = (detailQuery.data?.data ?? selected) as DeptRow | null;
  const detailAreas =
    (detail as { serviceAreas?: { id: string; ward?: { id: string; name: string } }[] })
      ?.serviceAreas ?? [];

  const openCreate = () => {
    setForm(emptyForm());
    setDialog({ mode: "create" });
  };
  const openEdit = () => {
    if (!selected) return;
    setForm({
      name: selected.name,
      // `code` is immutable on the backend (create-only) — shown, not edited.
      code: selected.code,
      description: selected.description ?? "",
      email: selected.email ?? "",
      phone: selected.phone ?? "",
    });
    setDialog({ mode: "edit" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    const payload = Object.fromEntries(
      Object.entries({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
      }).filter(([, v]) => v !== undefined),
    );
    if (dialog?.mode === "edit" && selected) {
      // Backend update accepts name/description/email/phone/status only.
      const { name, description, email, phone } = payload as Record<string, string>;
      updateMutation.mutate(
        { id: selected.id, payload: { name, description, email, phone } },
        {
          onSuccess: () => {
            setDialog(null);
            query.refetch();
          },
        },
      );
    } else {
      createMutation.mutate(
        { ...payload, municipalityId },
        {
          onSuccess: () => {
            setDialog(null);
            query.refetch();
          },
        },
      );
    }
  };

  const toggleWard = (wid: string) =>
    setPickedWards((prev) => (prev.includes(wid) ? prev.filter((x) => x !== wid) : [...prev, wid]));

  return (
    <div className="flex flex-col gap-6 w-full">
      <CityHeader
        eyebrow="Operations & service routing"
        title="Departments"
        description="Own the service catalogue and ward coverage for your city — create departments, assign wards, manage delivery."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openCreate}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs"
          >
            <Plus className="size-3.5 mr-1.5" /> New Department
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <CityStatCard label="Departments" value={stats.total} sub="Municipal service units" />
        <CityStatCard
          label="Active"
          value={stats.active}
          sub="Currently operational"
          icon={<CircleCheck className="size-4 text-ink/40" />}
        />
        <CityStatCard
          label="With coverage"
          value={stats.covered}
          sub="Wards assigned"
          icon={<MapPin className="size-4 text-ink/40" />}
        />
        <CityStatCard
          label="Unmapped"
          value={Math.max(0, stats.total - stats.covered)}
          sub="Need ward assignment"
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <Building2 className="size-3.5" />
          {rows.length} department{rows.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search departments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[130px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All statuses
              </SelectItem>
              <SelectItem value="ACTIVE" className="text-xs cursor-pointer">
                Active
              </SelectItem>
              <SelectItem value="INACTIVE" className="text-xs cursor-pointer">
                Inactive
              </SelectItem>
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
                      className="h-11 px-4 first:pl-5 last:pr-5 cursor-pointer hover:text-ink/80 transition-colors align-middle"
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
                  <td colSpan={deptColumns.length}>
                    <CityEmptyState
                      title="No departments found."
                      body="Create your first department to start routing services."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <DataTablePagination table={table} totalCount={rows.length} />
      </div>

      {/* Inspector sheet — row click opens detail flow */}
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
                  <StatusPill status={selected.status || "ACTIVE"} />
                </div>
                <SheetTitle className="font-display text-xl text-ink">{selected.name}</SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  {selected.description || "Department detail and ward coverage."}
                </SheetDescription>
              </SheetHeader>

              <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/20 text-xs">
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Email</span>
                  <span className="font-mono text-ink truncate">{selected.email || "—"}</span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Phone</span>
                  <span className="font-mono text-ink">{selected.phone || "—"}</span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Ward coverage</span>
                  <span className="text-ink font-medium">{detailAreas.length} ward(s)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60">
                    Service areas
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPickedWards([]);
                      setAttachOpen(true);
                    }}
                    className="cursor-pointer text-xs h-7 px-2"
                  >
                    Assign wards →
                  </Button>
                </div>
                {detailQuery.isLoading ? (
                  <p className="text-xs font-mono text-ink/40 animate-pulse">Loading coverage…</p>
                ) : detailAreas.length === 0 ? (
                  <p className="text-xs text-ink/50 italic rounded-lg border border-line/50 bg-field/20 p-3">
                    No wards assigned yet.
                  </p>
                ) : (
                  <div className="divide-y divide-line/40 rounded-lg border border-line/50 overflow-hidden">
                    {detailAreas.map((a) => (
                      <div
                        key={a.id}
                        className="p-2.5 flex items-center justify-between gap-2 text-xs bg-paper"
                      >
                        <span className="text-ink font-medium truncate">
                          {a.ward?.name || a.id.slice(0, 8)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={removeAreaMutation.isPending}
                          onClick={() =>
                            removeAreaMutation.mutate(
                              { id: selected.id, areaId: a.id },
                              { onSuccess: () => detailQuery.refetch() },
                            )
                          }
                          className="cursor-pointer text-xs h-6 px-2 text-signal-open hover:text-signal-open"
                        >
                          Remove
                        </Button>
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
                  onClick={openEdit}
                  className="flex-1 cursor-pointer text-xs active:translate-y-px"
                >
                  Edit details
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(null)}
                  className="cursor-pointer text-xs"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Compact create/edit dialog */}
      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className={CITY_DIALOG_CLASS}>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-base">
                {dialog?.mode === "edit" ? "Edit department" : "New department"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                {dialog?.mode === "edit"
                  ? "Update name, code, and contact details."
                  : "Create a municipal department (e.g. Waste, Roads)."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="dept-name" className="text-xs font-medium text-ink/80">
                  Name *
                </label>
                <Input
                  id="dept-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Waste Management"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="dept-code" className="text-xs font-medium text-ink/80">
                  Code *
                </label>
                <Input
                  id="dept-code"
                  required
                  disabled={dialog?.mode === "edit"}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="WASTE"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs font-mono uppercase"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="dept-desc" className="text-xs font-medium text-ink/80">
                Description
              </label>
              <Textarea
                id="dept-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does it own?"
                className="bg-paper border-line text-xs rounded-xs resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="dept-email" className="text-xs font-medium text-ink/80">
                  Email
                </label>
                <Input
                  id="dept-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="dept@city.gov"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="dept-phone" className="text-xs font-medium text-ink/80">
                  Phone
                </label>
                <Input
                  id="dept-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
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

      {/* Compact ward assignment dialog */}
      <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
        <DialogContent className={CITY_DIALOG_CLASS}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-base">Assign service areas</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              Wards covered by {selected?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto rounded-lg border border-line/50 p-1.5">
            {wardsQuery.isLoading ? (
              <p className="text-xs text-ink/50 p-2">Loading wards…</p>
            ) : wards.length === 0 ? (
              <p className="text-xs text-ink/50 p-2">No wards in this city yet.</p>
            ) : (
              wards.map((w) => (
                <label
                  key={w.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xs px-2 py-1.5 transition-colors hover:bg-field/50"
                >
                  <input
                    type="checkbox"
                    checked={pickedWards.includes(w.id)}
                    onChange={() => toggleWard(w.id)}
                    aria-label={w.name}
                    className="size-3.5 shrink-0 cursor-pointer accent-ledger"
                  />
                  <span className="text-xs text-ink">
                    {w.name}
                    {w.number != null && (
                      <span className="ml-1.5 font-mono text-[10px] text-ink/50">#{w.number}</span>
                    )}
                  </span>
                </label>
              ))
            )}
          </div>
          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAttachOpen(false)}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={pickedWards.length === 0 || attachMutation.isPending || !selected}
              onClick={async () => {
                if (!selected) return;
                try {
                  // Backend attaches a single ward per call.
                  for (const wardId of pickedWards) {
                    await attachMutation.mutateAsync({ id: selected.id, wardId });
                  }
                  toast.success(
                    `${pickedWards.length} ward${pickedWards.length === 1 ? "" : "s"} attached successfully`,
                  );
                  setAttachOpen(false);
                  setPickedWards([]);
                  detailQuery.refetch();
                  query.refetch();
                } catch {
                  // Error toast fired by the mutation.
                }
              }}
              className="cursor-pointer text-xs"
            >
              {attachMutation.isPending ? "Assigning…" : `Assign (${pickedWards.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
