import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { MoveRight } from "lucide-react";
import type { StatusHistoryEntry } from "@/types";
import { format } from "date-fns";

function LedgerEntry({
  entry,
  isFirstEntry,
  isLastEntry,
}: {
  entry: StatusHistoryEntry;
  isFirstEntry: boolean; // Oldest
  isLastEntry: boolean; // Newest
}) {
  return (
    <div className="relative flex min-h-24">
      {/* Fixed-width timestamp column */}
      <div className="relative w-28 shrink-0 py-6 pr-6 text-right sm:w-32 lg:w-40">
        <div className="font-mono text-xs font-medium tracking-tight text-ink/50 sm:text-sm">
          {format(new Date(entry.createdAt), "dd MMM")}
        </div>
        <div className="font-mono text-[10px] text-ink/40 sm:text-xs">
          {format(new Date(entry.createdAt), "HH:mm")}
        </div>

        {/* The thin persistent vertical rule that connects entries */}
        {!isFirstEntry && (
          <div className="absolute bottom-0 right-0 top-0 w-px -translate-x-1/2 bg-ink/10" />
        )}
        
        {/* Very first entry distinct marker */}
        {isFirstEntry && (
          <div className="absolute right-0 top-0 h-full w-[2px] -translate-x-1/2 bg-ink/20" />
        )}
      </div>

      {/* Entry payload */}
      <div className="flex-1 py-6 pl-6 sm:pl-8 lg:pl-10">
        <div className="flex flex-wrap items-center gap-2">
          {entry.previousStatus && (
            <>
              <StatusPill status={entry.previousStatus} className="bg-transparent border-dashed text-ink/50 border-ink/20" />
              <MoveRight className="text-ink/30" size={14} />
            </>
          )}
          <StatusPill status={entry.newStatus} />
        </div>
        
        {entry.notes && (
          <div className="mt-3 font-body text-sm leading-relaxed text-ink/70">
            {entry.notes}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusHistoryLedger({ history }: { history: StatusHistoryEntry[] }) {
  // Ensure array is reverse chronological (newest at top)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="relative h-full overflow-hidden">
      {/* Top fade/gradient scroll affordance */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-paper to-transparent" />
      
      <div className="h-full overflow-y-auto overflow-x-hidden pt-8 pb-12 scrollbar-none">
        <div className="flex flex-col">
          {sortedHistory.map((entry, index) => {
            const isNewest = index === 0;
            const isOldest = index === sortedHistory.length - 1;
            
            return (
              <LedgerEntry
                key={entry.id}
                entry={entry}
                isLastEntry={isNewest}
                isFirstEntry={isOldest}
              />
            );
          })}
        </div>
      </div>
      
      {/* Bottom fade/gradient scroll affordance */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-paper to-transparent" />
    </div>
  );
}
