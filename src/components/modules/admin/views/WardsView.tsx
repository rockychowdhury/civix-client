"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/layout/dashboard/DataTable";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import {
  AdminConfirmDialog,
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
import { COVERAGE_STATUSES } from "@/constant/admin.constant";
import {
  useCreateWard,
  useDeleteWard,
  useGetAdminWards,
  useGetAdminZones,
  useGetWardDepartments,
  useUpdateWard,
} from "@/hooks";
import type { AdminWard } from "@/types";
import { wardFormSchema } from "@/validation";

export function WardsView({ municipalityId }: { municipalityId?: string } = {}) {
  const { search, setSearch, debouncedSearch, page, setPage, limit } =
    useAdminListParams(municipalityId);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; row?: AdminWard } | null>(null);
  const [deleting, setDeleting] = useState<AdminWard | null>(null);
  const [coverageFor, setCoverageFor] = useState<AdminWard | null>(null);

  const query = useGetAdminWards({
    searchTerm: debouncedSearch || undefined,
    municipalityId,
    page,
    limit,
  });
  const zonesQuery = useGetAdminZones(municipalityId ? { municipalityId, limit: 100 } : { limit: 100 });
  const coverageQuery = useGetWardDepartments(coverageFor?.id ?? "");
  const createMutation = useCreateWard();
  const updateMutation = useUpdateWard();
  const deleteMutation = useDeleteWard();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Wards unavailable"
        body="Wards could not be loaded. Check your connection and try again."
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
  const meta = query.data?.meta;
  const zones = zonesQuery.data?.data ?? [];

  const FIELDS: AdminFormField[] = [
    { name: "name", label: "Name", type: "text", placeholder: "e.g. Ward 12" },
    { name: "number", label: "Ward number", type: "number", placeholder: "e.g. 12" },
    {
      name: "zoneId",
      label: "Zone",
      type: "select",
      options: zones.map((z) => ({ value: z.id, label: z.name })),
    },
    {
      name: "coverageStatus",
      label: "Coverage status",
      type: "select",
      optional: true,
      options: COVERAGE_STATUSES.map((s) => ({ value: s, label: s })),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search wards…"
        resultCount={meta?.total}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ mode: "create" })}
            className="cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create ward
          </Button>
        }
      />

      <DataTable<AdminWard>
        columns={[
          {
            key: "ward",
            header: "Ward",
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-medium text-ink">{row.name}</span>
                <span className="font-mono text-xs text-ink/50">#{row.number}</span>
              </div>
            ),
          },
          {
            key: "coverage",
            header: "Coverage",
            render: (row) => <StatusBadge status={row.coverageStatus} />,
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
                  <DropdownMenuItem onClick={() => setCoverageFor(row)} className="cursor-pointer">
                    View departments
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDialog({ mode: "edit", row })}
                    className="cursor-pointer"
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleting(row)}
                    className="cursor-pointer text-signal-open focus:text-signal-open"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No wards yet"
        emptyBody="Wards with their parent zones will appear here."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />

      {coverageFor ? (
        <div className="flex flex-col gap-2 border-t border-line/25 pt-4">
          <h3 className="font-display text-base font-medium text-ink">
            Departments covering {coverageFor.name}
          </h3>
          {coverageQuery.isLoading ? (
            <p className="font-body text-sm text-ink/55">Loading departments…</p>
          ) : (
            <p className="font-body text-sm text-ink/65">
              {((coverageQuery.data?.data ?? []) as { name?: string }[]).length > 0
                ? ((coverageQuery.data?.data ?? []) as { name?: string }[])
                    .map((d) => d.name)
                    .join(", ")
                : "No departments mapped to this ward yet."}{" "}
              <button
                type="button"
                onClick={() => setCoverageFor(null)}
                className="cursor-pointer underline underline-offset-2"
              >
                Hide
              </button>
            </p>
          )}
        </div>
      ) : null}

      <AdminFormDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title={dialog?.mode === "edit" ? "Edit ward" : "Create ward"}
        fields={FIELDS}
        schema={wardFormSchema}
        defaultValues={
          dialog?.mode === "edit" && dialog.row
            ? {
                name: dialog.row.name,
                number: dialog.row.number,
                zoneId: dialog.row.zoneId,
                coverageStatus: dialog.row.coverageStatus ?? "",
              }
            : { name: "", number: "", zoneId: "", coverageStatus: "" }
        }
        submitLabel={dialog?.mode === "edit" ? "Save changes" : "Create"}
        pending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const payload = Object.fromEntries(
            Object.entries(values).filter(([, v]) => v !== "" && !Number.isNaN(v)),
          );
          if (dialog?.mode === "edit" && dialog.row) {
            updateMutation.mutate(
              { id: dialog.row.id, payload },
              { onSuccess: () => setDialog(null) },
            );
          } else {
            createMutation.mutate(payload as never, { onSuccess: () => setDialog(null) });
          }
        }}
      />

      <AdminConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete ward"
        body={`"${deleting?.name}" will be permanently deleted.`}
        confirmLabel="Delete"
        pending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) {
            deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
          }
        }}
      />
    </div>
  );
}
