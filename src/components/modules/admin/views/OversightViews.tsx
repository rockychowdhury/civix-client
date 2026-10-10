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
import { Inbox, MessageSquareHeart, Search, Star } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AdminSectionSkeleton } from "@/components/modules/admin";
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
import { useGetAllFeedback, useGetAllServiceRequests } from "@/hooks";
import { useGetAdminMunicipalities } from "@/hooks/municipality.hook";
import { cn } from "@/lib/utils";
import type { ServiceRequest } from "@/types";
import {
  ADMIN_ROW_CLASS,
  ADMIN_ROW_SELECTED_CLASS,
  AdminEmptyState,
  AdminHeader,
  AdminStatCard,
  ServerTablePagination,
} from "./admin-ui";
import { useAdminListParams } from "./useAdminListParams";

const REQUEST_STATUSES = [
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

const requestColumns: ColumnDef<ServiceRequest, unknown>[] = [
  {
    accessorKey: "trackingNumber",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Tracking #
      </span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-ink bg-field/70 border border-line/60 px-2 py-0.5 rounded-xs">
        {row.original.trackingNumber}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Request
      </span>
    ),
    cell: ({ row }) => (
      <p className="text-xs text-ink/80 line-clamp-1 max-w-md">
        {row.original.description || "No description"}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Status</span>
    ),
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
  {
    accessorKey: "submittedAt",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Submitted
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono text-ink/50">
        {row.original.submittedAt ? format(new Date(row.original.submittedAt), "MMM d, yyyy") : "—"}
      </span>
    ),
  },
];

