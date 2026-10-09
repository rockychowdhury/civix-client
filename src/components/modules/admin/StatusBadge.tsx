"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const POSITIVE = new Set(["ACTIVE", "RESOLVED", "TRIAGED", "VERIFIED", "SUBMITTED"]);
const WARNING = new Set(["INACTIVE", "SUSPENDED", "PENDING", "PLANNED", "IN_PROGRESS", "ONGOING"]);
const NEGATIVE = new Set([
  "BANNED",
  "DISBANDED",
  "DELETED",
  "CANCELLED",
  "CLOSED",
  "BREACHED",
  "FAILED",
]);

/** Signal-colored status pill using theme tokens only. */
export function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const value = (status || "UNKNOWN").toUpperCase();
  let colorClass = "border-line bg-field/40 text-ink/70";
  if (POSITIVE.has(value)) {
    colorClass = "border-signal-resolved/30 bg-signal-resolved/15 text-signal-resolved";
  } else if (WARNING.has(value)) {
    colorClass = "border-signal-progress/30 bg-signal-progress/15 text-signal-progress";
  } else if (NEGATIVE.has(value)) {
    colorClass = "border-signal-open/30 bg-signal-open/15 text-signal-open";
  }
  return (
    <Badge variant="outline" className={cn("font-medium capitalize", colorClass, className)}>
      {value.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}
