import { USER_ROLES } from "@/constant/role.constant";

export const ROLE_PORTAL_MAP: Record<string, string> = {
  [USER_ROLES.CITIZEN]: "/citizen",
  [USER_ROLES.TECHNICIAN]: "/technician",
  [USER_ROLES.DISPATCHER]: "/department",
  [USER_ROLES.DEPARTMENT_MANAGER]: "/department",
  [USER_ROLES.CITY_ADMIN]: "/municipality",
  [USER_ROLES.PLATFORM_ADMIN]: "/system",
  [USER_ROLES.SUPER_ADMIN]: "/system",
};

export const ROLE_DEFAULT_LANDING: Record<string, string> = {
  [USER_ROLES.CITIZEN]: "/citizen/overview",
  [USER_ROLES.TECHNICIAN]: "/technician/queue",
  [USER_ROLES.DISPATCHER]: "/department/work-orders",
  [USER_ROLES.DEPARTMENT_MANAGER]: "/department/overview",
  [USER_ROLES.CITY_ADMIN]: "/municipality/overview",
  [USER_ROLES.PLATFORM_ADMIN]: "/system/overview",
  [USER_ROLES.SUPER_ADMIN]: "/system/overview",
};

export function getDashboardHref(roles: string[]): string {
  if (!roles || roles.length === 0) return "/";

  // Ensure all roles are evaluated case-insensitively
  const normalizedRoles = roles.map((r) => r.toUpperCase());

  // Prioritize higher-level roles if a user has multiple
  if (normalizedRoles.includes(USER_ROLES.SUPER_ADMIN)) return ROLE_DEFAULT_LANDING.SUPER_ADMIN;
  if (normalizedRoles.includes(USER_ROLES.PLATFORM_ADMIN))
    return ROLE_DEFAULT_LANDING.PLATFORM_ADMIN;
  if (normalizedRoles.includes(USER_ROLES.CITY_ADMIN)) return ROLE_DEFAULT_LANDING.CITY_ADMIN;
  if (normalizedRoles.includes(USER_ROLES.DEPARTMENT_MANAGER))
    return ROLE_DEFAULT_LANDING.DEPARTMENT_MANAGER;
  if (normalizedRoles.includes(USER_ROLES.DISPATCHER)) return ROLE_DEFAULT_LANDING.DISPATCHER;
  if (normalizedRoles.includes(USER_ROLES.TECHNICIAN)) return ROLE_DEFAULT_LANDING.TECHNICIAN;
  if (normalizedRoles.includes(USER_ROLES.CITIZEN)) return ROLE_DEFAULT_LANDING.CITIZEN;

  return "/";
}
