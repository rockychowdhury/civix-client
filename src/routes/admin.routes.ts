import {
  Activity,
  Building2,
  Eye,
  Home,
  Map as MapIcon,
  ShieldAlert,
  ShieldCheck,
  Tags,
  UserPlus,
  Users,
} from "lucide-react";
import type { NavItem } from "./types";

/**
 * Canonical nested route list for the Super Admin / Platform Admin portal.
 *
 * Mounted at `/system` (see `ROLE_PORTAL_MAP`). Every entry maps 1:1 to a
 * section in `docs/admin-apis.md`. Parent `url` values are real routes —
 * detail pages (`[municipalityId]`, `[userId]`, …) hang off them but are
 * intentionally excluded from the sidebar nav (progressive disclosure).
 */
export const adminRoutes: NavItem[] = [
  {
    title: "Overview",
    url: "/system/overview",
    icon: Home,
    permission: "analytics:read",
  },
  {
    title: "Municipalities",
    url: "/system/municipalities",
    icon: Building2,
    permission: "municipality:read",
  },
  {
    title: "Users",
    url: "/system/users",
    icon: Users,
    permission: "user:read",
  },
  {
    title: "Staff",
    url: "/system/staff",
    icon: UserPlus,
    permission: "staff:read",
  },
  {
    title: "Roles & Access",
    url: "/system/roles",
    icon: ShieldCheck,
    permission: "role:read",
    items: [
      { title: "Roles", url: "/system/roles" },
      { title: "Permissions", url: "/system/roles/permissions" },
    ],
  },
  {
    title: "Departments",
    url: "/system/departments",
    icon: Building2,
    permission: "department:read",
    items: [
      { title: "Departments", url: "/system/departments" },
      { title: "Teams", url: "/system/departments/teams" },
    ],
  },
  {
    title: "Jurisdiction",
    url: "/system/zones",
    icon: MapIcon,
    permission: "zone:read",
    items: [
      { title: "Zones", url: "/system/zones" },
      { title: "Wards", url: "/system/wards" },
    ],
  },
  {
    title: "Categories & SLA",
    url: "/system/categories",
    icon: Tags,
    permission: "category:read",
    items: [
      { title: "Categories", url: "/system/categories" },
      { title: "SLA Policies", url: "/system/sla-policies" },
    ],
  },
  {
    title: "Oversight",
    url: "/system/oversight",
    icon: Eye,
    permission: "oversight:read",
    items: [
      { title: "Civic Issues", url: "/system/oversight/issues" },
      { title: "Service Requests", url: "/system/oversight/requests" },
      { title: "Feedback", url: "/system/oversight/feedback" },
    ],
  },
  {
    title: "System Health",
    url: "/system/system-health",
    icon: Activity,
    permission: "system:read",
  },
  {
    title: "Audit Log",
    url: "/system/audit-log",
    icon: ShieldAlert,
    permission: "system:read",
  },
];
