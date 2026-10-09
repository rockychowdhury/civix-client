"use client";

import { useState } from "react";
import z from "zod";
import { DataTable } from "@/components/layout/dashboard/DataTable";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import {
  AdminFormDialog,
  type AdminFormField,
  AdminPagination,
  AdminSectionSkeleton,
  AdminToolbar,
  StatusBadge,
} from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAllCivicIssues, useOverrideIssueStatus, useReopenCivicIssue } from "@/hooks";
import type { CivicIssue } from "@/types";

const overrideSchema = z.object({
  status: z.string().min(1, "Status is required"),
  notes: z.string().max(500).optional(),
});

const STATUS_FIELDS: AdminFormField[] = [
  {
    name: "status",
    label: "New status",
    type: "select",
    options: [
      "SUBMITTED",
      "TRIAGED",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
      "CANCELLED",
    ].map((s) => ({ value: s, label: s })),
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Why the override?",
    optional: true,
  },
];

export function OversightIssuesView() {
  const { search, setSearch, debouncedSearch, page, setPage, limit } = useAdminListParams();
  const [overriding, setOverriding] = useState<CivicIssue | null>(null);

  const query = useGetAllCivicIssues({
    searchTerm: debouncedSearch || undefined,
    page,
    limit,
  });
  const overrideMutation = useOverrideIssueStatus();
  const reopenMutation = useReopenCivicIssue();

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

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by number, title…"
        resultCount={meta?.total}
      />

      <DataTable<CivicIssue>
        columns={[
          {
            key: "issue",
            header: "Issue",
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-medium text-ink">{row.title}</span>
                <span className="font-mono text-xs text-ink/50">{row.issueNumber}</span>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: "reports",
            header: "Reports",
            align: "right",
            render: (row) => (
              <span className="font-mono text-xs text-ink/70">{row.reportedCount}</span>
            ),
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (row) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="secondary" size="sm" className="cursor-pointer">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOverriding(row)} className="cursor-pointer">
                    Override status
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => reopenMutation.mutate(row.id)}
                    className="cursor-pointer"
                  >
                    Reopen issue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No issues in scope"
        emptyBody="Cross-municipality civic issues will appear here for inspection."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />

      <AdminFormDialog
        open={overriding !== null}
        onOpenChange={(open) => {
          if (!open) setOverriding(null);
        }}
        title={`Override ${overriding?.issueNumber ?? "issue"}`}
        description="Platform override — recorded in the issue history."
        fields={STATUS_FIELDS}
        schema={overrideSchema}
        defaultValues={{ status: "", notes: "" }}
        submitLabel="Apply override"
        pending={overrideMutation.isPending}
        onSubmit={(values) => {
          if (overriding) {
            overrideMutation.mutate(
              {
                id: overriding.id,
                payload: {
                  status: values.status as string,
                  notes: (values.notes as string) || undefined,
                },
              },
              { onSuccess: () => setOverriding(null) },
            );
          }
        }}
      />
    </div>
  );
}
