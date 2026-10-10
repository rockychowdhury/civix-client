"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useGetAllCivicIssues, useOverrideIssueStatus, useReopenCivicIssue } from "@/hooks";
import { useGetDepartments } from "@/hooks/department.hook";
import { useGetAdminMunicipalities } from "@/hooks/municipality.hook";
import type { CivicIssue } from "@/types";
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

const ISSUE_STATUSES = [
  "SUBMITTED",
  "TRIAGED",
  "ASSIGNED",
  "ACCEPTED",
  "IN_PROGRESS",
  "PENDING_VERIFICATION",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "REJECTED",
  "DUPLICATE",
  "INSUFFICIENT_INFORMATION",
  "CANCELLED",
];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const columns: ColumnDef<CivicIssue, unknown>[] = [
  {
    accessorKey: "issueNumber",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Issue #
      </span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-ink bg-field/70 border border-line/60 px-2 py-0.5 rounded-xs">
        {row.original.issueNumber}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Summary
      </span>
    ),
    cell: ({ row }) => (
      <div className="min-w-0 max-w-xs sm:max-w-md">
        <p className="text-xs font-medium text-ink truncate">
          {row.original.title || row.original.description || "Civic incident"}
        </p>
        {row.original.category && (
          <span className="text-[10px] font-mono text-ink/50">{row.original.category.name}</span>
        )}
      </div>
    ),
  },
  {
    id: "priority",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Priority
      </span>
    ),
    cell: ({ row }) => {
      const p = row.original.priority;
      const label = typeof p === "object" ? p?.code || p?.name || "—" : p || "—";
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-mono uppercase bg-field/40 border-line"
        >
          {String(label)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Status</span>
    ),
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
  {
    accessorKey: "reportedCount",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Reports
      </span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink/70">{row.original.reportedCount || 1}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Reported
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono text-ink/50">
        {row.original.createdAt ? format(new Date(row.original.createdAt), "MMM d, yyyy") : "—"}
      </span>
    ),
  },
];

export function OversightIssuesView() {
  const [municipalityFilter, setMunicipalityFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selected, setSelected] = useState<CivicIssue | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState("RESOLVED");
  const [overrideNotes, setOverrideNotes] = useState("");
  const [confirmReopen, setConfirmReopen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page, setPage, limit, setLimit } = useAdminListParams(
    `${municipalityFilter}:${deptFilter}:${statusFilter}:${priorityFilter}`,
  );
  const query = useGetAllCivicIssues({
    searchTerm: debouncedSearch || undefined,
    municipalityId: municipalityFilter !== "ALL" ? municipalityFilter : undefined,
    departmentId: deptFilter !== "ALL" ? deptFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
    page,
    limit,
  });
  const municipalitiesQuery = useGetAdminMunicipalities({ limit: 100 });
  const departmentsQuery = useGetDepartments(
    municipalityFilter !== "ALL" ? { municipalityId: municipalityFilter } : undefined,
  );
  const overrideMutation = useOverrideIssueStatus();
  const reopenMutation = useReopenCivicIssue();

  const municipalities = (municipalitiesQuery.data?.data ?? []) as { id: string; name: string }[];
  const departments = (departmentsQuery.data?.data ?? []) as { id: string; name: string }[];
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;
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
        title="Issues unavailable"
        body="Civic issues could not be loaded. Check your connection and try again."
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
        eyebrow="Platform oversight"
        title="Civic issues"
        description="Every consolidated issue across every municipality — inspect, override, or reopen."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard
          label="In scope"
          value={total.toLocaleString()}
          sub="Matching filters"
          icon={<Eye className="size-4 text-ink/40" />}
        />
        <AdminStatCard
          label="Open"
          value={
            rows.filter(
              (i) => !["RESOLVED", "CLOSED", "CANCELLED"].includes((i.status || "").toUpperCase()),
            ).length
          }
          sub="On this page"
        />
        <AdminStatCard
          label="Resolved"
          value={
            rows.filter((i) => ["RESOLVED", "CLOSED"].includes((i.status || "").toUpperCase()))
              .length
          }
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
          <Eye className="size-3.5" />
          {total.toLocaleString()} issue{total === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search by number, title…"
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
            <SelectTrigger className="h-8.5 text-xs w-[150px] bg-paper border-line cursor-pointer rounded-xs">
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
            <SelectTrigger className="h-8.5 text-xs w-[140px] bg-paper border-line cursor-pointer rounded-xs">
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[140px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All statuses
              </SelectItem>
              {ISSUE_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs cursor-pointer">
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[120px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All priorities
              </SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p} className="text-xs cursor-pointer">
                  {p}
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
                      title="No issues in scope."
                      body="Adjust filters to widen the oversight lens."
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-ink bg-field/70 border border-line/60 px-2 py-0.5 rounded-xs">
                    {selected.issueNumber}
                  </span>
                  <StatusPill status={selected.status} />
                </div>
                <SheetTitle className="font-display text-xl text-ink leading-tight">
                  {selected.title || "Civic issue"}
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  {selected.description || "Issue detail and platform actions."}
                </SheetDescription>
              </SheetHeader>

              <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/20 text-xs">
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Department</span>
                  <span className="text-ink font-medium truncate">
                    {selected.department?.name || "Unassigned"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Reports</span>
                  <span className="font-mono text-ink">{selected.reportedCount || 1}</span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Reported</span>
                  <span className="font-mono text-ink">
                    {selected.createdAt ? format(new Date(selected.createdAt), "PPP") : "—"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-line flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setOverrideStatus("RESOLVED");
                    setOverrideNotes("");
                    setOverrideOpen(true);
                  }}
                  className="flex-1 cursor-pointer text-xs active:translate-y-px"
                >
                  Override status
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmReopen(true)}
                  className="cursor-pointer text-xs"
                >
                  Reopen
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selected) return;
              overrideMutation.mutate(
                {
                  id: selected.id,
                  payload: { status: overrideStatus, notes: overrideNotes.trim() || undefined },
                },
                {
                  onSuccess: () => {
                    setOverrideOpen(false);
                    setSelected(null);
                  },
                },
              );
            }}
            className="space-y-3.5"
          >
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-base">
                Override {selected?.issueNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Platform override — recorded in the issue history.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-ink/80">New status</span>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_STATUSES.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={overrideStatus === s ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setOverrideStatus(s)}
                    className="text-[11px] font-mono justify-start cursor-pointer"
                  >
                    {s.replace(/_/g, " ")}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="sys-override-notes" className="text-xs font-medium text-ink/80">
                Notes
              </label>
              <Textarea
                id="sys-override-notes"
                rows={2}
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="Why the override?"
                className="bg-paper border-line text-xs rounded-xs resize-none"
              />
            </div>
            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setOverrideOpen(false)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={overrideMutation.isPending}
                className="cursor-pointer text-xs"
              >
                {overrideMutation.isPending ? "Applying…" : "Apply override"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmReopen} onOpenChange={setConfirmReopen}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-base">Reopen issue</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              “{selected?.issueNumber}” returns to the active dispatch queue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setConfirmReopen(false)}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={reopenMutation.isPending || !selected}
              onClick={() => {
                if (!selected) return;
                reopenMutation.mutate(selected.id, {
                  onSuccess: () => {
                    setConfirmReopen(false);
                    setSelected(null);
                  },
                });
              }}
              className="cursor-pointer text-xs"
            >
              {reopenMutation.isPending ? "Reopening…" : "Reopen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
