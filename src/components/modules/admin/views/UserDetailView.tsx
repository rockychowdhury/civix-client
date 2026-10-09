"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminConfirmDialog, AdminSectionSkeleton, StatusBadge } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { ADMIN_USER_STATUSES } from "@/constant/admin.constant";
import {
  useAssignRoleToUser,
  useDeleteUser,
  useGetRoles,
  useGetUserById,
  useGetUserRoles,
  useRemoveRoleFromUser,
  useRestoreUser,
  useUpdateUserStatus,
} from "@/hooks";

export function UserDetailView() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const query = useGetUserById(userId);
  const rolesQuery = useGetUserRoles(userId);
  const allRolesQuery = useGetRoles({ limit: 100 });
  const statusMutation = useUpdateUserStatus();
  const restoreMutation = useRestoreUser();
  const deleteMutation = useDeleteUser();
  const assignMutation = useAssignRoleToUser();
  const removeMutation = useRemoveRoleFromUser();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [roleToAssign, setRoleToAssign] = useState("");

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError || query.data?.data == null) {
    return (
      <EmptyState
        title="User not found"
        body="This account could not be loaded. It may have been removed."
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
  const assigned = rolesQuery.data?.data ?? [];
  const assignable = (allRolesQuery.data?.data ?? []).filter(
    (r) => !assigned.some((a) => a.id === r.id),
  );

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-medium text-ink">
          {row.displayName || row.email}
        </h2>
        <StatusBadge status={row.status} />
      </div>

      <dl className="flex flex-col">
        {[
          ["Email", row.email],
          ["Phone", row.phone],
          ["Verified", row.isEmailVerified ? "Yes" : "No"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 border-t border-line/25 py-3 first:border-t-0 first:pt-0"
          >
            <dt className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/50">
              {label}
            </dt>
            <dd className="font-body text-sm text-ink">{value || "—"}</dd>
          </div>
        ))}
      </dl>

      <section aria-label="Moderation" className="flex flex-col gap-3">
        <h3 className="font-display text-base font-medium text-ink">Moderation</h3>
        <div className="flex flex-wrap gap-2">
          {ADMIN_USER_STATUSES.filter((s) => s !== row.status?.toUpperCase()).map((s) => (
            <Button
              key={s}
              type="button"
              variant="secondary"
              size="sm"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate({ id: userId, status: s })}
              className="cursor-pointer"
            >
              Mark {s.toLowerCase()}
            </Button>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={restoreMutation.isPending}
            onClick={() => restoreMutation.mutate(userId)}
            className="cursor-pointer"
          >
            Restore
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="cursor-pointer text-signal-open hover:text-signal-open"
          >
            Remove
          </Button>
        </div>
      </section>

      <section aria-label="Roles" className="flex flex-col gap-3">
        <h3 className="font-display text-base font-medium text-ink">Roles</h3>
        {assigned.length > 0 ? (
          <ul className="flex flex-col">
            {assigned.map((role) => (
              <li
                key={role.id}
                className="flex items-center justify-between gap-3 border-t border-line/25 py-2.5 first:border-t-0 first:pt-0"
              >
                <span className="font-mono text-sm text-ink">
                  {role.code} <span className="text-ink/50">· {role.name}</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate({ roleId: role.id, userId })}
                  className="cursor-pointer text-signal-open hover:text-signal-open"
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-body text-sm text-ink/55">No roles assigned.</p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={roleToAssign}
            onChange={(e) => setRoleToAssign(e.target.value)}
            aria-label="Role to assign"
            className="h-10 w-full cursor-pointer rounded-md border border-line/20 bg-field/50 px-3 py-2 text-sm transition-all duration-200 hover:bg-field sm:max-w-xs"
          >
            <option value="">Select a role to assign</option>
            {assignable.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.code})
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            disabled={!roleToAssign || assignMutation.isPending}
            onClick={() =>
              assignMutation.mutate(
                { userId, payload: { roleId: roleToAssign } },
                { onSuccess: () => setRoleToAssign("") },
              )
            }
            className="cursor-pointer"
          >
            Assign role
          </Button>
        </div>
      </section>

      <AdminConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Remove user"
        body={`"${row.email}" will be soft-deleted. The account can be restored later.`}
        confirmLabel="Remove"
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(userId)}
      />
    </div>
  );
}
