"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DataTable } from "@/components/layout/dashboard/DataTable";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import {
  AdminConfirmDialog,
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
import { ADMIN_USER_STATUSES } from "@/constant/admin.constant";
import { useDeleteUser, useGetUsers, useRestoreUser, useUpdateUserStatus } from "@/hooks";
import type { AdminUser } from "@/types";

function roleCodes(row: AdminUser): string {
  const codes = (row.userRoles ?? []).map((ur) => ur?.role?.code || ur?.role?.name).filter(Boolean);
  return codes.join(", ") || "—";
}

export function UsersView() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || undefined;
  const { search, setSearch, debouncedSearch, page, setPage, limit } =
    useAdminListParams(statusFilter);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const query = useGetUsers({
    searchTerm: debouncedSearch || undefined,
    status: statusFilter,
    page,
    limit,
  });
  const statusMutation = useUpdateUserStatus();
  const restoreMutation = useRestoreUser();
  const deleteMutation = useDeleteUser();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Users unavailable"
        body="Platform accounts could not be loaded. Check your connection and try again."
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
        searchPlaceholder="Search by email or phone…"
        resultCount={meta?.total}
      />
      {statusFilter ? (
        <p className="font-body text-xs text-ink/55">
          Showing accounts with status <StatusBadge status={statusFilter} /> —{" "}
          <Link href="/system/users" className="cursor-pointer underline underline-offset-2">
            clear filter
          </Link>
        </p>
      ) : null}

      <DataTable<AdminUser>
        columns={[
          {
            key: "user",
            header: "User",
            render: (row) => (
              <div className="flex flex-col">
                <Link
                  href={`/system/users/${row.id}`}
                  className="cursor-pointer font-medium text-ink underline-offset-4 hover:underline"
                >
                  {row.displayName || row.email}
                </Link>
                <span className="font-body text-xs text-ink/50">
                  {row.email}
                  {row.phone ? ` · ${row.phone}` : ""}
                </span>
              </div>
            ),
          },
          {
            key: "roles",
            header: "Roles",
            render: (row) => (
              <span className="font-mono text-xs text-ink/70">{roleCodes(row)}</span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: "verified",
            header: "Verified",
            render: (row) => (
              <span className="font-body text-sm text-ink/70">
                {row.isEmailVerified ? "Yes" : "No"}
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
                    <Link href={`/system/users/${row.id}`}>View profile</Link>
                  </DropdownMenuItem>
                  {ADMIN_USER_STATUSES.filter((s) => s !== row.status?.toUpperCase()).map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => statusMutation.mutate({ id: row.id, status: s })}
                      className="cursor-pointer"
                    >
                      Mark {s.toLowerCase()}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={() => restoreMutation.mutate(row.id)}
                    className="cursor-pointer"
                  >
                    Restore
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
        emptyTitle="No users found"
        emptyBody="Try a different search, or clear the status filter."
      />
      <AdminPagination meta={meta} onPageChange={setPage} />

      <AdminConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Remove user"
        body={`"${deleting?.email}" will be soft-deleted. The account can be restored later.`}
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
