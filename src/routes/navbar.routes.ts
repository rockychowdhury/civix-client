import {
  BarChart3,
  Building,
  Building2,
  ClipboardList,
  FileText,
  FolderTree,
  History,
  Inbox,
  Layers,
  LayoutDashboard,
  ListTodo,
  type LucideIcon,
  MessageSquare,
  Settings,
  Shield,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { USER_ROLES } from "@/constant/role.constant";
import { normalizeRoleCode } from "@/lib/role-routing";

export interface NavbarRouteItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavbarRoleMenu {
  title: string;
  badge: string;
  routes: NavbarRouteItem[];
}

export function getNavbarRoleMenu(roles: string[]): NavbarRoleMenu {
  const normalized = roles.map(normalizeRoleCode);

  if (
    normalized.includes(USER_ROLES.SUPER_ADMIN) ||
    normalized.includes(USER_ROLES.PLATFORM_ADMIN)
  ) {
    return {
      title: "Platform Administration",
      badge: "Platform Admin",
      routes: [
        { label: "System Overview", href: "/system/overview", icon: Shield },
        { label: "Municipalities Directory", href: "/system/municipalities", icon: Building },
        { label: "Issue Categories Engine", href: "/system/categories", icon: Layers },
        { label: "User Access & Roles", href: "/system/users", icon: Users },
        { label: "Platform Health & Settings", href: "/system/platform-settings", icon: Settings },
      ],
    };
  }

  if (normalized.includes(USER_ROLES.CITY_ADMIN)) {
    return {
      title: "City Operations",
      badge: "City Admin",
      routes: [
        { label: "City Dashboard", href: "/municipality/overview", icon: Building2 },
        { label: "Civic Issues Radar", href: "/municipality/issues", icon: Layers },
        { label: "Departments & Teams", href: "/municipality/departments", icon: FolderTree },
        { label: "Performance & SLAs", href: "/municipality/analytics", icon: BarChart3 },
        { label: "Municipal Staff Directory", href: "/municipality/staff", icon: Users },
      ],
    };
  }

  if (
    normalized.includes(USER_ROLES.DEPARTMENT_MANAGER) ||
    normalized.includes(USER_ROLES.DISPATCHER)
  ) {
    const isManager = normalized.includes(USER_ROLES.DEPARTMENT_MANAGER);
    return {
      title: "Department Queue",
      badge: isManager ? "Dept Manager" : "Dispatcher",
      routes: [
        { label: "Dispatch Overview", href: "/department/overview", icon: LayoutDashboard },
        { label: "Citizen Reports Queue", href: "/department/citizen-reports", icon: Inbox },
        { label: "Work Orders Dispatch", href: "/department/work-orders", icon: ClipboardList },
        { label: "Field Teams & Crews", href: "/department/teams", icon: Users },
        { label: "Technicians Roster", href: "/department/technicians", icon: Wrench },
      ],
    };
  }

  if (normalized.includes(USER_ROLES.TECHNICIAN)) {
    return {
      title: "Technician Desk",
      badge: "Field Technician",
      routes: [
        { label: "Active Task Queue", href: "/technician/queue", icon: ListTodo },
        { label: "Assigned Work Orders", href: "/technician/work-orders", icon: Wrench },
        { label: "Resolution History", href: "/technician/history", icon: History },
        { label: "Technician Profile", href: "/technician/profile", icon: User },
      ],
    };
  }

  // Default: CITIZEN
  return {
    title: "Citizen Account",
    badge: "Resident",
    routes: [
      { label: "My Activity Dashboard", href: "/citizen/overview", icon: LayoutDashboard },
      { label: "My Submitted Reports", href: "/citizen/my-reports", icon: FileText },
      { label: "Resolution Feedback", href: "/citizen/feedback", icon: MessageSquare },
      { label: "Citizen Profile", href: "/citizen/profile", icon: User },
    ],
  };
}
