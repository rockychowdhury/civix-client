export const ROLE_PORTAL_MAP: Record<string, string> = {
  CITIZEN: "/citizen",
  TECHNICIAN: "/technician",
  DISPATCHER: "/department",
  DEPARTMENT_MANAGER: "/department",
  CITY_ADMIN: "/municipality",
  PLATFORM_ADMIN: "/system",
  SUPER_ADMIN: "/system",
};

export const ROLE_DEFAULT_LANDING: Record<string, string> = {
  CITIZEN: "/citizen/overview",
  TECHNICIAN: "/technician/queue",
  DISPATCHER: "/department/work-orders",
  DEPARTMENT_MANAGER: "/department/overview",
  CITY_ADMIN: "/municipality/overview",
  PLATFORM_ADMIN: "/system/overview",
  SUPER_ADMIN: "/system/overview",
};

export function getDashboardHref(roles: string[]): string {
  if (!roles || roles.length === 0) return "/";

  // Ensure all roles are evaluated case-insensitively
  const normalizedRoles = roles.map((r) => r.toUpperCase());

  // Prioritize higher-level roles if a user has multiple
  if (normalizedRoles.includes("SUPER_ADMIN")) return ROLE_DEFAULT_LANDING["SUPER_ADMIN"];
  if (normalizedRoles.includes("PLATFORM_ADMIN")) return ROLE_DEFAULT_LANDING["PLATFORM_ADMIN"];
  if (normalizedRoles.includes("CITY_ADMIN")) return ROLE_DEFAULT_LANDING["CITY_ADMIN"];
  if (normalizedRoles.includes("DEPARTMENT_MANAGER"))
    return ROLE_DEFAULT_LANDING["DEPARTMENT_MANAGER"];
  if (normalizedRoles.includes("DISPATCHER")) return ROLE_DEFAULT_LANDING["DISPATCHER"];
  if (normalizedRoles.includes("TECHNICIAN")) return ROLE_DEFAULT_LANDING["TECHNICIAN"];
  if (normalizedRoles.includes("CITIZEN")) return ROLE_DEFAULT_LANDING["CITIZEN"];

  return "/";
}
