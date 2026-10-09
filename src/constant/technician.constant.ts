/** Canonical enums for the technician field workflow (mirror civix-api). */

export const ASSIGNMENT_STATUSES = ["PENDING", "ACCEPTED", "REJECTED", "UNASSIGNED"] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

/** Work-order statuses the backend accepts on PATCH /work-orders/:id/status. */
export const TECH_WO_STATUSES = [
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_VERIFICATION",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
] as const;

/** Statuses that mark a job done from the technician's perspective. */
export const TECH_DONE_WO_STATUSES = ["PENDING_VERIFICATION", "RESOLVED", "CLOSED"] as const;

/** Update types a technician can log (ACCEPTED is system-created on accept). */
export const WORK_UPDATE_TYPES = [
  "ON_SITE",
  "PROGRESS",
  "BLOCKED",
  "DELAYED",
  "PAUSED",
  "RESUMED",
] as const;

export type WorkUpdateType = (typeof WORK_UPDATE_TYPES)[number];

/** Human labels for every update type the API can return (incl. system ones). */
export const WORK_UPDATE_TYPE_LABEL: Record<string, string> = {
  ACCEPTED: "Assignment accepted",
  ON_SITE: "Arrived on site",
  PROGRESS: "Progress note",
  BLOCKED: "Blocked",
  DELAYED: "Delayed",
  PAUSED: "Paused",
  RESUMED: "Resumed",
  COMPLETED: "Work completed",
};

/** Stages shown in the execution stepper, derived from work-order status. */
export const TECH_WORKFLOW_STAGES = ["Accepted", "On site", "Verification", "Done"] as const;
