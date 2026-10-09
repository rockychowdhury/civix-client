"use client";

import { Check } from "lucide-react";
import { TECH_WORKFLOW_STAGES } from "@/constant/technician.constant";
import { cn } from "@/lib/utils";

/** Derive the 0-based workflow stage from a work-order status. */
export function stageForStatus(status?: string): number {
  switch ((status || "").toUpperCase()) {
    case "IN_PROGRESS":
      return 1;
    case "PENDING_VERIFICATION":
      return 2;
    case "RESOLVED":
    case "CLOSED":
      return 3;
    default:
      return 0;
  }
}

/** Horizontal stage tracker: Accepted → On site → Verification → Done. */
export function WorkflowStepper({ status }: { status?: string }) {
  const current = stageForStatus(status);
  return (
    <ol aria-label="Work progress" className="flex items-center gap-0">
      {TECH_WORKFLOW_STAGES.map((stage, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={stage} className="flex min-w-0 flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-xs",
                  done && "border-ledger bg-ledger text-paper",
                  active && "border-ledger bg-paper text-ledger",
                  !done && !active && "border-line/60 bg-paper text-ink/35",
                )}
              >
                {done ? <Check className="size-3.5" /> : <span>{i + 1}</span>}
              </span>
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "font-body text-[0.6875rem] whitespace-nowrap",
                  active ? "font-medium text-ink" : "text-ink/45",
                )}
              >
                {stage}
              </span>
            </div>
            {i < TECH_WORKFLOW_STAGES.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-1 mb-6 h-px min-w-4 flex-1",
                  i < current ? "bg-ledger" : "bg-line/50",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
