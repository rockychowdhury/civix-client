"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
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
import { STAFF_PROVISION_KINDS, STAFF_PROVISION_LABEL } from "@/constant/admin.constant";
import type { StaffProvisionKind } from "@/constant/admin.constant";
import {
  useCreateCityAdmin,
  useCreateDepartmentManager,
  useCreateDispatcher,
  useCreatePlatformAdmin,
  useCreateTechnician,
  useGetAllStaff,
  useUpdateStaffStatus,
} from "@/hooks";
import type { ICreateStaffPayload, IStaffProfile } from "@/types";
import { provisionStaffFormSchema } from "@/validation";

export interface StaffViewScope {
  /** Restrict provisionable roles (city admins can't create admins). */
  allowedKinds?: StaffProvisionKind[];
  /** When provided, department becomes a select instead of free text. */
  departmentOptions?: { id: string; name: string }[];
  /** Hide the municipality field (server derives it from requester scope). */
  hideMunicipalityField?: boolean;
}

function buildProvisionFields(scope: StaffViewScope): AdminFormField[] {
  const kinds = scope.allowedKinds ?? [...STAFF_PROVISION_KINDS];
  return [
    {
      name: "kind",
      label: "Role",
      type: "select",
      options: kinds.map((k) => ({ value: k, label: STAFF_PROVISION_LABEL[k] })),
    },
    { name: "firstName", label: "First name", type: "text", placeholder: "e.g. Arif" },
    { name: "lastName", label: "Last name", type: "text", placeholder: "e.g. Rahman" },
    { name: "email", label: "Email", type: "text", placeholder: "name@example.com" },
    { name: "password", label: "Password", type: "text", placeholder: "Min 8 chars, Aa + 0" },
    { name: "phone", label: "Phone", type: "text", placeholder: "01XXXXXXXXX", optional: true },
    {
      name: "designation",
      label: "Designation",
      type: "text",
      placeholder: "e.g. Engineer",
      optional: true,
    },
    scope.departmentOptions
      ? {
          name: "departmentId",
          label: "Department",
          type: "select" as const,
          options: scope.departmentOptions.map((d) => ({ value: d.id, label: d.name })),
        }
      : {
          name: "departmentId",
          label: "Department ID",
          type: "text" as const,
          placeholder: "UUID",
          optional: true,
        },
    ...(scope.hideMunicipalityField
      ? []
      : [
          {
            name: "municipalityId",
            label: "Municipality ID",
            type: "text" as const,
            placeholder: "UUID",
            optional: true,
          },
        ]),
  ];
}

function staffRole(row: IStaffProfile): string {
  const codes = (row.user?.userRoles ?? []).map((ur) => ur?.role?.code).filter(Boolean);
  return codes.join(", ") || "—";
}

export function StaffView({ scope }: { scope?: StaffViewScope } = {}) {
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get("role") || undefined;
  const { search, setSearch, debouncedSearch, page, setPage, limit } =
    useAdminListParams(roleFilter);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const fields = buildProvisionFields(scope ?? {});

  const query = useGetAllStaff({
    searchTerm: debouncedSearch || undefined,
    role: roleFilter,
    page,
    limit,
  });
  const statusMutation = useUpdateStaffStatus();
  const platformAdmin = useCreatePlatformAdmin();
  const cityAdmin = useCreateCityAdmin();
  const manager = useCreateDepartmentManager();
  const dispatcher = useCreateDispatcher();
  const technician = useCreateTechnician();
  const provisioning =
    platformAdmin.isPending ||
    cityAdmin.isPending ||
    manager.isPending ||
    dispatcher.isPending ||
    technician.isPending;

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Staff unavailable"
        body="Staff records could not be loaded. Check your connection and try again."
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
        searchPlaceholder="Search by name, email, or ID…"
        resultCount={meta?.total}
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => setProvisionOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Provision staff
          </Button>
        }
      />
      {roleFilter ? (
        <p className="font-body text-xs text-ink/55">
          Filtered to <span className="font-mono">{roleFilter}</span> —{" "}
          <Link href="/system/staff" className="cursor-pointer underline underline-offset-2">
            show all
          </Link>
        </p>
      ) : null}

      <DataTable<IStaffProfile>
        columns={[
          {
            key: "name",
            header: "Staff",
            render: (row) => (
              <div className="flex flex-col">
                <Link
                  href={`/system/staff/${row.userId}`}
                  className="cursor-pointer font-medium text-ink underline-offset-4 hover:underline"
                >
                  {row.firstName} {row.lastName}
                </Link>
                <span className="font-body text-xs text-ink/50">{row.user?.email}</span>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            render: (row) => (
              <span className="font-mono text-xs text-ink/70">{staffRole(row)}</span>
            ),
          },
          {
            key: "dept",
            header: "Department",
            render: (row) => (
              <span className="font-body text-sm text-ink/80">
                {row.departmentMembers?.[0]?.department?.name || "—"}
              </span>
            ),
          },
          {
            key: "workload",
            header: "Workload",
            align: "right",
            render: (row) => (
              <span className="font-mono text-xs text-ink/70">
                {row.currentWorkload ?? "—"}
                {row.maxWorkload ? ` / ${row.maxWorkload}` : ""}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.user?.status} />,
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
                    <Link href={`/system/staff/${row.userId}`}>View details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      statusMutation.mutate({
                        id: row.userId,
                        status:
                          row.user?.status?.toUpperCase() === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                      })
                    }
                    className="cursor-pointer"
                  >
                    {row.user?.status?.toUpperCase() === "ACTIVE" ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.userId}
        emptyTitle="No staff found"
        emptyBody="Provisioned staff will appear here, filterable by role."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />

      <AdminFormDialog
        open={provisionOpen}
        onOpenChange={setProvisionOpen}
        title="Provision staff"
        description="High-privilege roles are Super Admin only — the API enforces it."
        fields={fields}
        schema={provisionStaffFormSchema}
        defaultValues={{
          kind: "",
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
          designation: "",
          departmentId: "",
          municipalityId: "",
        }}
        submitLabel="Provision"
        pending={provisioning}
        onSubmit={(values) => {
          const { kind, departmentId, municipalityId, phone, designation, ...rest } =
            values as Record<string, string>;
          const payload = {
            ...rest,
            ...(phone ? { phone } : {}),
            ...(designation ? { designation } : {}),
            ...(departmentId ? { departmentId } : {}),
            ...(municipalityId ? { municipalityId } : {}),
          } as ICreateStaffPayload;
          const options = { onSuccess: () => setProvisionOpen(false) };
          if (kind === "platform-admin") platformAdmin.mutate(payload, options);
          else if (kind === "city-admin") cityAdmin.mutate(payload, options);
          else if (kind === "department-manager") manager.mutate(payload, options);
          else if (kind === "dispatcher") dispatcher.mutate(payload, options);
          else technician.mutate(payload, options);
        }}
      />
    </div>
  );
}
