import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role.guard";

export default function layout({ children }: { children: ReactNode }) {
  return <RoleGuard roles={["CITIZEN"]} > {children}</RoleGuard>;
}
