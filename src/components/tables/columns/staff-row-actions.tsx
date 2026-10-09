"use client";

import type { Row } from "@tanstack/react-table";
import { Eye, MoreHorizontal, PenSquare, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER_ROLES } from "@/constant/role.constant";
import { useGetMe } from "@/hooks/auth.hook";
import { useUpdateStaffStatus } from "@/hooks/staff.hook";
import { hasPermission } from "@/lib/permissions";
import type { IStaffProfile } from "@/types";

interface StaffRowActionsProps {
  row: Row<IStaffProfile>;
}

export function StaffRowActions({ row }: StaffRowActionsProps) {
  const staff = row.original;
  const status = staff.user?.status;
  const { mutate: updateStatus, isPending } = useUpdateStaffStatus();

  const { data: userData } = useGetMe();
  const roles = userData?.data?.userRoles?.map((ur: any) => ur.role.code) || [];
  const canManage =
    hasPermission(roles, "technician:manage") ||
    roles.includes(USER_ROLES.SUPER_ADMIN) ||
    roles.includes(USER_ROLES.PLATFORM_ADMIN);

  const handleStatusChange = (newStatus: string) => {
    updateStatus({ id: staff.userId, status: newStatus });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-field">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <Link href={`/department/technicians/${staff.userId}`}>
          <DropdownMenuItem className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>
        </Link>

        {canManage && (
          <>
            <Link href={`/department/technicians/${staff.userId}/edit`}>
              <DropdownMenuItem className="cursor-pointer">
                <PenSquare className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            {status === "ACTIVE" ? (
              <DropdownMenuItem
                className="cursor-pointer text-signal-progress focus:text-signal-progress"
                onClick={() => handleStatusChange("INACTIVE")}
                disabled={isPending}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer text-signal-resolved focus:text-signal-resolved"
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={isPending}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            {status !== "SUSPENDED" && (
              <DropdownMenuItem
                className="cursor-pointer text-signal-open focus:text-signal-open"
                onClick={() => handleStatusChange("SUSPENDED")}
                disabled={isPending}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Suspend
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
