"use client";

import { DataTable } from "@/components/layout/dashboard/DataTable";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import {
  AdminPagination,
  AdminSectionSkeleton,
  AdminToolbar,
  StatusBadge,
} from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { Button } from "@/components/ui/button";
import { useGetAllFeedback, useGetAllServiceRequests } from "@/hooks";

interface ServiceRequestRow {
  id: string;
  trackingNumber: string;
  description?: string;
  status: string;
  submittedAt?: string;
}

interface FeedbackRow {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  citizen?: { firstName?: string; lastName?: string };
  serviceRequest?: { trackingNumber?: string };
}

export function OversightRequestsView() {
  const { search, setSearch, debouncedSearch, page, setPage, limit } = useAdminListParams();
  const query = useGetAllServiceRequests({
    searchTerm: debouncedSearch || undefined,
    page,
    limit,
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

  const rows = (query.data?.data ?? []) as ServiceRequestRow[];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by tracking number…"
        resultCount={meta?.total}
      />
      <DataTable<ServiceRequestRow>
        columns={[
          {
            key: "request",
            header: "Request",
            render: (row) => (
              <div className="flex flex-col">
                <span className="block max-w-md truncate font-medium text-ink">
                  {row.description || "—"}
                </span>
                <span className="font-mono text-xs text-ink/50">{row.trackingNumber}</span>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: "submitted",
            header: "Submitted",
            align: "right",
            render: (row) => (
              <span className="font-body text-xs text-ink/60">
                {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "—"}
              </span>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No requests in scope"
        emptyBody="Service requests across the platform will appear here."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />
    </div>
  );
}

export function OversightFeedbackView() {
  const { search, setSearch, debouncedSearch, page, setPage, limit } = useAdminListParams();
  const query = useGetAllFeedback({
    searchTerm: debouncedSearch || undefined,
    page,
    limit,
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

  const rows = (query.data?.data ?? []) as FeedbackRow[];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search comments…"
        resultCount={meta?.total}
      />
      <DataTable<FeedbackRow>
        columns={[
          {
            key: "rating",
            header: "Rating",
            render: (row) => (
              <span
                className="font-mono text-sm text-ink"
                role="img"
                aria-label={`${row.rating} out of 5`}
              >
                {"★".repeat(row.rating)}
                <span className="text-ink/25">{"★".repeat(Math.max(0, 5 - row.rating))}</span>
              </span>
            ),
          },
          {
            key: "comment",
            header: "Comment",
            render: (row) => (
              <div className="flex flex-col">
                <span className="block max-w-md truncate font-body text-sm text-ink/85">
                  {row.comment || "—"}
                </span>
                <span className="font-body text-xs text-ink/50">
                  {row.citizen
                    ? `${row.citizen.firstName ?? ""} ${row.citizen.lastName ?? ""}`.trim()
                    : ""}
                  {row.serviceRequest?.trackingNumber
                    ? ` · ${row.serviceRequest.trackingNumber}`
                    : ""}
                </span>
              </div>
            ),
          },
          {
            key: "created",
            header: "Left",
            align: "right",
            render: (row) => (
              <span className="font-body text-xs text-ink/60">
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
              </span>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No feedback yet"
        emptyBody="Citizen satisfaction feedback will appear here."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />
    </div>
  );
}