export function OversightRequestsView() {
  const [municipalityFilter, setMunicipalityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [triagedFilter, setTriagedFilter] = useState("ALL");
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page, setPage, limit, setLimit } = useAdminListParams(
    `${municipalityFilter}:${statusFilter}:${triagedFilter}`,
  );
  const query = useGetAllServiceRequests({
    searchTerm: debouncedSearch || undefined,
    municipalityId: municipalityFilter !== "ALL" ? municipalityFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    unTriaged: triagedFilter === "UNTRIAGED" ? true : undefined,
    page,
    limit,
  });
  const municipalitiesQuery = useGetAdminMunicipalities({ limit: 100 });

  const municipalities = (municipalitiesQuery.data?.data ?? []) as { id: string; name: string }[];
  const rows = (query.data?.data ?? []) as ServiceRequest[];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;
  const total = meta?.total ?? rows.length;

  const table = useReactTable({
    data: rows,
    columns: requestColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Requests unavailable"
        body="Service requests could not be loaded. Check your connection and try again."
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
        title="Service requests"
        description="Citizen service demand across the platform — triage state, linkage, history."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard
          label="Requests"
          value={total.toLocaleString()}
          sub="In scope"
          icon={<Inbox className="size-4 text-ink/40" />}
        />
        <AdminStatCard
          label="Untriaged"
          value={
            rows.filter(
              (r) =>
                !(r as { civicIssueId?: string }).civicIssueId &&
                !(r as { civicIssue?: unknown }).civicIssue,
            ).length
          }
          sub="On this page"
        />
        <AdminStatCard
          label="Resolved"
          value={
            rows.filter((r) => ["RESOLVED", "CLOSED"].includes((r.status || "").toUpperCase()))
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
          <Inbox className="size-3.5" />
          {total.toLocaleString()} request{total === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search tracking #, address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={municipalityFilter} onValueChange={setMunicipalityFilter}>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[140px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All statuses
              </SelectItem>
              {REQUEST_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs cursor-pointer">
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={triagedFilter} onValueChange={setTriagedFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[130px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Triage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All triage
              </SelectItem>
              <SelectItem value="UNTRIAGED" className="text-xs cursor-pointer">
                Untriaged
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
                  <td colSpan={requestColumns.length}>
                    <AdminEmptyState
                      title="No requests in scope."
                      body="Adjust filters to widen the lens."
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
                    {selected.trackingNumber}
                  </span>
                  <StatusPill status={selected.status} />
                </div>
                <SheetTitle className="font-display text-xl text-ink leading-tight">
                  Service request
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  {selected.description || "Request detail and tracking history."}
                </SheetDescription>
              </SheetHeader>
              <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/20 text-xs">
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Category</span>
                  <span className="text-ink font-medium truncate">
                    {selected.category?.name || "—"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Linked issue</span>
                  <span className="font-mono text-ink">
                    {selected.civicIssue?.issueNumber ||
                      (selected as { civicIssueId?: string }).civicIssueId?.slice(0, 8) ||
                      "Untriaged"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Submitted</span>
                  <span className="font-mono text-ink">
                    {selected.submittedAt ? format(new Date(selected.submittedAt), "PPP") : "—"}
                  </span>
                </div>
                {selected.location?.address && (
                  <div className="p-3 flex items-center justify-between gap-3">
                    <span className="text-ink/50 font-mono">Location</span>
                    <span className="text-ink font-medium truncate max-w-[220px]">
                      {selected.location.address}
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-line">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full cursor-pointer text-xs"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface FeedbackRow {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  citizen?: { firstName?: string; lastName?: string };
  serviceRequest?: { trackingNumber?: string };
}

const feedbackColumns: ColumnDef<FeedbackRow, unknown>[] = [
  {
    accessorKey: "rating",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Rating</span>
    ),
    cell: ({ row }) => (
      <span
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${row.original.rating} of 5`}
      >
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              "size-3",
              s <= row.original.rating
                ? "fill-signal-progress text-signal-progress"
                : "text-ink/20",
            )}
          />
        ))}
      </span>
    ),
  },
  {
    accessorKey: "comment",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Comment
      </span>
    ),
    cell: ({ row }) => (
      <div className="min-w-0 max-w-md">
        <p className="text-xs text-ink/80 italic truncate">
          {row.original.comment ? `"${row.original.comment}"` : "No comment"}
        </p>
        <p className="font-mono text-[10px] text-ink/45">
          {row.original.citizen
            ? `${row.original.citizen.firstName ?? ""} ${row.original.citizen.lastName ?? ""}`.trim()
            : "Verified citizen"}
          {row.original.serviceRequest?.trackingNumber
            ? ` · ${row.original.serviceRequest.trackingNumber}`
            : ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Left</span>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-mono text-ink/50">
        {row.original.createdAt ? format(new Date(row.original.createdAt), "MMM d, yyyy") : "—"}
      </span>
    ),
  },
];

export function OversightFeedbackView() {
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const { search, setSearch, debouncedSearch, page, setPage, limit, setLimit } =
    useAdminListParams(ratingFilter);
  const query = useGetAllFeedback({
    searchTerm: debouncedSearch || undefined,
    rating: ratingFilter !== "ALL" ? Number(ratingFilter) : undefined,
    page,
    limit,
  });

  const rows = (query.data?.data ?? []) as FeedbackRow[];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;
  const total = meta?.total ?? rows.length;

  const table = useReactTable({
    data: rows,
    columns: feedbackColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Feedback unavailable"
        body="Citizen feedback could not be loaded. Check your connection and try again."
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
        title="Feedback"
        description="Satisfaction signals across the platform — ratings and citizen comments."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard
          label="Reviews"
          value={total.toLocaleString()}
          sub="In scope"
          icon={<MessageSquareHeart className="size-4 text-ink/40" />}
        />
        <AdminStatCard
          label="Positive"
          value={rows.filter((f) => f.rating >= 4).length}
          sub="4–5 stars on this page"
        />
        <AdminStatCard
          label="Critical"
          value={rows.filter((f) => f.rating <= 2).length}
          sub="1–2 stars on this page"
        />
        <AdminStatCard
          label="Page"
          value={rows.length}
          sub={`Showing page ${meta?.page ?? page}`}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <MessageSquareHeart className="size-3.5" />
          {total.toLocaleString()} review{total === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search comments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[130px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All ratings
              </SelectItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={String(r)} className="text-xs cursor-pointer">
                  {r} star{r === 1 ? "" : "s"}
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
                  <td colSpan={feedbackColumns.length}>
                    <AdminEmptyState
                      title="No feedback in scope."
                      body="Adjust filters to widen the lens."
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
              <SheetHeader className="space-y-2 text-left">
                <span className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "size-4",
                        s <= selected.rating
                          ? "fill-signal-progress text-signal-progress"
                          : "text-ink/20",
                      )}
                    />
                  ))}
                  <span className="font-mono text-sm font-semibold text-ink ml-1.5">
                    {selected.rating}/5
                  </span>
                </span>
                <SheetTitle className="font-display text-xl text-ink">
                  {selected.serviceRequest?.trackingNumber || "Citizen review"}
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60">
                  {selected.createdAt ? format(new Date(selected.createdAt), "PPP p") : ""}
                  {selected.citizen?.firstName
                    ? ` · ${selected.citizen.firstName} ${selected.citizen.lastName || ""}`.trim()
                    : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="p-4 rounded-lg bg-field/30 border border-line text-sm font-body text-ink/90 italic leading-relaxed">
                {selected.comment ? `"${selected.comment}"` : "No written comments submitted."}
              </div>
              <div className="pt-4 border-t border-line">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full cursor-pointer text-xs"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
