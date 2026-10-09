"use client";

import { format } from "date-fns";

interface WorkOrderStatusLedgerProps {
  createdAt?: string;
  updates: any[];
}

export function WorkOrderStatusLedger({ createdAt, updates }: WorkOrderStatusLedgerProps) {
  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-line/40 before:to-transparent">
      {updates.length > 0 ? (
        updates.map((update: any, i: number) => (
          <div
            key={i}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-paper bg-ledger text-paper shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_var(--color-paper)]">
              <div className="w-1.5 h-1.5 rounded-full bg-paper" />
            </div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-lg border border-line/20 bg-paper shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-sm font-semibold text-ink">
                  {update.status?.replace(/_/g, " ") || "Update"}
                </span>
                <span className="text-[10px] font-mono text-ink/40">
                  {update.createdAt ? format(new Date(update.createdAt), "MMM d, h:mm a") : ""}
                </span>
              </div>
              {update.notes && <p className="text-xs text-ink/70 mt-2">{update.notes}</p>}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-ink/50 italic text-center py-4 border border-dashed border-line/20 rounded-md">
          No history recorded yet.
        </p>
      )}
    </div>
  );
}
