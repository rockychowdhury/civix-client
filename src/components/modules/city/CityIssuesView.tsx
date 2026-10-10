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
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCityIssues, useGetDepartments } from "@/hooks";
import { useCityScope } from "@/hooks/city.hook";
import { formatWard } from "@/lib/utils";
import type { CivicIssue } from "@/types";
import { CityIssueDetailSheet } from "./CityIssueDetailSheet";

type StatusTab = "ALL" | "NEEDS_ACTION" | "IN_PROGRESS" | "CRITICAL" | "RESOLVED";

const issueColumns: ColumnDef<CivicIssue, any>[] = [
  {
    accessorKey: "issueNumber",
    header: "Issue #",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-ink">{row.original.issueNumber}</span>
    ),
  },
  {
    accessorKey: "title",
    header: "Summary / Category",
    cell: ({ row }) => {
      const issue = row.original;
      return (
        <div className="space-y-0.5 max-w-xs sm:max-w-md">
          <p className="text-xs font-medium text-ink truncate leading-tight">
            {issue.title || issue.description || "Civic Incident"}
          </p>
          {issue.category && (
            <span className="text-[10px] font-mono text-ink/50 inline-flex items-center gap-1">
              <Tag className="size-2.5 opacity-60" />
              {issue.category.name}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "department",
    header: "Department",
    cell: ({ row }) => (
      <span className="text-xs text-ink/80">
        {row.original.department?.name || <span className="text-ink/40 italic">Unassigned</span>}
      </span>
    ),
  },
  {
    id: "ward",
    header: "Ward",
    cell: ({ row }) => (
      <span className="text-xs text-ink/70 font-mono">
        {formatWard(row.original.location?.ward || row.original.ward)}
      </span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const pObj = row.original.priority;
      const priority =
        typeof pObj === "object" ? pObj?.code || pObj?.name || "Normal" : pObj || "Normal";
      const normalized = typeof priority === "string" ? priority.toUpperCase() : "NORMAL";
      return (
        <Badge
          variant={
            normalized === "HIGH" || normalized === "URGENT" || normalized === "CRITICAL"
              ? "destructive"
              : "secondary"
          }
          className="text-[10px] uppercase font-mono tracking-wider"
        >
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
  {
    accessorKey: "reportedCount",
    header: "Reports",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-ink/70">{row.original.reportedCount || 1}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Reported",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-ink/50">
        {row.original.createdAt ? format(new Date(row.original.createdAt), "MMM d, yyyy") : "—"}
      </span>
    ),
  },
];

export function CityIssuesView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CityIssuesContent municipalityId={id} />;
}

function CityIssuesContent({ municipalityId }: { municipalityId: string }) {
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [inspectingIssue, setInspectingIssue] = useState<CivicIssue | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page } = useAdminListParams(municipalityId);

  // Departments for filtering dropdown
  const departmentsQuery = useGetDepartments({ municipalityId });
  const departments = departmentsQuery.data?.data || [];

  // Query issues
  const issuesQuery = useGetCityIssues(municipalityId, {
    searchTerm: debouncedSearch || undefined,
    departmentId: selectedDepartment !== "ALL" ? selectedDepartment : undefined,
    priority: selectedPriority !== "ALL" ? selectedPriority : undefined,
    page,
    limit: 100,
  });

  const issues: CivicIssue[] = issuesQuery.data?.data || [];

  // Client-side filter for active tabs
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const s = issue.status?.toUpperCase() || "";
      const pObj = issue.priority;
      const p = (
        typeof pObj === "object" ? pObj?.code || pObj?.name || "" : pObj || ""
      ).toUpperCase();

      if (activeTab === "NEEDS_ACTION") {
        return s === "OPEN" || s === "TRIAGED" || s === "NEW";
      }
      if (activeTab === "IN_PROGRESS") {
        return (
          s === "ASSIGNED" ||
          s === "IN_PROGRESS" ||
          s === "PENDING_VERIFICATION" ||
          s === "ACCEPTED"
        );
      }
      if (activeTab === "CRITICAL") {
        return p === "CRITICAL" || p === "URGENT" || p === "HIGH";
      }
      if (activeTab === "RESOLVED") {
        return s === "RESOLVED" || s === "CLOSED";
      }
      return true;
    });
  }, [issues, activeTab]);

  const table = useReactTable({
    data: filteredIssues,
    columns: issueColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (issuesQuery.isLoading) return <AdminSectionSkeleton />;

  if (issuesQuery.isError) {
    return (
      <EmptyState
        title="Issues unavailable"
        body="Civic issues could not be retrieved. Check your network connection and retry."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => issuesQuery.refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Controls: Status Tabs & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-line/60">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as StatusTab)}
          className="w-full lg:w-auto"
        >
          <TabsList className="bg-field/50 border border-line/60 rounded-sm p-1">
            <TabsTrigger
              value="ALL"
              className="font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5"
            >
              All ({issues.length})
            </TabsTrigger>
            <TabsTrigger
              value="NEEDS_ACTION"
              className="font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5"
            >
              Needs Action
            </TabsTrigger>
            <TabsTrigger
              value="IN_PROGRESS"
              className="font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5"
            >
              In Progress
            </TabsTrigger>
            <TabsTrigger
              value="CRITICAL"
              className="font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5"
            >
              Critical / High
            </TabsTrigger>
            <TabsTrigger
              value="RESOLVED"
              className="font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5"
            >
              Resolved
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search, Department Filter, Priority Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Filter by issue #, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line"
            />
          </div>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="h-8.5 text-xs w-[150px] bg-paper border-line cursor-pointer">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All Departments
              </SelectItem>
              {departments.map((d: any) => (
                <SelectItem key={d.id} value={d.id} className="text-xs cursor-pointer">
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="h-8.5 text-xs w-[120px] bg-paper border-line cursor-pointer">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All Priority
              </SelectItem>
              <SelectItem value="CRITICAL" className="text-xs cursor-pointer">
                Critical
              </SelectItem>
              <SelectItem value="URGENT" className="text-xs cursor-pointer">
                Urgent
              </SelectItem>
              <SelectItem value="HIGH" className="text-xs cursor-pointer">
                High
              </SelectItem>
              <SelectItem value="NORMAL" className="text-xs cursor-pointer">
                Normal
              </SelectItem>
              <SelectItem value="LOW" className="text-xs cursor-pointer">
                Low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full rounded-lg border border-line bg-paper overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-line/40 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-ink/40 font-display text-[10px] uppercase tracking-widest h-12 align-bottom pb-3 px-4 first:pl-6 cursor-pointer hover:text-ink/80 transition-colors text-left"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="w-3 shrink-0 flex items-center justify-center">
                          {{
                            asc: <ArrowUp className="h-3 w-3" />,
                            desc: <ArrowDown className="h-3 w-3" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ArrowUpDown className="h-3 w-3 opacity-20" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isSelected = row.original.id === inspectingIssue?.id;
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={`border-b border-line/10 transition-all duration-200 hover:bg-ink/[0.02] cursor-pointer group ${
                      isSelected
                        ? "bg-ink/[0.03] shadow-[inset_3px_0_0_0_var(--color-ledger)] border-line/20"
                        : ""
                    }`}
                    onClick={() => setInspectingIssue(row.original)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setInspectingIssue(row.original);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-4 px-4 first:pl-6 transition-all duration-200"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={issueColumns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-ink/5 flex items-center justify-center mb-2">
                      <span className="text-ink/20 text-xl font-display">?</span>
                    </div>
                    <p className="text-ink/50 font-body text-lg">No issues found.</p>
                    <p className="text-ink/30 font-body text-sm">
                      Adjust your filters or status tab to see more results.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Standardized Table Pagination */}
        <DataTablePagination table={table} />
      </div>

      {/* Inspector Detail Sheet */}
      <CityIssueDetailSheet
        issue={inspectingIssue}
        isOpen={!!inspectingIssue}
        onOpenChange={(open) => !open && setInspectingIssue(null)}
        onSuccess={() => {
          issuesQuery.refetch();
          setInspectingIssue(null);
        }}
      />
    </div>
  );
}
