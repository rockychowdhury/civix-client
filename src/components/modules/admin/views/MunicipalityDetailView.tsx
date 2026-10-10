"use client";

import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/dashboard/EmptyState";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { AdminSectionSkeleton } from "@/components/modules/admin";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_PATHS, COVERAGE_STATUSES } from "@/constant/admin.constant";
import {
  useDeleteMunicipality,
  useGetMunicipalityById,
  useGetMunicipalityOverview,
  useUpdateMunicipality,
} from "@/hooks";
import { ADMIN_DIALOG_CLASS, AdminBackLink, AdminStatCard } from "./admin-ui";

export function MunicipalityDetailView() {
  const params = useParams<{ municipalityId: string }>();
  const router = useRouter();
  const id = params.municipalityId;
  const query = useGetMunicipalityById(id);
  const overviewQuery = useGetMunicipalityOverview(id);
  const updateMutation = useUpdateMunicipality();
  const deleteMutation = useDeleteMunicipality();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    countryCode: "",
    timezone: "",
    coverageStatus: "",
  });

  if (query.isLoading) return <AdminSectionSkeleton />;
  if (query.isError || query.data?.data == null) {
    return (
      <EmptyState
        title="Municipality not found"
        body="This tenant could not be loaded. It may have been removed."
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
  const ov = overviewQuery.data?.data;
  const counts = ov?.municipality.counts;
  const issues = ov?.issueStats;
  const work = ov?.workOrderStats;
  const staff = ov?.staffStats;

  const openEdit = () => {
    setForm({
      name: row.name,
      code: row.code,
      countryCode: row.countryCode ?? "",
      timezone: row.timezone ?? "",
      coverageStatus: row.coverageStatus ?? "",
    });
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    updateMutation.mutate(
      {
        id,
        payload: Object.fromEntries(
          Object.entries({
            name: form.name.trim(),
            code: form.code.trim().toUpperCase(),
            countryCode: form.countryCode.trim() || undefined,
            timezone: form.timezone.trim() || undefined,
            coverageStatus: form.coverageStatus || undefined,
          }).filter(([, v]) => v !== undefined),
        ),
      },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminBackLink href={ADMIN_PATHS.municipalities} label="Municipalities" />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-line">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
              {row.code}
            </span>
            <StatusPill status={row.coverageStatus} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            {row.name}
          </h1>
          <p className="font-body text-xs text-ink/65">
            {[row.countryCode, row.timezone].filter(Boolean).join(" · ") || "Tenant record"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openEdit}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs"
          >
            <Pencil className="size-3.5 mr-1.5" /> Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="cursor-pointer text-xs text-signal-open hover:text-signal-open"
          >
            <Trash2 className="size-3.5 mr-1.5" /> Remove
          </Button>
        </div>
      </div>

      {overviewQuery.isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-field/30 rounded-xl border border-line/40" />
          ))}
        </div>
      ) : ov ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <AdminStatCard
              label="Open issues"
              value={(issues?.openTotal ?? 0).toLocaleString()}
              sub={`${(issues?.total ?? 0).toLocaleString()} total reported`}
            />
            <AdminStatCard
              label="Resolution"
              value={
                issues?.resolutionRate != null
                  ? `${Number(issues.resolutionRate).toFixed(1)}%`
                  : "—"
              }
              sub={`${(issues?.resolvedTotal ?? 0).toLocaleString()} resolved`}
            />
            <AdminStatCard
              label="Work orders"
              value={(work?.activeTotal ?? 0).toLocaleString()}
              sub={`${(work?.needCrew ?? 0).toLocaleString()} awaiting crew`}
            />
            <AdminStatCard
              label="Workforce"
              value={(staff?.totalStaff ?? 0).toLocaleString()}
              sub={`${(counts?.totalDepartments ?? 0).toLocaleString()} departments`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-xl border border-line/80 bg-paper p-5 space-y-3 shadow-2xs">
              <h2 className="font-display text-base font-semibold text-ink">Department load</h2>
              {(ov.departmentPerformance ?? []).length === 0 ? (
                <p className="font-body text-xs text-ink/55">No department data yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {(ov.departmentPerformance ?? []).map((d) => {
                    const max = Math.max(
                      1,
                      ...(ov.departmentPerformance ?? []).map((x) => x.openIssues),
                    );
                    return (
                      <div key={d.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-body text-ink/80">
                          <span className="truncate max-w-[220px] font-medium">{d.name}</span>
                          <span className="font-mono text-xs text-ink/60">
                            {d.openIssues.toLocaleString()} open
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-field overflow-hidden">
                          <div
                            className="h-full rounded-full bg-ledger transition-all duration-500"
                            style={{ width: `${Math.max(2, (d.openIssues / max) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-3 shadow-2xs">
                <h2 className="font-display text-sm font-semibold text-ink">Footprint</h2>
                <div className="space-y-2 text-xs font-body">
                  {[
                    ["Zones", counts?.totalZones ?? 0],
                    ["Wards", counts?.totalWards ?? 0],
                    ["SLA policies", counts?.totalSlaPolicies ?? 0],
                    ["Service requests", ov.serviceRequestStats?.total ?? 0],
                    [
                      "Satisfaction",
                      ov.citizenSatisfaction?.averageRating
                        ? `${Number(ov.citizenSatisfaction.averageRating).toFixed(1)}/5`
                        : "—",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label as string}
                      className="flex items-center justify-between py-1 border-b border-line/40 last:border-b-0"
                    >
                      <span className="text-ink/60">{label}</span>
                      <span className="font-mono text-ink font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-line/80 bg-paper p-4.5 space-y-2 shadow-2xs">
                <h3 className="text-xs font-mono uppercase tracking-wider text-ink/50 pb-1">
                  Manage scope
                </h3>
                <div className="space-y-1.5 text-xs font-body">
                  {[
                    ["Departments & teams", "/system/departments"],
                    ["Zones & wards", "/system/zones"],
                    ["Oversight queue", "/system/oversight/issues"],
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center justify-between p-2 rounded-lg border border-line/60 bg-field/20 hover:bg-field/40 text-ink transition-colors cursor-pointer"
                    >
                      <span>{label}</span>
                      <ArrowRight className="size-3 text-ink/40" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="font-body text-xs text-ink/55">
          Operational metrics failed to load.{" "}
          <button
            type="button"
            onClick={() => overviewQuery.refetch()}
            className="cursor-pointer underline underline-offset-2"
          >
            Retry
          </button>
        </p>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <form onSubmit={handleEdit} className="space-y-3.5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-base">Edit municipality</DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Update tenant identity and coverage.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="muni-edit-name" className="text-xs font-medium text-ink/80">
                  Name *
                </label>
                <Input
                  id="muni-edit-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="muni-edit-code" className="text-xs font-medium text-ink/80">
                  Code *
                </label>
                <Input
                  id="muni-edit-code"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="h-8.5 text-xs bg-paper border-line rounded-xs font-mono uppercase"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="muni-edit-country" className="text-xs font-medium text-ink/80">
                  Country code
                </label>
                <Input
                  id="muni-edit-country"
                  value={form.countryCode}
                  onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  className="h-8.5 text-xs bg-paper border-line rounded-xs font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="muni-edit-tz" className="text-xs font-medium text-ink/80">
                  Timezone
                </label>
                <Input
                  id="muni-edit-tz"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-ink/80">Coverage status</span>
              <Select
                value={form.coverageStatus || "NONE"}
                onValueChange={(v) => setForm({ ...form, coverageStatus: v === "NONE" ? "" : v })}
              >
                <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                  <SelectValue placeholder="Coverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE" className="text-xs cursor-pointer">
                    Unchanged
                  </SelectItem>
                  {COVERAGE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs cursor-pointer">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(false)}
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

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-base">Remove municipality</DialogTitle>
            <DialogDescription className="text-xs text-ink/60">
              “{row.name}” and everything under it will be removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate(id, {
                  onSuccess: () => router.push(ADMIN_PATHS.municipalities),
                })
              }
              className="cursor-pointer text-xs"
            >
              {deleteMutation.isPending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
