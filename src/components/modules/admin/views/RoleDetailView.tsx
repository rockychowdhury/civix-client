"use client";

import { Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ADMIN_PATHS } from "@/constant/admin.constant";
import {
  useGetPermissions,
  useGetRoleById,
  useGetRolePermissions,
  useUpdateRolePermissions,
} from "@/hooks";
import { AdminBackLink } from "./admin-ui";

export function RoleDetailView() {
  const params = useParams<{ roleId: string }>();
  const roleId = params.roleId;
  const roleQuery = useGetRoleById(roleId);
  const assignedQuery = useGetRolePermissions(roleId);
  const allQuery = useGetPermissions({ limit: 200 });
  const updateMutation = useUpdateRolePermissions();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const assignedIds = useMemo(
    () => (assignedQuery.data?.data ?? []).map((p) => p.id),
    [assignedQuery.data],
  );

  useEffect(() => {
    setSelected(assignedIds);
  }, [assignedIds]);

  const all = allQuery.data?.data ?? [];
  const term = search.trim().toLowerCase();
  const visible = term
    ? all.filter((p) =>
        `${p.action}:${p.resource} ${p.description ?? ""}`.toLowerCase().includes(term),
      )
    : all;

  // Group by resource for scannable disclosure.
  const groups = useMemo(() => {
    const map = new Map<string, typeof all>();
    for (const p of visible) {
      const list = map.get(p.resource) ?? [];
      list.push(p);
      map.set(p.resource, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [visible]);

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
  const dirty =
    selected.length !== assignedIds.length || selected.some((id) => !assignedIds.includes(id));

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminBackLink href={ADMIN_PATHS.roles} label="Roles" />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-line">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
              {role.code}
            </span>
            <StatusPill status={role.isSystemRole ? "SYSTEM" : "CUSTOM"} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            {role.name}
          </h1>
          <p className="font-body text-xs text-ink/65 max-w-xl leading-relaxed">
            {role.description || "Permission matrix for this role."}
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={!dirty || selected.length === 0 || updateMutation.isPending}
          title={selected.length === 0 ? "A role needs at least one permission" : undefined}
          onClick={() => updateMutation.mutate({ roleId, payload: { permissionIds: selected } })}
          className="cursor-pointer text-xs active:translate-y-px rounded-xs shrink-0"
        >
          {updateMutation.isPending ? "Saving…" : `Save matrix (${selected.length})`}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="text-xs font-mono text-ink/50">
          {selected.length} of {all.length} permissions assigned
          {dirty && <span className="text-ledger font-semibold"> · unsaved changes</span>}
        </div>
        <div className="relative min-w-[200px] w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
          <Input
            type="text"
            placeholder="Filter permissions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
          />
        </div>
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
      ) : groups.length === 0 ? (
        <p className="font-body text-sm text-ink/55">No permissions match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(([resource, perms]) => {
            const assigned = perms.filter((p) => selected.includes(p.id)).length;
            return (
              <div
                key={resource}
                className="rounded-xl border border-line/80 bg-paper p-4 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-line/50">
                  <h3 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
                    {resource}
                  </h3>
                  <span className="font-mono text-[10px] text-ink/50">
                    {assigned}/{perms.length}
                  </span>
                </div>
                <ul className="flex flex-col">
                  {perms.map((perm) => {
                    const checked = selected.includes(perm.id);
                    return (
                      <li key={perm.id}>
                        <div className="flex items-center justify-between gap-3 py-2 group">
                          <button
                            type="button"
                            onClick={() => toggle(perm.id)}
                            aria-pressed={checked}
                            className="min-w-0 flex-1 text-left cursor-pointer bg-transparent border-none p-0"
                          >
                            <span className="font-mono text-xs text-ink group-hover:underline underline-offset-2">
                              {perm.action}
                            </span>
                            {perm.description && (
                              <span className="block font-body text-[11px] text-ink/55 truncate">
                                {perm.description}
                              </span>
                            )}
                          </button>
                          <Switch
                            checked={checked}
                            onCheckedChange={() => toggle(perm.id)}
                            aria-label={`${perm.action} on ${perm.resource}`}
                            className="cursor-pointer shrink-0"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
