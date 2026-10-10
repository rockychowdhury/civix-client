"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Plus, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ADMIN_PATHS,
  ADMIN_USER_STATUSES,
  STAFF_PROVISION_KINDS,
  STAFF_PROVISION_LABEL,
  type StaffProvisionKind,
} from "@/constant/admin.constant";
import {
  useCreateCityAdmin,
  useCreateDepartmentManager,
  useCreateDispatcher,
  useCreatePlatformAdmin,
  useCreateTechnician,
  useGetAllStaff,
  useUpdateStaff,
  useUpdateStaffStatus,
} from "@/hooks";
import { useGetDepartments } from "@/hooks/department.hook";
import { useGetAdminMunicipalities } from "@/hooks/municipality.hook";
import type { ICreateStaffPayload, IStaffProfile } from "@/types";
import {
  ADMIN_DIALOG_CLASS,
  ADMIN_ROW_CLASS,
  ADMIN_ROW_SELECTED_CLASS,
  AdminEmptyState,
  AdminHeader,
  AdminStatCard,
  ServerTablePagination,
} from "./admin-ui";
import { useAdminListParams } from "./useAdminListParams";

function staffRole(row: IStaffProfile): string {
  const codes = (row.user?.userRoles ?? []).map((ur) => ur?.role?.code).filter(Boolean);
  return codes.join(", ") || "—";
}

