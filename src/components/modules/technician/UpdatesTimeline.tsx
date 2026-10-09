"use client";

import { format } from "date-fns";
import { WORK_UPDATE_TYPE_LABEL, type WorkUpdateType } from "@/constant/technician.constant";
import type { WorkUpdate } from "@/types";

/** Field log rendered from GET /work-orders/:id `updates[]` (newest first). */
export function UpdatesTimeline({ updates }: { updates: WorkUpdate[] }) {
  if (updates.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-line/40 px-4 py-6 text-center font-body text-sm text-ink/50 italic">
        No site log yet — your first update starts the record.
      </p>
    );
  }
  return (
    <ol className="relative flex flex-col gap-0 border-l-2 border-line/40 pl-0">
      {updates.map((update) => (
        <li key={update.id} className="relative flex flex-col gap-1 py-3 pl-5 first:pt-0 last:pb-0">
          <span
            aria-hidden="true"
            className="absolute top-4 -left-[5px] size-2 rounded-full bg-ledger ring-4 ring-paper first:top-1"
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-display text-sm font-semibold text-ink">
              {WORK_UPDATE_TYPE_LABEL[update.updateType as WorkUpdateType] ||
                update.updateType.replace(/_/g, " ")}
            </span>
            <time className="font-mono text-[0.6875rem] text-ink/45" dateTime={update.createdAt}>
              {format(new Date(update.createdAt), "MMM d, h:mm a")}
            </time>
          </div>
          {update.note ? (
            <p className="font-body text-sm leading-relaxed text-ink/75">{update.note}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
