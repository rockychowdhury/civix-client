import { USER_ROLES } from "@/constant/role.constant";
import type { UserRole } from "@/types/auth.type";

// Define the permissions available in the system
export type Permission =
  // Work Orders
  | "workorder:assign"
  | "workorder:read"
  | "workorder:update"
  | "workorder:override-priority"
  // Technicians
  | "technician:manage"
  | "technician:read"
  // Issues
  | "issue:read"
  | "issue:update"
  // Categories
  | "category:read"
  | "category:edit"
  // Municipalities
  | "municipality:create"
  | "municipality:read"
  | "municipality:update"
  | "municipality:delete"
  // Platform admin
  | "analytics:read"
  | "user:read"
  | "user:update"
  | "user:delete"
  | "staff:read"
  | "staff:manage"
  | "role:read"
  | "role:manage"
  | "zone:read"
  | "zone:manage"
  | "ward:read"
  | "ward:manage"
  | "sla:read"
  | "sla:manage"
  | "team:read"
  | "team:manage"
  | "oversight:read"
  // Departments
  | "department:read"
  | "department:create"
  | "department:update"
  // System
  | "system:read";

export const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  [USER_ROLES.CITIZEN]: ["issue:read"],
  [USER_ROLES.TECHNICIAN]: ["workorder:read", "workorder:update", "issue:read"],
  [USER_ROLES.DISPATCHER]: [
    "workorder:assign",
    "workorder:read",
    "issue:read",
    "issue:update",
    "technician:read",
    "technician:manage",
    "department:read",
  ],
  [USER_ROLES.DEPARTMENT_MANAGER]: [
    "workorder:assign",
    "workorder:read",
    "workorder:override-priority",
    "technician:manage",
    "technician:read",
    "issue:read",
    "issue:update",
    "department:read",
  ],
  [USER_ROLES.CITY_ADMIN]: [
    "category:read",
    "category:edit",
    "department:read",
    "department:create",
    "department:update",
    "municipality:read",
    "municipality:update",
    "issue:read",
  ],
  [USER_ROLES.PLATFORM_ADMIN]: [
    "system:read",
    "analytics:read",
    "municipality:read",
    "municipality:create",
    "municipality:update",
    "user:read",
    "user:update",
    "staff:read",
    "staff:manage",
    "role:read",
    "department:read",
    "department:create",
    "department:update",
    "team:read",
    "team:manage",
    "category:read",
    "category:edit",
    "zone:read",
    "ward:read",
    "sla:read",
    "oversight:read",
    "issue:read",
  ],
  [USER_ROLES.SUPER_ADMIN]: [
    "system:read",
    "analytics:read",
    "municipality:read",
    "municipality:create",
    "municipality:update",
    "municipality:delete",
    "user:read",
    "user:update",
    "user:delete",
    "staff:read",
    "staff:manage",
    "role:read",
    "role:manage",
    "department:read",
    "department:create",
    "department:update",
    "team:read",
    "team:manage",
    "category:read",
    "category:edit",
    "zone:read",
    "zone:manage",
    "ward:read",
    "ward:manage",
    "sla:read",
    "sla:manage",
    "oversight:read",
    "issue:read",
  ],
};

export function hasPermission(roles: string[], permission: Permission): boolean {
  return roles.some((role) => {
    const rolePermissions = PERMISSION_MATRIX[role as UserRole];
    return rolePermissions?.includes(permission) ?? false;
  });
}
