"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AdminSectionSkeleton } from "@/components/modules/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ADMIN_PATHS, ADMIN_USER_STATUSES } from "@/constant/admin.constant";
import { useGetStaffById, useUpdateStaff, useUpdateStaffStatus } from "@/hooks";
import { ADMIN_DIALOG_CLASS, AdminBackLink } from "./admin-ui";

export function StaffDetailView() {
  const params = useParams<{ id: string }>();
  const query = useGetStaffById(params.id);
  const statusMutation = useUpdateStaffStatus();
  const updateMutation = useUpdateStaff();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDesignation, setEditDesignation] = useState("");
  const [editPhone, setEditPhone] = useState("");

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
  const roles = (row.user?.userRoles ?? []).map((ur) => ur?.role?.code).filter(Boolean);

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminBackLink href={ADMIN_PATHS.staff} label="Staff" />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-line">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            {roles.map((r) => (
              <Badge
                key={r}
                variant="outline"
                className="text-[10px] font-mono uppercase bg-field/40 border-line"
              >
                {String(r).replace(/_/g, " ")}
              </Badge>
            ))}
            <StatusPill status={row.user?.status || row.status || "ACTIVE"} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            {`${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() || row.user?.email}
          </h1>
          <p className="font-body text-xs text-ink/65 font-mono">{row.user?.email}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setEditDesignation(row.designation || "");
            setEditPhone(row.phone || "");
            setIsEditOpen(true);
          }}
          className="cursor-pointer text-xs active:translate-y-px rounded-xs shrink-0"
        >
          Edit details
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-2 shadow-2xs">
          <h2 className="font-display text-base font-semibold text-ink">Profile</h2>
          <div className="divide-y divide-line/40 text-xs font-body">
            {[
              ["Phone", row.phone],
              ["Designation", row.designation],
              ["Department", row.departmentMembers?.[0]?.department?.name],
              [
                "Workload",
                row.maxWorkload ? `${row.currentWorkload ?? 0} / ${row.maxWorkload}` : null,
              ],
            ].map(([label, value]) => (
              <div key={label as string} className="flex items-center justify-between py-2">
                <span className="text-ink/60">{label}</span>
                <span className="text-ink font-medium">{(value as string) || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-3 shadow-2xs">
          <h2 className="font-display text-base font-semibold text-ink">Account status</h2>
          <p className="font-body text-xs text-ink/60 -mt-1">
            Lifecycle state for this staff account.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ADMIN_USER_STATUSES.map((s) => (
              <Button
                key={s}
                type="button"
                variant={
                  (row.user?.status || row.status)?.toUpperCase() === s ? "primary" : "secondary"
                }
                size="sm"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ id: row.userId, status: s })}
                className="text-[11px] font-mono cursor-pointer"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate(
                {
                  id: params.id,
                  payload: {
                    designation: editDesignation.trim() || undefined,
                    phone: editPhone.trim() || undefined,
                  },
                },
                { onSuccess: () => setIsEditOpen(false) },
              );
            }}
            className="space-y-3.5"
          >
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-base">Edit staff details</DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Update designation or contact info.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1">
              <label htmlFor="staff-detail-desig" className="text-xs font-medium text-ink/80">
                Designation
              </label>
              <Input
                id="staff-detail-desig"
                value={editDesignation}
                onChange={(e) => setEditDesignation(e.target.value)}
                placeholder="e.g. Senior Technician"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="staff-detail-phone" className="text-xs font-medium text-ink/80">
                Phone
              </label>
              <Input
                id="staff-detail-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
            </div>
            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditOpen(false)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={updateMutation.isPending}
                className="cursor-pointer text-xs"
              >
                {updateMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
