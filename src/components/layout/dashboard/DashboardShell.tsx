"use client";

import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/dashboard/MobileNav";
import { Sidebar } from "@/components/layout/dashboard/Sidebar";
import { Topbar } from "@/components/layout/dashboard/Topbar";
import { useGetMe } from "@/hooks/auth.hook";
import { getPortalNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Citizen",
  TECHNICIAN: "Technician",
  DISPATCHER: "Dispatcher",
  DEPARTMENT_MANAGER: "Dept. Manager",
  CITY_ADMIN: "City Admin",
  PLATFORM_ADMIN: "Platform Admin",
  SUPER_ADMIN: "Super Admin",
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useGetMe();

  if (isLoading || !user) {
    return <div className="min-h-screen bg-paper flex items-center justify-center">Loading...</div>;
  }

  const roles: string[] = [];
  if (user.roles) {
    roles.push(
      ...user.roles
        .map((r: any) => (typeof r === "string" ? r : r.role?.name || r.name))
        .filter(Boolean),
    );
  } else if (user.role) {
    roles.push(user.role);
  }
  const roleLabel = roles.length > 0 ? (ROLE_LABELS[roles[0]] ?? roles[0]) : undefined;

  const userName = user.citizenProfile?.firstName
    ? `${user.citizenProfile.firstName} ${user.citizenProfile.lastName}`
    : user.email || "User";

  const nav = getPortalNav(roles);

  if (!nav) return null;

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <Sidebar nav={nav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar nav={nav} userName={userName} roleLabel={roleLabel} />
        <MobileNav nav={nav} />

        <main
          className={cn(
            "flex-1 px-4 py-6 sm:px-8 sm:py-8",
            nav.portalId === "technician" && "pb-24 md:pb-8",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
