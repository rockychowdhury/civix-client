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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCityRequests } from "@/hooks";
import { useCityScope } from "@/hooks/city.hook";
import { formatWard } from "@/lib/utils";
import type { ServiceRequest } from "@/types";
import { CityRequestDetailSheet } from "./CityRequestDetailSheet";

type RequestTab = "ALL" | "PENDING_TRIAGE" | "LINKED" | "IN_PROGRESS" | "RESOLVED";

const requestColumns: ColumnDef<ServiceRequest, any>[] = [
  {
    accessorKey: "trackingNumber",
    header: "Tracking #",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-ink">
        {row.original.trackingNumber}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <p className="text-xs text-ink/80 line-clamp-1 max-w-md">
        {row.original.description || "No description"}
      </p>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category ? (
        <Badge variant="outline" className="text-[10px] bg-field/40 border-line">
          <Tag className="size-2.5 mr-1 opacity-50" />
          {row.original.category.name}
        </Badge>
      ) : (
        <span className="text-xs text-ink/40">—</span>
      ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const loc = row.original.location;
      return (
        <span className="truncate max-w-xs block font-mono text-xs text-ink/70">
          {loc?.address ? (
            <>
              {loc.address}
              {loc.ward ? ` (${formatWard(loc.ward)})` : ""}
            </>
          ) : (
            "—"
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-xs text-ink/50 font-mono">
        {row.original.submittedAt ? format(new Date(row.original.submittedAt), "MMM d, yyyy") : "—"}
      </span>
    ),
  },
];

export function CityRequestsView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CityRequestsContent municipalityId={id} />;
}

function CityRequestsContent({ municipalityId }: { municipalityId: string }) {
  const [activeTab, setActiveTab] = useState<RequestTab>("ALL");
  const [inspectingRequestId, setInspectingRequestId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page } = useAdminListParams(municipalityId);

  const requestsQuery = useGetCityRequests(municipalityId, {
    searchTerm: debouncedSearch || undefined,
    page,
    limit: 100,
  });

  const requests: ServiceRequest[] = requestsQuery.data?.data || [];

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const s = req.status?.toUpperCase() || "";
      if (activeTab === "PENDING_TRIAGE") {
        return s === "SUBMITTED" && (!req.linkedIssueId || req.needsReview);
      }
      if (activeTab === "LINKED") {
        return !!req.linkedIssueId;
      }
      if (activeTab === "IN_PROGRESS") {
        return s === "ASSIGNED" || s === "IN_PROGRESS";
      }
      if (activeTab === "RESOLVED") {
        return s === "RESOLVED" || s === "CLOSED";
      }
      return true;
    });
  }, [requests, activeTab]);

  const table = useReactTable({
    data: filteredRequests,
    columns: requestColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (requestsQuery.isLoading) return <AdminSectionSkeleton />;

  if (requestsQuery.isError) {
    return (
      <EmptyState
        title="Service requests unavailable"
        body="Citizen-submitted requests could not be loaded. Please check your connection and retry."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => requestsQuery.refetch()}
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
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-line/60">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as RequestTab)}
          className="w-full lg:w-auto"
        >
          <TabsList className="bg-field/50 border border-line/20 p-1">
            <TabsTrigger
              value="ALL"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              All ({requests.length})
            </TabsTrigger>
            <TabsTrigger
              value="PENDING_TRIAGE"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              Pending Triage
            </TabsTrigger>
            <TabsTrigger
              value="LINKED"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              Linked
            </TabsTrigger>
            <TabsTrigger
              value="IN_PROGRESS"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              In Progress
            </TabsTrigger>
            <TabsTrigger
              value="RESOLVED"
              className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer"
            >
              Resolved
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Live Search */}
        <div className="relative min-w-[240px] w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
          <Input
            type="text"
            placeholder="Search tracking #, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8.5 h-8.5 text-xs bg-paper border-line"
          />
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
                const isSelected = row.original.id === inspectingRequestId;
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={`border-b border-line/10 transition-all duration-200 hover:bg-ink/[0.02] cursor-pointer group ${
                      isSelected
                        ? "bg-ink/[0.03] shadow-[inset_3px_0_0_0_var(--color-ledger)] border-line/20"
                        : ""
                    }`}
                    onClick={() => setInspectingRequestId(row.original.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setInspectingRequestId(row.original.id);
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
                <TableCell colSpan={requestColumns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-ink/5 flex items-center justify-center mb-2">
                      <span className="text-ink/20 text-xl font-display">?</span>
                    </div>
                    <p className="text-ink/50 font-body text-lg">No service requests found.</p>
                    <p className="text-ink/30 font-body text-sm">
                      Adjust your filters or active status tab.
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
      <CityRequestDetailSheet
        requestId={inspectingRequestId}
        isOpen={!!inspectingRequestId}
        onOpenChange={(open) => !open && setInspectingRequestId(null)}
        onSuccess={() => {
          requestsQuery.refetch();
          setInspectingRequestId(null);
        }}
      />
    </div>
  );
}
