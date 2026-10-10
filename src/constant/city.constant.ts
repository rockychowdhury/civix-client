/** Canonical paths for the City Admin portal (`/municipality`). */
export const CITY_PATHS = {
  overview: "/municipality/overview",
  departments: "/municipality/departments",
  teams: "/municipality/departments/teams",
  staff: "/municipality/staff",
  staffDetail: (id: string) => `/municipality/staff/${id}`,
  zones: "/municipality/zones",
  wards: "/municipality/wards",
  issues: "/municipality/issues",
  requests: "/municipality/requests",
  categories: "/municipality/categories",
  slaPolicies: "/municipality/sla-policies",
  feedback: "/municipality/feedback",
  notifications: "/municipality/notifications",
  profile: "/municipality/profile",
} as const;

/** React Query key roots — one per city domain. */
export const CITY_QUERY_KEYS = {
  feedback: ["city", "feedback"],
  notifications: ["notifications"],
  cityIssues: ["city", "issues"],
  cityRequests: ["city", "requests"],
} as const;

/** Staff kinds a City Admin may provision (no city/platform admin creation). */
export const CITY_STAFF_KINDS = ["department-manager", "dispatcher", "technician"] as const;

export type CityStaffKind = (typeof CITY_STAFF_KINDS)[number];
