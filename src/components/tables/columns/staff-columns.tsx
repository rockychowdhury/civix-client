import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { IStaffProfile } from "@/types";
import { format } from "date-fns";
import { StaffRowActions } from "./staff-row-actions";

export const staffColumns: ColumnDef<IStaffProfile>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-ink">
            {firstName} {lastName}
          </span>
          <span className="text-xs text-ink/60">{row.original.user?.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role & Dept",
    cell: ({ row }) => {
      const roles = row.original.user?.userRoles?.map((ur) => ur.role.code) || [];
      const isDispatcher = roles.includes("DISPATCHER");
      const isTechnician = roles.includes("TECHNICIAN");
      const isManager = roles.includes("DEPARTMENT_MANAGER");
      
      const roleLabel = isManager 
        ? "Dept Manager" 
        : isDispatcher 
          ? "Dispatcher" 
          : isTechnician 
            ? "Technician" 
            : "Staff";

      const depts = row.original.departmentMembers?.map(dm => dm.department.name).join(", ") || "No Department";

      return (
        <div className="flex flex-col gap-1 items-start">
          <Badge variant="outline" className="text-xs capitalize font-medium rounded-full bg-paper">
            {roleLabel}
          </Badge>
          <span className="text-xs text-ink/60 max-w-[200px] truncate" title={depts}>{depts}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "designation",
    header: "Designation",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-ink/80">
          {row.original.designation || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.user?.status || "UNKNOWN";
      let colorClass = "bg-line/20 text-ink/70";
      if (status === "ACTIVE") colorClass = "bg-signal-resolved/20 text-signal-resolved border-signal-resolved/30";
      if (status === "INACTIVE") colorClass = "bg-signal-progress/20 text-signal-progress border-signal-progress/30";
      if (status === "SUSPENDED" || status === "BANNED") colorClass = "bg-signal-open/20 text-signal-open border-signal-open/30";
      
      return (
        <Badge variant="outline" className={`capitalize font-medium rounded-full ${colorClass}`}>
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-ink/80">
          {row.original.phone || "-"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <StaffRowActions row={row} />,
  },
];
