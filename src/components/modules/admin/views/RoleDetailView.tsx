"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { AdminSectionSkeleton, StatusBadge } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useGetPermissions,
  useGetRoleById,
  useGetRolePermissions,
  useUpdateRolePermissions,
} from "@/hooks";

export function RoleDetailView() {
  const params = useParams<{ roleId: string }>();
  const roleId = params.roleId;
  const roleQuery = useGetRoleById(roleId);
  const assignedQuery = useGetRolePermissions(roleId);
  const allQuery = useGetPermissions({ limit: 100 });
  const updateMutation = useUpdateRolePermissions();
  const [selected, setSelected] = useState<string[]>([]);

  const assignedIds = useMemo(
    () => (assignedQuery.data?.data ?? []).map((p) => p.id),
    [assignedQuery.data],
  );

  useEffect(() => {
    setSelected(assignedIds);
  }, [assignedIds]);

  if (roleQuery.isLoading) return <AdminSectionSkeleton />;
  if (roleQuery.isError || roleQuery.data?.data == null) {
    return (
      <EmptyState
        title="Role not found"
        body="This role could not be loaded. It may have been deleted."
        action={
          <Button
            type="button"
            size="sm"
            onClick={() => roleQuery.refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        }
      />
    );
  }

  const role = roleQuery.data.data;
  const all = allQuery.data?.data ?? [];
  const dirty =
    selected.length !== assignedIds.length || selected.some((id) => !assignedIds.includes(id));

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-medium text-ink">{role.name}</h2>
        <span className="font-mono text-sm text-ink/50">{role.code}</span>
        <StatusBadge status={role.isSystemRole ? "SYSTEM" : "CUSTOM"} />
      </div>
      {role.description ? (
        <p className="font-body text-sm leading-relaxed text-ink/65">{role.description}</p>
      ) : null}

      <section aria-label="Permission matrix" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-base font-medium text-ink">
            Permission matrix · {selected.length} assigned
          </h3>
          <Button
            type="button"
            size="sm"
            disabled={!dirty || updateMutation.isPending}
            onClick={() => updateMutation.mutate({ roleId, payload: { permissionIds: selected } })}
            className="cursor-pointer"
          >
            Save matrix
          </Button>
        </div>
        {allQuery.isLoading ? (
          <AdminSectionSkeleton />
        ) : allQuery.isError ? (
          <p className="font-body text-sm text-ink/55">
            Permissions failed to load.{" "}
            <button
              type="button"
              onClick={() => allQuery.refetch()}
              className="cursor-pointer underline underline-offset-2"
            >
              Retry
            </button>
          </p>
        ) : (
          <ul className="flex flex-col">
            {all.map((perm) => {
              const checked = selected.includes(perm.id);
              return (
                <li
                  key={perm.id}
                  className="flex items-center justify-between gap-4 border-t border-line/25 py-2.5 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-ink">
                      {perm.action}:{perm.resource}
                    </span>
                    {perm.description ? (
                      <span className="font-body text-xs text-ink/55">{perm.description}</span>
                    ) : null}
                  </div>
                  <Switch
                    checked={checked}
                    onCheckedChange={() => toggle(perm.id)}
                    aria-label={`${perm.action} ${perm.resource}`}
                    className="cursor-pointer"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
