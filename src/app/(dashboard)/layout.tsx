import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard/DashboardShell";
import RoleGuard from "@/components/auth/role.guard";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
