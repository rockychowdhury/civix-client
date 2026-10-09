"use client";

import { DataTable } from "@/components/layout/dashboard/DataTable";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton, AdminToolbar } from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { Button } from "@/components/ui/button";
import { useGetPermissions } from "@/hooks";
import type { AdminPermission } from "@/types";

export function PermissionsView() {
  const { search, setSearch, debouncedSearch } = useAdminListParams();
  const query = useGetPermissions();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError) {
    return (
      <EmptyState
        title="Permissions unavailable"
        body="The permission catalogue could not be loaded. Check your connection and try again."
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

  const term = debouncedSearch.trim().toLowerCase();
  const rows = (query.data?.data ?? []).filter((p) =>
    term ? `${p.action}:${p.resource} ${p.description ?? ""}`.toLowerCase().includes(term) : true,
  );

  return (
    <div className="flex flex-col gap-5">
      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search action, resource…"
        resultCount={rows.length}
      />
      <DataTable<AdminPermission>
        columns={[
          {
            key: "permission",
            header: "Permission",
            render: (row) => (
              <span className="font-mono text-sm text-ink">
                {row.action}:{row.resource}
              </span>
            ),
          },
          {
            key: "description",
            header: "Description",
            render: (row) => (
              <span className="font-body text-sm text-ink/65">{row.description || "—"}</span>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No permissions match"
        emptyBody="Try a different search term."
      />
    </div>
  );
}
