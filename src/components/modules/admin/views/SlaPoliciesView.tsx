"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/layout/dashboard/DataTable";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import {
  AdminConfirmDialog,
  AdminFormDialog,
  type AdminFormField,
  AdminSectionSkeleton,
  AdminToolbar,
} from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCreateSlaPolicy,
  useDeleteSlaPolicy,
  useGetAdminCategories,
  useGetAdminSlaPolicies,
  useUpdateSlaPolicy,
} from "@/hooks";
import type { AdminSlaPolicy } from "@/types";
import { slaPolicyFormSchema } from "@/validation";

function formatMinutes(min?: number): string {
  if (min == null) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const FIELDS: AdminFormField[] = [
  {
    name: "responseMinutes",
    label: "Response target (minutes)",
    type: "number",
    placeholder: "e.g. 240",
  },
  {
    name: "resolutionMinutes",
    label: "Resolution target (minutes)",
    type: "number",
    placeholder: "e.g. 2880",
  },
  {
    name: "assignmentType",
    label: "Assignment",
    type: "select",
    optional: true,
    options: [
      { value: "INDIVIDUAL", label: "Individual" },
      { value: "TEAM", label: "Team" },
    ],
  },
  { name: "categoryId", label: "Category ID", type: "text", placeholder: "UUID", optional: true },
  {
    name: "municipalityId",
    label: "Municipality ID",
    type: "text",
    placeholder: "UUID",
    optional: true,
  },
  { name: "priorityId", label: "Priority ID", type: "text", placeholder: "UUID", optional: true },
];

export function SlaPoliciesView({ municipalityId }: { municipalityId?: string } = {}) {
  const { search, setSearch } = useAdminListParams(municipalityId);
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; row?: AdminSlaPolicy } | null>(
    null,
  );
  const [deleting, setDeleting] = useState<AdminSlaPolicy | null>(null);

  const query = useGetAdminSlaPolicies(municipalityId ? { municipalityId } : undefined);
  const categoriesQuery = useGetAdminCategories({ limit: 100 });
  const createMutation = useCreateSlaPolicy();
  const updateMutation = useUpdateSlaPolicy();
  const deleteMutation = useDeleteSlaPolicy();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="SLA policies unavailable"
        body="SLA policies could not be loaded. Check your connection and try again."
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

  const rows = (query.data?.data ?? []).filter((row) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return `${row.category?.name ?? ""} ${categoryName(row.categoryId) ?? ""} ${row.priority?.name ?? ""} ${row.municipality?.name ?? ""}`
      .toLowerCase()
      .includes(term);
  });
  const categoryName = (id?: string) =>
    (categoriesQuery.data?.data ?? []).find((c) => c.id === id)?.name;

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter by category or priority…"
        resultCount={rows.length}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ mode: "create" })}
            className="cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create SLA policy
          </Button>
        }
      />

      <DataTable<AdminSlaPolicy>
        columns={[
          {
            key: "scope",
            header: "Scope",
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-medium text-ink">
                  {row.category?.name || categoryName(row.categoryId) || "Global"}
                </span>
                <span className="font-mono text-xs text-ink/50">
                  {row.priority?.name || row.priority?.code || "Any priority"}
                  {row.municipality?.name ? ` · ${row.municipality.name}` : ""}
                </span>
              </div>
            ),
          },
          {
            key: "response",
            header: "Respond in",
            align: "right",
            render: (row) => (
              <span className="font-mono text-xs text-ink/80">
                {formatMinutes(row.responseMinutes)}
              </span>
            ),
          },
          {
            key: "resolution",
            header: "Resolve in",
            align: "right",
            render: (row) => (
              <span className="font-mono text-xs text-ink/80">
                {formatMinutes(row.resolutionMinutes)}
              </span>
            ),
          },
          {
            key: "version",
            header: "Version",
            align: "right",
            render: (row) => (
              <span className="font-mono text-xs text-ink/60">v{row.version ?? 1}</span>
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
                  <DropdownMenuItem
                    onClick={() => setDialog({ mode: "edit", row })}
                    className="cursor-pointer"
                  >
                    Edit targets
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
        emptyTitle="No SLA policies yet"
        emptyBody="Resolution and response targets will appear here."
      />

      <AdminFormDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title={dialog?.mode === "edit" ? "Edit SLA targets" : "Create SLA policy"}
        fields={FIELDS}
        schema={slaPolicyFormSchema}
        defaultValues={
          dialog?.mode === "edit" && dialog.row
            ? {
                responseMinutes: dialog.row.responseMinutes,
                resolutionMinutes: dialog.row.resolutionMinutes,
                assignmentType: dialog.row.assignmentType ?? "",
                categoryId: dialog.row.categoryId ?? "",
                municipalityId: dialog.row.municipalityId ?? "",
                priorityId: dialog.row.priorityId ?? "",
              }
            : {
                responseMinutes: "",
                resolutionMinutes: "",
                assignmentType: "",
                categoryId: "",
                municipalityId: "",
                priorityId: "",
              }
        }
        submitLabel={dialog?.mode === "edit" ? "Save changes" : "Create"}
        pending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const payload = Object.fromEntries(
            Object.entries(values).filter(([, v]) => v !== "" && !Number.isNaN(v)),
          );
          if (dialog?.mode === "edit" && dialog.row) {
            const { categoryId: _c, municipalityId: _m, priorityId: _p, ...rest } = payload;
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
        title="Delete SLA policy"
        body="This policy will be permanently deleted. Issues fall back to the next matching policy."
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
