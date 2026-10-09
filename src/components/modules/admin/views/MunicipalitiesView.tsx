"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
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
  useCreateMunicipality,
  useDeleteMunicipality,
  useGetAdminMunicipalities,
  useUpdateMunicipality,
} from "@/hooks";
import type { AdminMunicipality } from "@/types";
import { municipalityFormSchema } from "@/validation";

const FIELDS: AdminFormField[] = [
  { name: "name", label: "Name", type: "text", placeholder: "e.g. Dhaka North" },
  { name: "code", label: "Code", type: "text", placeholder: "e.g. DNCC" },
  {
    name: "countryCode",
    label: "Country code",
    type: "text",
    placeholder: "e.g. BD",
    optional: true,
  },
  {
    name: "timezone",
    label: "Timezone",
    type: "text",
    placeholder: "e.g. Asia/Dhaka",
    optional: true,
  },
  {
    name: "coverageStatus",
    label: "Coverage status",
    type: "select",
    optional: true,
    options: COVERAGE_STATUSES.map((s) => ({ value: s, label: s })),
  },
];

export function MunicipalitiesView() {
  const { search, setSearch, debouncedSearch, page, setPage, limit } = useAdminListParams();
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; row?: AdminMunicipality } | null>(
    null,
  );
  const [deleting, setDeleting] = useState<AdminMunicipality | null>(null);

  const query = useGetAdminMunicipalities({
    searchTerm: debouncedSearch || undefined,
    page,
    limit,
  });
  const createMutation = useCreateMunicipality();
  const updateMutation = useUpdateMunicipality();
  const deleteMutation = useDeleteMunicipality();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Municipalities unavailable"
        body="Tenant data could not be loaded. Check your connection and try again."
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

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or code…"
        resultCount={meta?.total}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ mode: "create" })}
            className="cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Onboard municipality
          </Button>
        }
      />

      <DataTable<AdminMunicipality>
        columns={[
          {
            key: "name",
            header: "Municipality",
            render: (row) => (
              <div className="flex flex-col">
                <Link
                  href={`/system/municipalities/${row.id}`}
                  className="cursor-pointer font-medium text-ink underline-offset-4 hover:underline"
                >
                  {row.name}
                </Link>
                <span className="font-mono text-xs text-ink/50">{row.code}</span>
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
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/system/municipalities/${row.id}`}>View details</Link>
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
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No municipalities yet"
        emptyBody="Onboarded municipalities will appear here with search and pagination."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />

      <AdminFormDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title={dialog?.mode === "edit" ? "Edit municipality" : "Onboard municipality"}
        description="Tenants own every department, zone, and issue beneath them."
        fields={FIELDS}
        schema={municipalityFormSchema}
        defaultValues={
          dialog?.mode === "edit" && dialog.row
            ? {
                name: dialog.row.name,
                code: dialog.row.code,
                countryCode: dialog.row.countryCode ?? "",
                timezone: dialog.row.timezone ?? "",
                coverageStatus: dialog.row.coverageStatus ?? "",
              }
            : { name: "", code: "", countryCode: "", timezone: "", coverageStatus: "" }
        }
        submitLabel={dialog?.mode === "edit" ? "Save changes" : "Onboard"}
        pending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ""));
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
        title="Remove municipality"
        body={`"${deleting?.name}" and everything under it will be removed. This cannot be undone.`}
        confirmLabel="Remove"
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
