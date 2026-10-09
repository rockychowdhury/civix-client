/** Canonical paths for the Super Admin / Platform Admin portal (`/system`). */
export const ADMIN_PATHS = {
  overview: "/system/overview",
  municipalities: "/system/municipalities",
  municipalityDetail: (id: string) => `/system/municipalities/${id}`,
  users: "/system/users",
  userDetail: (id: string) => `/system/users/${id}`,
  staff: "/system/staff",
  staffDetail: (id: string) => `/system/staff/${id}`,
  roles: "/system/roles",
  roleDetail: (id: string) => `/system/roles/${id}`,
  permissions: "/system/roles/permissions",
  departments: "/system/departments",
  teams: "/system/departments/teams",
  zones: "/system/zones",
  wards: "/system/wards",
  categories: "/system/categories",
  slaPolicies: "/system/sla-policies",
  oversight: "/system/oversight",
  oversightIssues: "/system/oversight/issues",
  oversightRequests: "/system/oversight/requests",
  oversightFeedback: "/system/oversight/feedback",
} as const;

/** React Query key roots — one per admin domain. */
export const ADMIN_QUERY_KEYS = {
  analytics: ["admin", "analytics"],
  municipalities: ["admin", "municipalities"],
  users: ["admin", "users"],
  staff: ["admin", "staff"],
  roles: ["admin", "roles"],
  permissions: ["admin", "permissions"],
  departments: ["admin", "departments"],
  teams: ["admin", "teams"],
  zones: ["admin", "zones"],
  wards: ["admin", "wards"],
  categories: ["admin", "categories"],
  slaPolicies: ["admin", "sla-policies"],
  oversightIssues: ["admin", "oversight", "issues"],
  oversightRequests: ["admin", "oversight", "requests"],
  oversightFeedback: ["admin", "oversight", "feedback"],
} as const;

export const ADMIN_PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
} as const;

export const STAFF_PROVISION_KINDS = [
  "platform-admin",
  "city-admin",
  "department-manager",
  "dispatcher",
  "technician",
] as const;

export type StaffProvisionKind = (typeof STAFF_PROVISION_KINDS)[number];

export const STAFF_PROVISION_LABEL: Record<StaffProvisionKind, string> = {
  "platform-admin": "Platform Admin",
  "city-admin": "City Admin",
  "department-manager": "Department Manager",
  dispatcher: "Dispatcher",
  technician: "Technician",
};

export const ADMIN_USER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"] as const;

export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];

export const COVERAGE_STATUSES = ["ACTIVE", "INACTIVE", "PLANNED"] as const;
