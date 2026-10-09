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
  useCreateZone,
  useDeleteZone,
  useGetAdminZones,
  useGetWardsByZone,
  useUpdateZone,
} from "@/hooks";
import { useGetAdminMunicipalities } from "@/hooks/municipality.hook";
import type { AdminZone } from "@/types";
import { zoneFormSchema } from "@/validation";

export function ZonesView({ municipalityId }: { municipalityId?: string } = {}) {
  const { search, setSearch, debouncedSearch, page, setPage, limit } =
    useAdminListParams(municipalityId);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; row?: AdminZone } | null>(null);
  const [deleting, setDeleting] = useState<AdminZone | null>(null);
  const [coverageFor, setCoverageFor] = useState<AdminZone | null>(null);

  const query = useGetAdminZones({
    searchTerm: debouncedSearch || undefined,
    municipalityId,
    page,
    limit,
  });
  const municipalitiesQuery = useGetAdminMunicipalities({ limit: 100 });
  const coverageQuery = useGetWardsByZone(coverageFor?.id ?? "");
  const createMutation = useCreateZone();
  const updateMutation = useUpdateZone();
  const deleteMutation = useDeleteZone();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Zones unavailable"
        body="Zones could not be loaded. Check your connection and try again."
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
  const municipalities = municipalitiesQuery.data?.data ?? [];

  const FIELDS: AdminFormField[] = [
    { name: "name", label: "Name", type: "text", placeholder: "e.g. Zone 4" },
    ...(municipalityId
      ? []
      : [
          {
            name: "municipalityId",
            label: "Municipality",
            type: "select" as const,
            options: municipalities.map((m) => ({ value: m.id, label: `${m.name} (${m.code})` })),
          },
        ]),
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
        searchPlaceholder="Search zones…"
        resultCount={meta?.total}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ mode: "create" })}
            className="cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create zone
          </Button>
        }
      />

      <DataTable<AdminZone>
        columns={[
          {
            key: "zone",
            header: "Zone",
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-medium text-ink">{row.name}</span>
                <span className="font-mono text-xs text-ink/50">{row.id.slice(0, 8)}…</span>
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
                    View wards
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
        emptyTitle="No zones yet"
        emptyBody="Zones across every municipality will appear here."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />

      {coverageFor ? (
        <div className="flex flex-col gap-2 border-t border-line/25 pt-4">
          <h3 className="font-display text-base font-medium text-ink">
            Wards in {coverageFor.name}
          </h3>
          {coverageQuery.isLoading ? (
            <p className="font-body text-sm text-ink/55">Loading wards…</p>
          ) : (
            <p className="font-body text-sm text-ink/65">
              {((coverageQuery.data?.data ?? []) as { name?: string }[]).length > 0
                ? ((coverageQuery.data?.data ?? []) as { name?: string }[])
                    .map((w) => w.name)
                    .join(", ")
                : "No wards in this zone yet."}{" "}
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
        title={dialog?.mode === "edit" ? "Edit zone" : "Create zone"}
        fields={FIELDS}
        schema={zoneFormSchema}
        defaultValues={
          dialog?.mode === "edit" && dialog.row
            ? {
                name: dialog.row.name,
                municipalityId: dialog.row.municipalityId,
                coverageStatus: dialog.row.coverageStatus ?? "",
              }
            : { name: "", municipalityId: "", coverageStatus: "" }
        }
        submitLabel={dialog?.mode === "edit" ? "Save changes" : "Create"}
        pending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ""));
          if (dialog?.mode === "edit" && dialog.row) {
            const { municipalityId: _omit, ...rest } = payload;
            updateMutation.mutate(
              { id: dialog.row.id, payload: rest },
              { onSuccess: () => setDialog(null) },
            );
          } else {
            createMutation.mutate(
              (municipalityId ? { ...payload, municipalityId } : payload) as never,
              { onSuccess: () => setDialog(null) },
            );
          }
        }}
      />

      <AdminConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete zone"
        body={`"${deleting?.name}" will be permanently deleted along with its ward mappings.`}
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
