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
import { useGetDepartments } from "@/hooks/department.hook";
import { useGetAllStaff } from "@/hooks/staff.hook";
import { useCreateTeam, useDeleteTeam, useGetTeams, useUpdateTeam } from "@/hooks/team.hook";
import type { ITeam } from "@/types";
import { adminTeamFormSchema } from "@/validation";

export function TeamsView() {
  const { search, setSearch, debouncedSearch, page, setPage, limit } = useAdminListParams();
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; row?: ITeam } | null>(null);
  const [deleting, setDeleting] = useState<ITeam | null>(null);

  const query = useGetTeams({ searchTerm: debouncedSearch || undefined, page, limit });
  const departmentsQuery = useGetDepartments();
  const staffQuery = useGetAllStaff({ limit: 100 });
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const deleteMutation = useDeleteTeam();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Teams unavailable"
        body="Teams could not be loaded. Check your connection and try again."
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
  const departments = departmentsQuery.data?.data ?? [];
  const staff = staffQuery.data?.data ?? [];

  const fields: AdminFormField[] = [
    { name: "name", label: "Name", type: "text", placeholder: "e.g. Road Squad Alpha" },
    { name: "code", label: "Code", type: "text", placeholder: "e.g. ROAD-A" },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      options: departments.map((d: { id: string; name: string }) => ({
        value: d.id,
        label: d.name,
      })),
    },
    {
      name: "leaderId",
      label: "Leader",
      type: "select",
      optional: true,
      options: staff.map((s) => ({
        value: s.userId,
        label: `${s.firstName} ${s.lastName}`,
      })),
    },
    ...(dialog?.mode === "edit"
      ? [
          {
            name: "status",
            label: "Status",
            type: "select" as const,
            options: ["ACTIVE", "INACTIVE", "DISBANDED"].map((s) => ({ value: s, label: s })),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search teams…"
        resultCount={meta?.total}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setDialog({ mode: "create" })}
            className="cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create team
          </Button>
        }
      />

      <DataTable<ITeam>
        columns={[
          {
            key: "team",
            header: "Team",
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-medium text-ink">{row.name}</span>
                <span className="font-mono text-xs text-ink/50">{row.code}</span>
              </div>
            ),
          },
          {
            key: "leader",
            header: "Leader",
            render: (row) =>
              row.leader ? (
                <span className="font-body text-sm text-ink/80">
                  {row.leader.firstName} {row.leader.lastName}
                </span>
              ) : (
                <span className="font-body text-sm text-ink/40">No leader</span>
              ),
          },
          {
            key: "members",
            header: "Members",
            align: "right",
            render: (row) => (
              <span className="font-mono text-xs text-ink/70">
                {(row as unknown as { _count?: { members?: number } })._count?.members ??
                  row.members?.length ??
                  0}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />,
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
        emptyTitle="No teams yet"
        emptyBody="Teams with leaders and members will appear here."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />

      <AdminFormDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title={dialog?.mode === "edit" ? "Edit team" : "Create team"}
        fields={fields}
        schema={adminTeamFormSchema}
        defaultValues={
          dialog?.mode === "edit" && dialog.row
            ? {
                name: dialog.row.name,
                code: dialog.row.code,
                departmentId: dialog.row.departmentId,
                leaderId: dialog.row.leaderId ?? "",
                status: dialog.row.status,
              }
            : { name: "", code: "", departmentId: "", leaderId: "" }
        }
        submitLabel={dialog?.mode === "edit" ? "Save changes" : "Create"}
        pending={createMutation.isPending || updateMutation.isPending}
        onSubmit={(values) => {
          const payload = Object.fromEntries(
            Object.entries(values).filter(([, v]) => v !== ""),
          ) as Record<string, string>;
          if (dialog?.mode === "edit" && dialog.row) {
            updateMutation.mutate(
              {
                id: dialog.row.id,
                payload: {
                  name: payload.name,
                  status: payload.status,
                  leaderId: payload.leaderId,
                },
              },
              { onSuccess: () => setDialog(null) },
            );
          } else {
            createMutation.mutate(
              {
                name: payload.name,
                code: payload.code,
                departmentId: payload.departmentId,
                leaderId: payload.leaderId || undefined,
              },
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
        title="Delete team"
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
