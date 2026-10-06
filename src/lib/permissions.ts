export type Role =
  | "CITIZEN"
  | "TECHNICIAN"
  | "DISPATCHER"
  | "DEPARTMENT_MANAGER"
  | "CITY_ADMIN"
  | "PLATFORM_ADMIN"
  | "SUPER_ADMIN";

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
  // Departments
  | "department:read"
  | "department:create"
  | "department:update"
  // System
  | "system:read";

export const PERMISSION_MATRIX: Record<Role, Permission[]> = {
  CITIZEN: ["issue:read"],
  TECHNICIAN: ["workorder:read", "workorder:update", "issue:read"],
  DISPATCHER: ["workorder:assign", "workorder:read", "issue:read", "issue:update", "technician:read", "technician:manage", "department:read"],
  DEPARTMENT_MANAGER: [
    "workorder:assign",
    "workorder:read",
    "workorder:override-priority",
    "technician:manage",
    "technician:read",
    "issue:read",
    "issue:update",
    "department:read",
  ],
  CITY_ADMIN: [
    "category:read",
    "category:edit",
    "department:read",
    "department:create",
    "department:update",
    "municipality:read",
    "municipality:update",
    "issue:read",
  ],
  PLATFORM_ADMIN: [
    "system:read",
    "municipality:read",
    "municipality:create",
    "municipality:update",
  ],
  SUPER_ADMIN: [
    "system:read",
    "municipality:read",
    "municipality:create",
    "municipality:update",
    "municipality:delete",
  ],
};

export function hasPermission(roles: string[], permission: Permission): boolean {
  return roles.some((role) => {
    const rolePermissions = PERMISSION_MATRIX[role as Role];
    return rolePermissions?.includes(permission) ?? false;
  });
}
