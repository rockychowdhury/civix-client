"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/dashboard/AppSidebar";
import { MobileNav } from "@/components/layout/dashboard/MobileNav";
import { Topbar } from "@/components/layout/dashboard/Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { USER_ROLES } from "@/constant/role.constant";
import { useGetMe } from "@/hooks/auth.hook";
import { getPortalNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.CITIZEN]: "Citizen",
  [USER_ROLES.TECHNICIAN]: "Technician",
  [USER_ROLES.DISPATCHER]: "Dispatcher",
  [USER_ROLES.DEPARTMENT_MANAGER]: "Dept. Manager",
  [USER_ROLES.CITY_ADMIN]: "City Admin",
  [USER_ROLES.PLATFORM_ADMIN]: "Platform Admin",
  [USER_ROLES.SUPER_ADMIN]: "Super Admin",
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const { data, isLoading } = useGetMe();
  const user = data?.data;

  if (isLoading || !user) {
    return <div className="min-h-screen bg-paper flex items-center justify-center"></div>;
  }

  const roles: string[] = [];
  if (user.userRoles && Array.isArray(user.userRoles)) {
    roles.push(
      ...user.userRoles
        .map((ur: any) => ur?.role?.code || ur?.role?.name?.toUpperCase())
        .filter(Boolean),
    );
  } else if (user.roles) {
    roles.push(
      ...user.roles
        .map((r: any) =>
          typeof r === "string"
            ? r.toUpperCase()
            : r.role?.code || r.role?.name?.toUpperCase() || r.name?.toUpperCase(),
        )
        .filter(Boolean),
    );
  } else if (user.role) {
    roles.push(
      typeof user.role === "string"
        ? user.role.toUpperCase()
        : user.role?.code || user.role?.name?.toUpperCase(),
    );
  }
  const roleLabel = roles.length > 0 ? (ROLE_LABELS[roles[0]] ?? roles[0]) : undefined;

  const userName = user.citizenProfile?.firstName
    ? `${user.citizenProfile.firstName} ${user.citizenProfile.lastName}`
    : user.email || "User";

  const departmentName = user.staffProfile?.departmentMembers?.[0]?.department?.name;

  const nav = getPortalNav(roles);

  return (
    <SidebarProvider>
      <AppSidebar userRoleCodes={roles} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-paper text-ink">
        {nav && (
          <Topbar
            nav={nav}
            userName={userName}
            roleLabel={roleLabel}
            departmentName={departmentName}
          />
        )}

        <main
          className={cn(
            "flex-1 overflow-y-auto w-full px-4 md:px-8 py-6 md:py-8",
            nav?.portalId === "technician" && "pb-24 md:pb-8",
          )}
        >
          {children}
        </main>

        {nav && <MobileNav nav={nav} />}
      </div>
    </SidebarProvider>
  );
}
