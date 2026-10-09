/** Canonical paths for the Citizen portal (`/citizen`). */
export const CITIZEN_PATHS = {
  overview: "/citizen/overview",
  myReports: "/citizen/my-reports",
  report: "/report",
  feedback: "/citizen/feedback",
  profile: "/citizen/profile",
  publicTrack: (issueNumber: string) => `/track?issueNumber=${encodeURIComponent(issueNumber)}`,
} as const;

/** React Query key roots for citizen portal. */
export const CITIZEN_QUERY_KEYS = {
  myRequests: ["citizen", "my-requests"],
  myProfile: ["citizen", "profile"],
  feedback: ["citizen", "feedback"],
  notifications: ["notifications"],
} as const;

export const CITIZEN_TRUST_LEVELS = {
  NEW: "NEW",
  REGULAR: "REGULAR",
  TRUSTED: "TRUSTED",
} as const;

export type CitizenTrustLevelCode = keyof typeof CITIZEN_TRUST_LEVELS;

export const CITIZEN_TRUST_INFO: Record<
  CitizenTrustLevelCode,
  {
    label: string;
    description: string;
    badgeClass: string;
    dotClass: string;
    perk: string;
  }
> = {
  NEW: {
    label: "New Citizen",
    description:
      "Welcome to Civix. Your reports will undergo standard automated and dispatch triage.",
    badgeClass: "border-line bg-paper text-ink/70",
    dotClass: "bg-ink/40",
    perk: "Standard triage queue",
  },
  REGULAR: {
    label: "Active Contributor",
    description: "Thank you for consistently reporting verified issues in your community.",
    badgeClass: "border-signal-progress/30 bg-signal-progress/[0.08] text-signal-progress",
    dotClass: "bg-signal-progress",
    perk: "Priority automated dispatch",
  },
  TRUSTED: {
    label: "Trusted Citizen",
    description:
      "Top-tier community reporter with high resolution accuracy. Your reports receive instant expedited dispatch.",
    badgeClass: "border-signal-resolved/30 bg-signal-resolved/[0.08] text-signal-resolved",
    dotClass: "bg-signal-resolved",
    perk: "Instant triage & rapid routing",
  },
};