const columns: ColumnDef<IStaffProfile, unknown>[] = [
  {
    id: "staff",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Staff</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="size-7 rounded-full bg-field border border-line flex items-center justify-center shrink-0 font-display font-semibold text-[11px] text-ink uppercase">
          {(row.original.firstName?.[0] || row.original.user?.email?.[0] || "?").toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink truncate">
            {`${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim() ||
              row.original.user?.email ||
              "—"}
          </p>
          <p className="font-mono text-[10px] text-ink/45 truncate">{row.original.user?.email}</p>
        </div>
      </div>
    ),
  },
  {
    id: "role",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Role</span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-ink/70">{staffRole(row.original)}</span>
    ),
  },
  {
    id: "department",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Department
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-ink/75 truncate block max-w-[180px]">
        {row.original.departmentMembers?.[0]?.department?.name || "—"}
      </span>
    ),
  },
  {
    id: "workload",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">
        Workload
      </span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-ink/70">
        {row.original.currentWorkload ?? "—"}
        {row.original.maxWorkload ? ` / ${row.original.maxWorkload}` : ""}
      </span>
    ),
  },
  {
    id: "status",
    header: () => (
      <span className="font-display text-[10px] uppercase tracking-widest text-ink/40">Status</span>
    ),
    cell: ({ row }) => <StatusPill status={row.original.user?.status || "ACTIVE"} />,
  },
];

function emptyProvision() {
  return {
    kind: "" as StaffProvisionKind | "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    designation: "",
    departmentId: "",
    municipalityId: "",
  };
}

export function StaffView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qpRole = searchParams.get("role") || "ALL";
  const [roleFilter, setRoleFilter] = useState(qpRole);
  const [selected, setSelected] = useState<IStaffProfile | null>(null);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState(emptyProvision());
  const [editDesignation, setEditDesignation] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    setRoleFilter(searchParams.get("role") || "ALL");
  }, [searchParams]);

  const { search, setSearch, debouncedSearch, page, setPage, limit, setLimit } =
    useAdminListParams(roleFilter);
  const query = useGetAllStaff({
    searchTerm: debouncedSearch || undefined,
    role: roleFilter !== "ALL" ? roleFilter : undefined,
    page,
    limit,
  });
  const municipalitiesQuery = useGetAdminMunicipalities({ limit: 100 });
  const departmentsQuery = useGetDepartments(
    form.municipalityId ? { municipalityId: form.municipalityId } : undefined,
  );
  const statusMutation = useUpdateStaffStatus();
  const updateMutation = useUpdateStaff();
  const platformAdmin = useCreatePlatformAdmin();
  const cityAdmin = useCreateCityAdmin();
  const manager = useCreateDepartmentManager();
  const dispatcher = useCreateDispatcher();
  const technician = useCreateTechnician();

  const municipalities = (municipalitiesQuery.data?.data ?? []) as {
    id: string;
    name: string;
    code: string;
  }[];
  const departments = (departmentsQuery.data?.data ?? []) as { id: string; name: string }[];
  const rows = query.data?.data ?? [];
  const meta = query.data?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;
  const total = meta?.total ?? rows.length;

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

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

  const provisioning =
    platformAdmin.isPending ||
    cityAdmin.isPending ||
    manager.isPending ||
    dispatcher.isPending ||
    technician.isPending;

  const needsDepartment =
    form.kind === "department-manager" || form.kind === "dispatcher" || form.kind === "technician";
  const needsMunicipality = form.kind === "city-admin" || needsDepartment;

  const handleProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kind) {
      toast.error("Select a role to provision");
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password) {
      toast.error("Name, email, and password are required");
      return;
    }
    if (needsMunicipality && !form.municipalityId) {
      toast.error("Select a municipality for this role");
      return;
    }
    if (needsDepartment && !form.departmentId) {
      toast.error("Select a department for this role");
      return;
    }
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.designation.trim() ? { designation: form.designation.trim() } : {}),
      ...(needsDepartment ? { departmentId: form.departmentId } : {}),
      ...(form.kind === "city-admin" ? { municipalityId: form.municipalityId } : {}),
    } as ICreateStaffPayload;
    const options = {
      onSuccess: () => {
        setProvisionOpen(false);
        setForm(emptyProvision());
      },
    };
    if (form.kind === "platform-admin") platformAdmin.mutate(payload, options);
    else if (form.kind === "city-admin") cityAdmin.mutate(payload, options);
    else if (form.kind === "department-manager") manager.mutate(payload, options);
    else if (form.kind === "dispatcher") dispatcher.mutate(payload, options);
    else technician.mutate(payload, options);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminHeader
        eyebrow="Municipal workforce"
        title="Staff"
        description="Provision and manage platform admins, city admins, managers, dispatchers, and technicians."
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setForm(emptyProvision());
              setProvisionOpen(true);
            }}
            className="cursor-pointer text-xs active:translate-y-px rounded-xs shadow-2xs"
          >
            <Plus className="size-3.5 mr-1.5" /> Provision
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <AdminStatCard
          label="Workforce"
          value={total.toLocaleString()}
          sub="Staff records"
          icon={<UserPlus className="size-4 text-ink/40" />}
        />
        <AdminStatCard label="Departments" value={departments.length} sub="Assignable units" />
        <AdminStatCard
          label="Municipalities"
          value={municipalities.length}
          sub="Assignable tenants"
        />
        <AdminStatCard
          label="Page"
          value={rows.length}
          sub={`Showing page ${meta?.page ?? page}`}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50">
          <UserPlus className="size-3.5" />
          {total.toLocaleString()} staff
          {query.isFetching && (
            <Loader2 className="size-3.5 animate-spin" aria-label="Updating results" />
          )}
          {roleFilter !== "ALL" && (
            <>
              <span>· {roleFilter.replace(/_/g, " ")}</span>
              <Link
                href="/system/staff"
                className="underline underline-offset-2 hover:text-ink cursor-pointer"
              >
                clear
              </Link>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search by name, email, or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line rounded-xs"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-8.5 text-xs w-[170px] bg-paper border-line cursor-pointer rounded-xs">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All roles
              </SelectItem>
              {[
                "PLATFORM_ADMIN",
                "CITY_ADMIN",
                "DEPARTMENT_MANAGER",
                "DISPATCHER",
                "TECHNICIAN",
              ].map((r) => (
                <SelectItem key={r} value={r} className="text-xs cursor-pointer">
                  {r.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={`w-full rounded-xl border border-line/80 bg-paper overflow-hidden shadow-2xs transition-opacity duration-150 ${query.isFetching ? "opacity-70" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-line/40">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className="h-11 px-4 first:pl-5 last:pr-5 cursor-pointer align-middle"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const isSel =
                    (row.original.userId || row.original.id) === (selected?.userId || selected?.id);
                  return (
                    <tr
                      key={row.original.userId || row.id}
                      data-state={isSel ? "selected" : undefined}
                      onClick={() => setSelected(row.original)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelected(row.original);
                      }}
                      className={`${ADMIN_ROW_CLASS} ${isSel ? ADMIN_ROW_SELECTED_CLASS : ""}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3.5 px-4 first:pl-5 last:pr-5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr className="border-none">
                  <td colSpan={columns.length}>
                    <AdminEmptyState
                      title="No staff found."
                      body="Provision the first team member."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ServerTablePagination
          page={meta?.page ?? page}
          totalPages={meta?.totalPages ?? 1}
          total={total}
          limit={meta?.limit ?? limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-paper border-l border-line p-6 flex flex-col gap-5 overflow-y-auto"
        >
          {selected && (
            <>
              <SheetHeader className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
                    {staffRole(selected)}
                  </span>
                  <StatusPill status={selected.user?.status || "ACTIVE"} />
                </div>
                <SheetTitle className="font-display text-xl text-ink">
                  {`${selected.firstName ?? ""} ${selected.lastName ?? ""}`.trim() ||
                    selected.user?.email}
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60 font-mono">
                  {selected.user?.email}
                </SheetDescription>
              </SheetHeader>

              <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/20 text-xs">
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Phone</span>
                  <span className="font-mono text-ink">{selected.phone || "—"}</span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Designation</span>
                  <span className="text-ink font-medium">{selected.designation || "—"}</span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Department</span>
                  <span className="text-ink font-medium truncate">
                    {selected.departmentMembers?.[0]?.department?.name || "—"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between gap-3">
                  <span className="text-ink/50 font-mono">Workload</span>
                  <span className="font-mono text-ink">
                    {selected.currentWorkload ?? "—"}
                    {selected.maxWorkload ? ` / ${selected.maxWorkload}` : ""}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-ink/80">Account status</span>
                <div className="grid grid-cols-2 gap-2">
                  {ADMIN_USER_STATUSES.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={
                        (selected.user?.status || selected.status)?.toUpperCase() === s
                          ? "primary"
                          : "secondary"
                      }
                      size="sm"
                      disabled={statusMutation.isPending}
                      onClick={() => {
                        const staffId = selected.userId || selected.id;
                        if (!staffId) return;
                        statusMutation.mutate(
                          { id: staffId, status: s },
                          {
                            onSuccess: () =>
                              setSelected({
                                ...selected,
                                user: selected.user
                                  ? { ...selected.user, status: s }
                                  : selected.user,
                              }),
                          },
                        );
                      }}
                      className="text-[11px] font-mono cursor-pointer"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-line flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    router.push(ADMIN_PATHS.staffDetail(selected.userId || selected.id || ""))
                  }
                  className="w-full cursor-pointer text-xs active:translate-y-px"
                >
                  Open full record
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditDesignation(selected.designation || "");
                    setEditPhone(selected.phone || "");
                    setIsEditOpen(true);
                  }}
                  className="w-full cursor-pointer text-xs"
                >
                  Edit details
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={provisionOpen} onOpenChange={setProvisionOpen}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <form onSubmit={handleProvision} className="space-y-3.5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-base">Provision staff</DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                High-privilege roles are enforced by the API.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-ink/80">Role *</span>
              <div className="grid grid-cols-2 gap-2">
                {STAFF_PROVISION_KINDS.map((k) => (
                  <Button
                    key={k}
                    type="button"
                    variant={form.kind === k ? "primary" : "secondary"}
                    size="sm"
                    onClick={() =>
                      setForm({ ...form, kind: k, departmentId: "", municipalityId: "" })
                    }
                    className="text-[11px] font-mono cursor-pointer"
                  >
                    {STAFF_PROVISION_LABEL[k]}
                  </Button>
                ))}
              </div>
            </div>
            {needsMunicipality && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-ink/80">Municipality *</span>
                <Select
                  value={form.municipalityId}
                  onValueChange={(v) => setForm({ ...form, municipalityId: v, departmentId: "" })}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                    <SelectValue placeholder="Select municipality…" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-xs cursor-pointer">
                        {m.name} ({m.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {needsDepartment && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-ink/80">Department *</span>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) => setForm({ ...form, departmentId: v })}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-paper border-line cursor-pointer rounded-xs">
                    <SelectValue
                      placeholder={
                        form.municipalityId ? "Select department…" : "Pick a municipality first…"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs cursor-pointer">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="sys-staff-first" className="text-xs font-medium text-ink/80">
                  First name *
                </label>
                <Input
                  id="sys-staff-first"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Arif"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sys-staff-last" className="text-xs font-medium text-ink/80">
                  Last name *
                </label>
                <Input
                  id="sys-staff-last"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Rahman"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="sys-staff-email" className="text-xs font-medium text-ink/80">
                Email *
              </label>
              <Input
                id="sys-staff-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="sys-staff-pass" className="text-xs font-medium text-ink/80">
                  Password *
                </label>
                <Input
                  id="sys-staff-pass"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 chars"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="sys-staff-phone" className="text-xs font-medium text-ink/80">
                  Phone
                </label>
                <Input
                  id="sys-staff-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="h-8.5 text-xs bg-paper border-line rounded-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="sys-staff-desig" className="text-xs font-medium text-ink/80">
                Designation
              </label>
              <Input
                id="sys-staff-desig"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. Engineer"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
            </div>
            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setProvisionOpen(false)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={provisioning}
                className="cursor-pointer text-xs"
              >
                {provisioning ? "Provisioning…" : "Provision"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className={ADMIN_DIALOG_CLASS}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const staffId = selected?.userId || selected?.id;
              if (!staffId) return;
              updateMutation.mutate(
                {
                  id: staffId,
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
              <label htmlFor="sys-staff-edit-desig" className="text-xs font-medium text-ink/80">
                Designation
              </label>
              <Input
                id="sys-staff-edit-desig"
                value={editDesignation}
                onChange={(e) => setEditDesignation(e.target.value)}
                placeholder="e.g. Senior Technician"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sys-staff-edit-phone" className="text-xs font-medium text-ink/80">
                Phone
              </label>
              <Input
                id="sys-staff-edit-phone"
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
