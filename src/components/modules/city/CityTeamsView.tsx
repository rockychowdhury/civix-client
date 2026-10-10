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
import { Plus, Search, Users, Wrench } from "lucide-react";
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
import { useCityScope } from "@/hooks/city.hook";
import { useGetDepartments } from "@/hooks/department.hook";
import { useGetAllStaff } from "@/hooks/staff.hook";
import { useCreateTeam, useDeleteTeam, useGetTeams, useUpdateTeam } from "@/hooks/team.hook";
import {
  CITY_DIALOG_CLASS,
  CITY_ROW_CLASS,
  CITY_ROW_SELECTED_CLASS,
  CityEmptyState,
  CityHeader,
  CityStatCard,
  SortHeader,
} from "./city-ui";

interface TeamRow {
  id: string;
  name: string;
  code: string;
  status?: string;
  departmentId?: string;
  department?: { name?: string };
  leaderId?: string | null;
  leader?: { firstName?: string; lastName?: string } | null;
  members?: unknown[];
  _count?: { members?: number };
}

const teamColumns: ColumnDef<TeamRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortHeader label="Team" sorted={column.getIsSorted() as false | "asc" | "desc"} />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="size-7 rounded-md bg-field border border-line flex items-center justify-center shrink-0">
          <Wrench className="size-3.5 text-ink/50" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink truncate">{row.original.name}</p>
          <p className="font-mono text-[10px] text-ink/45">{row.original.code}</p>
        </div>
      </div>
    ),
  },
  {
    id: "department",
    header: () => <SortHeader label="Department" sorted={false} />,
    cell: ({ row }) => (
      <span className="text-xs text-ink/70 truncate block max-w-[180px]">
        {row.original.department?.name || "—"}
      </span>
    ),
  },
  {
    id: "leader",
    header: () => <SortHeader label="Leader" sorted={false} />,
    cell: ({ row }) => (
      <span className="text-xs text-ink/70">
        {row.original.leader
          ? `${row.original.leader.firstName ?? ""} ${row.original.leader.lastName ?? ""}`.trim()
          : "No leader"}
      </span>
    ),
  },
  {
    id: "members",
    header: () => <SortHeader label="Crew" sorted={false} />,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 text-xs font-mono text-ink/70">
        <Users className="size-3 text-ink/35" />
        {row.original._count?.members ?? row.original.members?.length ?? 0}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortHeader label="Status" sorted={column.getIsSorted() as false | "asc" | "desc"} />
    ),
    cell: ({ row }) => <StatusPill status={row.original.status || "ACTIVE"} />,
  },
];

export function CityTeamsView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CityTeamsContent municipalityId={id} />;
}

