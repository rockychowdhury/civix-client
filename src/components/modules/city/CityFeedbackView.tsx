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
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ExternalLink,
  Search,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CityFeedback } from "@/api/feedback.api";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetDepartmentFeedback, useGetDepartments, useGetMunicipalityFeedback } from "@/hooks";
import { useCityScope } from "@/hooks/city.hook";
import { cn } from "@/lib/utils";

type RatingTab = "ALL" | "5" | "4" | "LOW";

const feedbackColumns: ColumnDef<CityFeedback, any>[] = [
  {
    id: "trackingNumber",
    header: "Tracking #",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-ink">
        {row.original.serviceRequest?.trackingNumber || "—"}
      </span>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const f = row.original;
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={cn(
                "size-3",
                s <= f.rating ? "fill-amber-400 text-amber-500" : "text-ink/20",
              )}
            />
          ))}
          <span className="font-mono text-xs text-ink/60 ml-1 font-medium">{f.rating}/5</span>
        </div>
      );
    },
  },
  {
    accessorKey: "comment",
    header: "Citizen Comments",
    cell: ({ row }) => (
      <p className="text-xs text-ink/80 italic line-clamp-1 max-w-md font-body">
        {row.original.comment ? (
          `"${row.original.comment}"`
        ) : (
          <span className="text-ink/40 not-italic">No comment provided</span>
        )}
      </p>
    ),
  },
  {
    id: "citizen",
    header: "Citizen",
    cell: ({ row }) => {
      const c = row.original.citizen;
      return (
        <span className="text-xs text-ink/70">
          {c?.firstName ? `${c.firstName} ${c.lastName || ""}`.trim() : "Verified Citizen"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-xs text-ink/50 font-mono">
        {row.original.createdAt ? format(new Date(row.original.createdAt), "MMM d, yyyy") : "—"}
      </span>
    ),
  },
];

export function CityFeedbackView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CityFeedbackContent municipalityId={id} />;
}

