import { Activity, Building2, Home, Settings, ShieldAlert, Users } from "lucide-react";
import type { NavItem } from "./types";

export const systemRoutes: NavItem[] = [
  { title: "Overview", url: "/system/overview", icon: Home },
  { title: "Municipalities", url: "/system/municipalities", icon: Building2 },
  { title: "Users & Roles", url: "/system/users-roles", icon: Users },
  { title: "Platform Settings", url: "/system/platform-settings", icon: Settings },
  { title: "System Health", url: "/system/system-health", icon: Activity },
  { title: "Audit Log", url: "/system/audit-log", icon: ShieldAlert },
];