function CityTeamsContent({ municipalityId }: { municipalityId: string }) {
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [selected, setSelected] = useState<TeamRow | null>(null);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", departmentId: "", leaderId: "" });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch } = useAdminListParams(municipalityId);
  const query = useGetTeams({ searchTerm: debouncedSearch || undefined });
  const departmentsQuery = useGetDepartments({ municipalityId });
  const staffQuery = useGetAllStaff({ limit: 100 });
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const deleteMutation = useDeleteTeam();

  const departments = (departmentsQuery.data?.data ?? []) as { id: string; name: string }[];
  const staffList = (staffQuery.data?.data ?? []) as {
    userId: string;
    firstName?: string;
    lastName?: string;
  }[];

  const rows: TeamRow[] = useMemo(() => {
    const all = (query.data?.data ?? []) as TeamRow[];
    return all.filter((t) => {
      if (deptFilter !== "ALL" && t.departmentId !== deptFilter) return false;
      return true;
    });
  }, [query.data, deptFilter]);

  const stats = useMemo(() => {
    const all = (query.data?.data ?? []) as TeamRow[];
    return {
      total: all.length,
      active: all.filter((t) => (t.status || "ACTIVE").toUpperCase() === "ACTIVE").length,
      crew: all.reduce((n, t) => n + (t._count?.members ?? t.members?.length ?? 0), 0),
    };
  }, [query.data]);

  const table = useReactTable({
    data: rows,
    columns: teamColumns,
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
        title="Teams unavailable"
        body="Teams could not be loaded. Check your connection and try again."
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
    setForm({ name: "", code: "", departmentId: "", leaderId: "" });
    setDialog({ mode: "create" });
  };
  const openEdit = () => {
    if (!selected) return;
    setForm({
      name: selected.name,
      code: selected.code,
      departmentId: selected.departmentId ?? "",
      leaderId: selected.leaderId ?? "",
    });
    setDialog({ mode: "edit" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    if (dialog?.mode === "edit" && selected) {
      updateMutation.mutate(
        {
          id: selected.id,
          payload: {
            name: form.name.trim(),
            leaderId: form.leaderId || undefined,
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
    if (!form.departmentId) {
      toast.error("Select a department for the new team");
      return;
    }
    createMutation.mutate(
      {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        departmentId: form.departmentId,
        leaderId: form.leaderId || undefined,
      },
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
        eyebrow="Field crews & specialization"
        title="Teams"
        description="Specialized crews grouped under each department — create teams, assign leaders, disband when done."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openCreate}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs"
          >
            <Plus className="size-3.5 mr-1.5" /> New Team
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <CityStatCard label="Teams" value={stats.total} sub="Operational crews" />
        <CityStatCard label="Active" value={stats.active} sub="Ready for dispatch" />
        <CityStatCard label="Crew members" value={stats.crew} sub="Across all teams" />
        <CityStatCard label="Departments" value={departments.length} sub="With team coverage" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <Wrench className="size-3.5" />
          {rows.length} team{rows.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search teams…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[160px] bg-paper border-line cursor-pointer rounded-xs">
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
                  <td colSpan={teamColumns.length}>
                    <CityEmptyState
                      title="No teams found."
                      body="Create a specialized crew to start field dispatch."
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
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
                    {selected.code}
                  </span>
                  <StatusPill status={selected.status || "ACTIVE"} />
                </div>
                <SheetTitle className="font-display text-xl text-ink">{selected.name}</SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  Crew composition and team leadership.
                </SheetDescription>
              </SheetHeader>

              <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/20 text-xs">
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Department</span>
                  <span className="text-ink font-medium truncate">
                    {selected.department?.name || "—"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Leader</span>
                  <span className="text-ink font-medium">
                    {selected.leader
                      ? `${selected.leader.firstName ?? ""} ${selected.leader.lastName ?? ""}`.trim()
                      : "Unassigned"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Crew size</span>
                  <span className="font-mono text-ink">
                    {selected._count?.members ?? selected.members?.length ?? 0}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-line flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={openEdit}
                  className="flex-1 cursor-pointer text-xs active:translate-y-px"
                >
                  Edit team
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="cursor-pointer text-xs text-signal-open hover:text-signal-open"
                >
                  Disband
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
                {dialog?.mode === "edit" ? "Edit team" : "New team"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                {dialog?.mode === "edit"
                  ? "Update team details or reassign the leader."
                  : "Create a specialized crew under a department."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="team-name" className="text-xs font-medium text-ink/80">
                  Name *
                </label>
                <Input
                  id="team-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Road Squad Alpha"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="team-code" className="text-xs font-medium text-ink/80">
                  Code *
                </label>
                <Input
                  id="team-code"
                  required
                  disabled={dialog?.mode === "edit"}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="ROAD-A"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs font-mono uppercase"
                />
              </div>
            </div>
            {dialog?.mode !== "edit" && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-ink/80">Department *</span>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) => setForm({ ...form, departmentId: v })}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                    <SelectValue placeholder="Select department…" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs cursor-pointer">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <span className="text-xs font-medium text-ink/80">Team leader</span>
              <Select
                value={form.leaderId || "NONE"}
                onValueChange={(v) => setForm({ ...form, leaderId: v === "NONE" ? "" : v })}
              >
                <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                  <SelectValue placeholder="Select leader…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE" className="text-xs cursor-pointer">
                    No leader
                  </SelectItem>
                  {staffList.map((s) => (
                    <SelectItem key={s.userId} value={s.userId} className="text-xs cursor-pointer">
                      {`${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.userId.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <DialogTitle className="font-display text-base">Disband team</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              “{selected?.name}” will be permanently removed with its crew assignments.
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
              {deleteMutation.isPending ? "Removing…" : "Disband"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