function CityFeedbackContent({ municipalityId }: { municipalityId: string }) {
  const [activeRatingTab, setActiveRatingTab] = useState<RatingTab>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [inspectingFeedback, setInspectingFeedback] = useState<CityFeedback | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page } = useAdminListParams(municipalityId);

  // Departments
  const departmentsQuery = useGetDepartments({ municipalityId });
  const departments = departmentsQuery.data?.data || [];

  // Feedback query
  const cityQuery = useGetMunicipalityFeedback(municipalityId, {
    searchTerm: debouncedSearch || undefined,
    departmentId: selectedDepartment !== "ALL" ? selectedDepartment : undefined,
    page,
    limit: 100,
  });

  const deptQuery = useGetDepartmentFeedback(selectedDepartment, {
    searchTerm: debouncedSearch || undefined,
    page,
    limit: 100,
  });

  const query = selectedDepartment !== "ALL" ? deptQuery : cityQuery;
  const feedbackList: CityFeedback[] = query.data?.data || [];

  // Metrics computation
  const metrics = useMemo(() => {
    if (feedbackList.length === 0) return { avg: 0, total: 0, highCount: 0, lowCount: 0 };
    const total = feedbackList.length;
    const sum = feedbackList.reduce((acc, f) => acc + (f.rating || 0), 0);
    const avg = Number((sum / total).toFixed(1));
    const highCount = feedbackList.filter((f) => f.rating >= 4).length;
    const lowCount = feedbackList.filter((f) => f.rating <= 2).length;
    return { avg, total, highCount, lowCount };
  }, [feedbackList]);

  // Tab Filtering
  const filteredList = useMemo(() => {
    return feedbackList.filter((f) => {
      if (activeRatingTab === "5") return f.rating === 5;
      if (activeRatingTab === "4") return f.rating === 4;
      if (activeRatingTab === "LOW") return f.rating <= 3;
      return true;
    });
  }, [feedbackList, activeRatingTab]);

  const table = useReactTable({
    data: filteredList,
    columns: feedbackColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (query.isLoading) return <AdminSectionSkeleton />;

  if (query.isError) {
    return (
      <EmptyState
        title="Feedback unavailable"
        body="Citizen feedback could not be retrieved. Check your connection and try again."
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
      {/* Executive Satisfaction Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl border border-line bg-paper shadow-xs">
        <div className="space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            Citizen Satisfaction Score
          </span>
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-semibold text-ink">
              {metrics.avg > 0 ? metrics.avg : "—"}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "size-4",
                    s <= Math.round(metrics.avg) ? "fill-amber-400 text-amber-500" : "text-ink/20",
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-[11px] font-body text-ink/60">Based on verified resolutions</p>
        </div>

        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-line sm:pl-5 pt-3 sm:pt-0">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            Total Reviews
          </span>
          <p className="font-display text-3xl font-semibold text-ink">
            {metrics.total.toLocaleString()}
          </p>
          <p className="text-[11px] font-body text-ink/60">
            {metrics.highCount} satisfied (4-5 stars)
          </p>
        </div>

        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-line sm:pl-5 pt-3 sm:pt-0">
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-600">
            Requires Attention
          </span>
          <p className="font-display text-3xl font-semibold text-amber-600">
            {metrics.lowCount.toLocaleString()}
          </p>
          <p className="text-[11px] font-body text-ink/60">
            {metrics.lowCount === 0 ? "Zero low ratings" : "Rated ≤2 stars"}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-line/60">
        <Tabs
          value={activeRatingTab}
          onValueChange={(val) => setActiveRatingTab(val as RatingTab)}
          className="w-full lg:w-auto"
        >
          <TabsList className="bg-field/50 border border-line/20 p-1">
            <TabsTrigger
              value="ALL"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              All ({feedbackList.length})
            </TabsTrigger>
            <TabsTrigger
              value="5"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              5 Stars
            </TabsTrigger>
            <TabsTrigger
              value="4"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              4 Stars
            </TabsTrigger>
            <TabsTrigger
              value="LOW"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              Needs Review (≤3★)
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search & Department Selector */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search feedback comments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line"
            />
          </div>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="h-8.5 text-xs w-[160px] bg-paper border-line cursor-pointer">
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
                const isSelected = row.original.id === inspectingFeedback?.id;
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={`border-b border-line/10 transition-all duration-200 hover:bg-ink/[0.02] cursor-pointer group ${
                      isSelected
                        ? "bg-ink/[0.03] shadow-[inset_3px_0_0_0_var(--color-ledger)] border-line/20"
                        : ""
                    }`}
                    onClick={() => setInspectingFeedback(row.original)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setInspectingFeedback(row.original);
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
                <TableCell colSpan={feedbackColumns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-ink/5 flex items-center justify-center mb-2">
                      <span className="text-ink/20 text-xl font-display">?</span>
                    </div>
                    <p className="text-ink/50 font-body text-lg">No citizen feedback found.</p>
                    <p className="text-ink/30 font-body text-sm">
                      Adjust your search query or rating filter tab.
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

      {/* Feedback Inspector Sheet (Opened directly on row left-click) */}
      {inspectingFeedback && (
        <Sheet
          open={!!inspectingFeedback}
          onOpenChange={(open) => !open && setInspectingFeedback(null)}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-md bg-paper border-l border-line p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-6">
              <SheetHeader className="space-y-2 text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "size-4",
                        s <= inspectingFeedback.rating
                          ? "fill-amber-400 text-amber-500"
                          : "text-ink/20",
                      )}
                    />
                  ))}
                  <span className="font-mono text-sm font-semibold text-ink ml-1.5">
                    {inspectingFeedback.rating}/5 Rating
                  </span>
                </div>
                <SheetTitle className="font-display text-xl text-ink">
                  Review for #{inspectingFeedback.serviceRequest?.trackingNumber || "N/A"}
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  Citizen sentiment and feedback recorded upon service resolution.
                </SheetDescription>
              </SheetHeader>

              {/* Citizen Quote */}
              <div className="p-4 rounded-lg bg-field/30 border border-line text-sm font-body text-ink/90 italic leading-relaxed">
                {inspectingFeedback.comment
                  ? `"${inspectingFeedback.comment}"`
                  : "No written comments submitted."}
              </div>

              {/* Metadata */}
              <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/15 text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-ink/50 flex items-center gap-1.5 font-mono">
                    <User className="size-3.5" /> Citizen
                  </span>
                  <span className="text-ink font-medium">
                    {inspectingFeedback.citizen?.firstName
                      ? `${inspectingFeedback.citizen.firstName} ${inspectingFeedback.citizen.lastName || ""}`.trim()
                      : "Verified Citizen"}
                  </span>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-ink/50 flex items-center gap-1.5 font-mono">
                    <Calendar className="size-3.5" /> Submitted
                  </span>
                  <span className="font-mono text-ink">
                    {inspectingFeedback.createdAt
                      ? format(new Date(inspectingFeedback.createdAt), "PPP p")
                      : "—"}
                  </span>
                </div>

                {inspectingFeedback.serviceRequestId && (
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-ink/50 font-mono">Dossier</span>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2 cursor-pointer"
                    >
                      <Link href={`/municipality/requests`}>
                        View Request <ExternalLink className="size-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-line">
              <Button
                variant="secondary"
                className="w-full cursor-pointer text-xs"
                onClick={() => setInspectingFeedback(null)}
              >
                Close Inspector
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
