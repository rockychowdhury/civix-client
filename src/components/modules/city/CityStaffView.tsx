"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Mail,
  Phone,
  Power,
  Search,
  User,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminSectionSkeleton, StatusBadge } from "@/components/modules/admin";
import { useAdminListParams } from "@/components/modules/admin/views/useAdminListParams";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateDepartmentManager,
  useCreateDispatcher,
  useCreateTechnician,
  useGetAllStaff,
  useGetDepartments,
  useUpdateStaff,
  useUpdateStaffStatus,
} from "@/hooks";
import { useCityScope } from "@/hooks/city.hook";
import type { IStaffProfile } from "@/types";

type StaffRoleTab = "ALL" | "DEPARTMENT_MANAGER" | "DISPATCHER" | "TECHNICIAN";

const staffColumns: ColumnDef<IStaffProfile, any>[] = [
  {
    id: "name",
    header: "Staff Member",
    cell: ({ row }) => {
      const staff = row.original;
      const u = staff.user;
      const name =
        (staff.firstName ? `${staff.firstName} ${staff.lastName || ""}`.trim() : null) ||
        u?.email ||
        "—";
      const email = u?.email || "—";
      return (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-field border border-line flex items-center justify-center font-display font-semibold text-xs text-ink uppercase shrink-0">
            {name[0]}
          </div>
          <div className="space-y-0.5">
            <p className="font-medium text-xs text-ink leading-tight">{name}</p>
            <p className="text-[11px] text-ink/50 font-mono truncate max-w-xs">{email}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const staff = row.original;
      const roleCode =
        staff.user?.userRoles?.[0]?.role?.code || staff.departmentMembers?.[0]?.role || "—";
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-mono uppercase bg-field/40 border-line"
        >
          {roleCode.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    id: "department",
    header: "Department",
    cell: ({ row }) => (
      <span className="text-xs text-ink/80">
        {row.original.departmentMembers?.[0]?.department?.name || "—"}
      </span>
    ),
  },
  {
    id: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-xs text-ink/60 font-mono">{row.original.phone || "—"}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const currentStatus = row.original.user?.status || row.original.status || "ACTIVE";
      return <StatusBadge status={currentStatus} />;
    },
  },
];

export function CityStaffView({ municipalityId }: { municipalityId?: string }) {
  const scope = useCityScope();
  const id = municipalityId ?? scope;
  if (!id) return <AdminSectionSkeleton />;
  return <CityStaffContent municipalityId={id} />;
}

function CityStaffContent({ municipalityId }: { municipalityId: string }) {
  const [activeTab, setActiveTab] = useState<StaffRoleTab>("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDesignation, setEditDesignation] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<IStaffProfile | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Form State
  const [provisionRole, setProvisionRole] = useState<
    "DEPARTMENT_MANAGER" | "DISPATCHER" | "TECHNICIAN"
  >("TECHNICIAN");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const { search, setSearch, debouncedSearch, page } = useAdminListParams(municipalityId);

  // Queries
  const departmentsQuery = useGetDepartments({ municipalityId });
  const departments = departmentsQuery.data?.data || [];

  const staffQuery = useGetAllStaff({
    searchTerm: debouncedSearch || undefined,
    role: activeTab !== "ALL" ? activeTab : undefined,
    page,
    limit: 100,
  });

  const staffList: IStaffProfile[] = staffQuery.data?.data || [];

  // Mutations
  const createManager = useCreateDepartmentManager();
  const createDispatcher = useCreateDispatcher();
  const createTechnician = useCreateTechnician();
  const updateStatus = useUpdateStaffStatus();
  const updateStaff = useUpdateStaff();

  const isSubmitting =
    createManager.isPending || createDispatcher.isPending || createTechnician.isPending;

  const filteredStaff = useMemo(() => {
    if (selectedDepartment === "ALL") return staffList;
    return staffList.filter((s) => {
      return s.departmentMembers?.some((dm: any) => dm.departmentId === selectedDepartment);
    });
  }, [staffList, selectedDepartment]);

  const table = useReactTable({
    data: filteredStaff,
    columns: staffColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim() || undefined,
      departmentId: departmentId || undefined,
      municipalityId,
    };

    try {
      if (provisionRole === "DEPARTMENT_MANAGER") {
        await createManager.mutateAsync(payload as any);
      } else if (provisionRole === "DISPATCHER") {
        await createDispatcher.mutateAsync(payload as any);
      } else {
        await createTechnician.mutateAsync(payload as any);
      }

      toast.success(`${provisionRole.replace(/_/g, " ")} onboarded successfully`);
      setIsProvisionOpen(false);
      resetForm();
      staffQuery.refetch();
    } catch (_error) {
      // Toast fired in mutation
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setDepartmentId("");
  };

  const handleToggleStatus = (staff: IStaffProfile) => {
    const staffId = staff.userId || staff.id;
    if (!staffId) return;
    const currentStatus = staff.user?.status || staff.status;
    const nextStatus = currentStatus?.toUpperCase() === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateStatus.mutate(
      { id: staffId, status: nextStatus },
      {
        onSuccess: () => {
          toast.success(`Staff status updated to ${nextStatus}`);
          staffQuery.refetch();
          if (selectedStaff) {
            setSelectedStaff({
              ...selectedStaff,
              status: nextStatus,
              user: selectedStaff.user ? { ...selectedStaff.user, status: nextStatus } : undefined,
            });
          }
        },
      },
    );
  };

  if (staffQuery.isLoading) return <AdminSectionSkeleton />;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Bar: Tabs & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-line/60">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as StaffRoleTab)}
          className="w-full lg:w-auto"
        >
          <TabsList className="bg-field/50 border border-line/60 rounded-sm p-1">
            <TabsTrigger
              value="ALL"
              className="font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5"
            >
              All Workforce ({staffList.length})
            </TabsTrigger>
            <TabsTrigger
              value="DEPARTMENT_MANAGER"
              className="font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5"
            >
              Managers
            </TabsTrigger>
            <TabsTrigger
              value="DISPATCHER"
              className="font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5"
            >
              Dispatchers
            </TabsTrigger>
            <TabsTrigger
              value="TECHNICIAN"
              className="font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border data-[state=active]:border-line/70 cursor-pointer px-3 py-1.5"
            >
              Technicians
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search, Department Filter, and Provision Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Search staff name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-paper border-line"
            />
          </div>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="h-8.5 text-xs w-[160px] bg-paper border-line cursor-pointer">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs cursor-pointer">
                All Departments
              </SelectItem>
              {departments.map((d: any) => (
                <SelectItem key={d.id} value={d.id} className="text-xs cursor-pointer">
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsProvisionOpen(true)}
            className="cursor-pointer shadow-xs text-xs h-8.5"
          >
            <UserPlus className="size-3.5 mr-1.5" /> Onboard Staff
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full rounded-lg border border-line bg-paper overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-line/40 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-ink/40 font-display text-[10px] uppercase tracking-widest h-12 align-bottom pb-3 px-4 first:pl-6 cursor-pointer hover:text-ink/80 transition-colors text-left"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="w-3 shrink-0 flex items-center justify-center">
                          {{
                            asc: <ArrowUp className="h-3 w-3" />,
                            desc: <ArrowDown className="h-3 w-3" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ArrowUpDown className="h-3 w-3 opacity-20" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const staff = row.original;
                const isSelected =
                  (staff.userId || staff.id) === (selectedStaff?.userId || selectedStaff?.id);
                return (
                  <TableRow
                    key={staff.userId || staff.id || row.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={`border-b border-line/10 transition-all duration-200 hover:bg-ink/[0.02] cursor-pointer group ${
                      isSelected
                        ? "bg-ink/[0.03] shadow-[inset_3px_0_0_0_var(--color-ledger)] border-line/20"
                        : ""
                    }`}
                    onClick={() => setSelectedStaff(staff)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedStaff(staff);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-4 px-4 first:pl-6 transition-all duration-200"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={staffColumns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-ink/5 flex items-center justify-center mb-2">
                      <span className="text-ink/20 text-xl font-display">?</span>
                    </div>
                    <p className="text-ink/50 font-body text-lg">No personnel found.</p>
                    <p className="text-ink/30 font-body text-sm">
                      Adjust your search query or role tab to see more results.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Standardized Table Pagination */}
        <DataTablePagination table={table} />
      </div>

      {/* Staff Member Slide-over Inspector Sheet (Triggered on Row Left-Click) */}
      <Sheet open={!!selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-paper border-l border-line p-6 flex flex-col justify-between overflow-y-auto"
        >
          {selectedStaff && (
            <>
              <div className="space-y-6">
                <SheetHeader className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono uppercase bg-field/40 border-line"
                    >
                      {(
                        selectedStaff.user?.userRoles?.[0]?.role?.code ||
                        selectedStaff.departmentMembers?.[0]?.role ||
                        "STAFF"
                      ).replace(/_/g, " ")}
                    </Badge>
                    <StatusBadge
                      status={selectedStaff.user?.status || selectedStaff.status || "ACTIVE"}
                    />
                  </div>
                  <SheetTitle className="font-display text-xl text-ink">
                    {(selectedStaff.firstName
                      ? `${selectedStaff.firstName} ${selectedStaff.lastName || ""}`.trim()
                      : null) ||
                      selectedStaff.user?.email ||
                      "Staff Member"}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-ink/60">
                    Personnel profile and operational deployment details.
                  </SheetDescription>
                </SheetHeader>

                <div className="divide-y divide-line/40 rounded-lg border border-line bg-field/20 text-xs">
                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-ink/50 flex items-center gap-1.5 font-mono">
                      <Mail className="size-3.5" /> Email
                    </span>
                    <span className="font-mono text-ink font-medium">
                      {selectedStaff.user?.email || "—"}
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-ink/50 flex items-center gap-1.5 font-mono">
                      <Phone className="size-3.5" /> Phone
                    </span>
                    <span className="font-mono text-ink font-medium">
                      {selectedStaff.phone || "—"}
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-ink/50 flex items-center gap-1.5 font-mono">
                      <User className="size-3.5" /> Designation
                    </span>
                    <span className="text-ink font-medium">
                      {selectedStaff.designation || "Field Staff"}
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-ink/50 font-mono">Department</span>
                    <span className="text-ink font-medium">
                      {selectedStaff.departmentMembers?.[0]?.department?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-6 border-t border-line space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer text-xs"
                  onClick={() => {
                    setEditDesignation(selectedStaff.designation || "");
                    setEditPhone(selectedStaff.phone || "");
                    setIsEditOpen(true);
                  }}
                >
                  Edit details
                </Button>
                <Button
                  type="button"
                  variant={
                    (selectedStaff.user?.status || selectedStaff.status)?.toUpperCase() === "ACTIVE"
                      ? "destructive"
                      : "primary"
                  }
                  className="w-full cursor-pointer text-xs"
                  disabled={updateStatus.isPending}
                  onClick={() => handleToggleStatus(selectedStaff)}
                >
                  <Power className="size-3.5 mr-2" />
                  {(selectedStaff.user?.status || selectedStaff.status)?.toUpperCase() === "ACTIVE"
                    ? "Deactivate Account"
                    : "Activate Account"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer text-xs"
                  onClick={() => setSelectedStaff(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Onboard Staff Dialog */}
      <Dialog open={isProvisionOpen} onOpenChange={setIsProvisionOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-paper border border-line text-ink p-5">
          <form onSubmit={handleProvisionSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-base">Onboard Municipal Staff</DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Provision a new department manager, dispatcher, or field technician.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              {/* Role Selection */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-ink/80">Role *</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["TECHNICIAN", "DISPATCHER", "DEPARTMENT_MANAGER"] as const).map((r) => (
                    <Button
                      key={r}
                      type="button"
                      variant={provisionRole === r ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setProvisionRole(r)}
                      className="text-[11px] font-mono cursor-pointer truncate"
                    >
                      {r === "DEPARTMENT_MANAGER"
                        ? "Manager"
                        : r === "DISPATCHER"
                          ? "Dispatcher"
                          : "Technician"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-ink/80">Department Assignment</span>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger className="h-9 text-xs bg-paper border-line cursor-pointer">
                    <SelectValue placeholder="Select department..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d: any) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs cursor-pointer">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="staff-first-name" className="text-xs font-medium text-ink/80">
                    First Name *
                  </label>
                  <Input
                    id="staff-first-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="h-8.5 text-xs bg-paper border-line"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="staff-last-name" className="text-xs font-medium text-ink/80">
                    Last Name *
                  </label>
                  <Input
                    id="staff-last-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="h-8.5 text-xs bg-paper border-line"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="space-y-1">
                <label htmlFor="staff-email" className="text-xs font-medium text-ink/80">
                  Email Address *
                </label>
                <Input
                  id="staff-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@city.gov"
                  className="h-8.5 text-xs bg-paper border-line"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="staff-phone" className="text-xs font-medium text-ink/80">
                  Phone
                </label>
                <Input
                  id="staff-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-8.5 text-xs bg-paper border-line"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="staff-password" className="text-xs font-medium text-ink/80">
                  Temporary Password *
                </label>
                <Input
                  id="staff-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-8.5 text-xs bg-paper border-line"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsProvisionOpen(false)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                className="cursor-pointer text-xs"
              >
                {isSubmitting ? "Provisioning..." : "Provision Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog — PATCH /staff/:id */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-paper border border-line text-ink p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const staffId = selectedStaff?.userId || selectedStaff?.id;
              if (!staffId) return;
              updateStaff.mutate(
                {
                  id: staffId,
                  payload: {
                    designation: editDesignation.trim() || undefined,
                    phone: editPhone.trim() || undefined,
                  },
                },
                {
                  onSuccess: () => {
                    setIsEditOpen(false);
                    staffQuery.refetch();
                  },
                },
              );
            }}
            className="space-y-3.5"
          >
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-base">Edit staff details</DialogTitle>
              <DialogDescription className="text-xs text-ink/60">
                Update designation, contact, or department assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1">
              <label htmlFor="staff-edit-designation" className="text-xs font-medium text-ink/80">
                Designation
              </label>
              <Input
                id="staff-edit-designation"
                value={editDesignation}
                onChange={(e) => setEditDesignation(e.target.value)}
                placeholder="e.g. Senior Technician"
                className="h-8.5 text-xs bg-paper border-line rounded-xs"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="staff-edit-phone" className="text-xs font-medium text-ink/80">
                Phone
              </label>
              <Input
                id="staff-edit-phone"
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
                disabled={updateStaff.isPending}
                className="cursor-pointer text-xs"
              >
                {updateStaff.isPending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
