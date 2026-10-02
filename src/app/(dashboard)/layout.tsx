import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role.guard";
import { DashboardShell } from "@/components/layout/dashboard/DashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
