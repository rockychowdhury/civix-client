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
import { useCreateRole, useDeleteRole, useGetRoles, useUpdateRole } from "@/hooks";
import type { AdminRole } from "@/types";
import { roleFormSchema } from "@/validation";

const FIELDS: AdminFormField[] = [
  { name: "name", label: "Name", type: "text", placeholder: "e.g. Ward Supervisor" },
  {
    name: "code",
    label: "Code",
    type: "text",
    placeholder: "e.g. WARD_SUPERVISOR",
    optional: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "What can this role do?",
    optional: true,
  },
];

export function RolesView() {
  const { search, setSearch, debouncedSearch, page, setPage, limit } = useAdminListParams();
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; row?: AdminRole } | null>(null);
  const [deleting, setDeleting] = useState<AdminRole | null>(null);

  const query = useGetRoles({ searchTerm: debouncedSearch || undefined, page, limit });
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Roles unavailable"
        body="Roles could not be loaded. Check your connection and try again."
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
        searchPlaceholder="Search roles…"
        resultCount={meta?.total}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ mode: "create" })}
            className="cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create role
          </Button>
        }
      />

      <DataTable<AdminRole>
        columns={[
          {
            key: "role",
            header: "Role",
            render: (row) => (
              <div className="flex flex-col">
                <Link
                  href={`/system/roles/${row.id}`}
                  className="cursor-pointer font-medium text-ink underline-offset-4 hover:underline"
                >
                  {row.name}
                </Link>
                <span className="font-mono text-xs text-ink/50">{row.code}</span>
              </div>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (row) => <StatusBadge status={row.isSystemRole ? "SYSTEM" : "CUSTOM"} />,
          },
          {
            key: "description",
            header: "Description",
            render: (row) => (
              <span className="block max-w-md truncate font-body text-sm text-ink/65">
                {row.description || "—"}
              </span>
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
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/system/roles/${row.id}`}>Permissions</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDialog({ mode: "edit", row })}
                    className="cursor-pointer"
                  >
                    Edit
                  </DropdownMenuItem>
                  {!row.isSystemRole ? (
                    <DropdownMenuItem
                      onClick={() => setDeleting(row)}
                      className="cursor-pointer text-signal-open focus:text-signal-open"
                    >
                      Delete
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No roles found"
        emptyBody="System and custom roles will appear here."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />

      <AdminFormDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title={dialog?.mode === "edit" ? "Edit role" : "Create role"}
        description="Permissions are assigned from the role detail page."
        fields={FIELDS}
        schema={roleFormSchema}
        defaultValues={
          dialog?.mode === "edit" && dialog.row
            ? {
                name: dialog.row.name,
                code: dialog.row.code,
                description: dialog.row.description ?? "",
              }
            : { name: "", code: "", description: "" }
        }
        submitLabel={dialog?.mode === "edit" ? "Save changes" : "Create"}
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
        title="Delete role"
        body={`"${deleting?.name}" will be permanently deleted. Users holding it lose access.`}
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
