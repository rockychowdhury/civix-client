import { USER_ROLES } from "@/constant/role.constant";
import { hasPermission, type Permission } from "@/lib/permissions";
import { normalizeRoleCode } from "@/lib/role-routing";

export type PortalId = "citizen" | "technician" | "department" | "municipality" | "system";

export type PortalNavItem = {
  label: string;
  href: string;
  permission?: Permission;
  mobileTab?: boolean;
};

export type PortalNav = {
  portalId: PortalId;
  portalLabel: string;
  items: PortalNavItem[];
};

const PORTAL_NAV: Record<PortalId, PortalNav> = {
  citizen: {
    portalId: "citizen",
    portalLabel: "Citizen",
    items: [
      { label: "Overview", href: "/citizen/overview" },
      { label: "My Reports", href: "/citizen/my-reports", permission: "issue:read" },
    ],
  },
  technician: {
    portalId: "technician",
    portalLabel: "Technician",
    items: [
      {
        label: "My Queue",
        href: "/technician/queue",
        permission: "workorder:read",
        mobileTab: true,
      },
      {
        label: "Completed",
        href: "/technician/history",
        permission: "workorder:read",
        mobileTab: true,
      },
      {
        label: "Profile",
        href: "/technician/profile",
        mobileTab: true,
      },
    ],
  },
  department: {
    portalId: "department",
    portalLabel: "Department",
    items: [
      { label: "Overview", href: "/department/overview", permission: "department:read" },
      { label: "Work Orders", href: "/department/work-orders", permission: "workorder:read" },
      { label: "Technicians", href: "/department/technicians", permission: "technician:read" },
    ],
  },
  municipality: {
    portalId: "municipality",
    portalLabel: "Municipality",
    items: [{ label: "Overview", href: "/municipality/overview" }],
  },
  system: {
    portalId: "system",
    portalLabel: "System Platform",
    items: [
      { label: "Overview", href: "/system/overview", permission: "analytics:read" },
      { label: "Municipalities", href: "/system/municipalities", permission: "municipality:read" },
      { label: "Users", href: "/system/users", permission: "user:read" },
      { label: "Staff", href: "/system/staff", permission: "staff:read" },
      { label: "Roles", href: "/system/roles", permission: "role:read" },
      { label: "Oversight", href: "/system/oversight/issues", permission: "oversight:read" },
    ],
  },
};

const ROLE_PRIORITY = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.PLATFORM_ADMIN,
  USER_ROLES.CITY_ADMIN,
  USER_ROLES.DEPARTMENT_MANAGER,
  USER_ROLES.DISPATCHER,
  USER_ROLES.TECHNICIAN,
  USER_ROLES.CITIZEN,
] as const;

const ROLE_TO_PORTAL: Record<string, PortalId> = {
  [USER_ROLES.CITIZEN]: "citizen",
  [USER_ROLES.TECHNICIAN]: "technician",
  [USER_ROLES.DISPATCHER]: "department",
  [USER_ROLES.DEPARTMENT_MANAGER]: "department",
  [USER_ROLES.CITY_ADMIN]: "municipality",
  [USER_ROLES.PLATFORM_ADMIN]: "system",
  [USER_ROLES.SUPER_ADMIN]: "system",
};

/**
 * Resolve the highest-priority role to a portal, then permission-filter its nav
 * items. The permission matrix is the single source of truth for visibility —
 * nav config only *tags* items with a permission, it never re-decides access.
 */
export function getPortalNav(roles: string[]): PortalNav | null {
  if (!roles || roles.length === 0) return null;

  const normalized = roles.map(normalizeRoleCode);

  for (const role of ROLE_PRIORITY) {
    if (normalized.includes(role)) {
      const portalId = ROLE_TO_PORTAL[role];
      const portal = PORTAL_NAV[portalId];
      return {
        ...portal,
        items: portal.items.filter(
          (item) => !item.permission || hasPermission(normalized, item.permission),
        ),
      };
    }
  }

  return null;
}
