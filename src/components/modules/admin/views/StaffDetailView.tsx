"use client";

import { useParams } from "next/navigation";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton, StatusBadge } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { useGetStaffById, useUpdateStaffStatus } from "@/hooks";

export function StaffDetailView() {
  const params = useParams<{ id: string }>();
  const query = useGetStaffById(params.id);
  const statusMutation = useUpdateStaffStatus();

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError || query.data?.data == null) {
    return (
      <EmptyState
        title="Staff member not found"
        body="This profile could not be loaded. It may have been removed."
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

  const row = query.data.data;
  const active = row.user?.status?.toUpperCase() === "ACTIVE";

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-medium text-ink">
          {row.firstName} {row.lastName}
        </h2>
        <StatusBadge status={row.user?.status} />
      </div>

      <dl className="flex flex-col">
        {[
          ["Email", row.user?.email],
          ["Phone", row.phone],
          ["Designation", row.designation],
          ["Department", row.departmentMembers?.[0]?.department?.name],
          ["Workload", row.maxWorkload ? `${row.currentWorkload ?? 0} / ${row.maxWorkload}` : null],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="flex flex-col gap-1 border-t border-line/25 py-3 first:border-t-0 first:pt-0"
          >
            <dt className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/50">
              {label}
            </dt>
            <dd className="font-body text-sm text-ink">{(value as string) || "—"}</dd>
          </div>
        ))}
      </dl>

      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={statusMutation.isPending}
          onClick={() =>
            statusMutation.mutate({ id: row.userId, status: active ? "INACTIVE" : "ACTIVE" })
          }
          className="cursor-pointer"
        >
          {active ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );
}
