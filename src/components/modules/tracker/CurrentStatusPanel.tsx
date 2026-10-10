import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import type { CivicIssue } from "@/types";

export function CurrentStatusPanel({ issue }: { issue: CivicIssue }) {
  return (
    <div className="flex flex-col gap-6 pb-8 lg:pb-0">
      {/* Status section prominently displayed */}
      <div className="flex flex-col items-start gap-4">
        <StatusPill
          status={issue.status}
          className="px-3.5 py-1.5 text-xs tracking-widest sm:px-4 sm:py-2 sm:text-sm"
        />
        <div>
          <h2 className="font-mono text-lg font-medium tracking-tight text-ink/75 sm:text-xl">
            {issue.issueNumber}
          </h2>
          <h1 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
            {issue.title}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-4 font-body text-sm leading-relaxed text-ink/80 sm:text-base">
        <div className="flex flex-col gap-1">
          <p>{issue.category.name}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p>{issue.location.address}</p>
          {issue.municipality?.name && (
            <p className="text-ink/60">{issue.municipality.name}</p>
          )}
        </div>

        {issue.reportedCount > 1 && (
          <div className="mt-2 flex items-start gap-2 border-l-2 border-signal-resolved pl-4 text-sm">
            <p>
              Reported by{" "}
              <strong className="font-medium">
                {issue.reportedCount - 1} other neighbor{issue.reportedCount - 1 > 1 ? "s" : ""}
              </strong>
              . You are not alone in tracking this.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
