"use client";

import { FileEdit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraftResumeBannerProps {
  context?: string | null;
  onResume: () => void;
  onClear: () => void;
}

export function DraftResumeBanner({ context, onResume, onClear }: DraftResumeBannerProps) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-ledger/40 bg-ledger/[0.04] p-4 sm:flex-row sm:items-center shadow-xs">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-ledger/10 text-ledger flex items-center justify-center shrink-0">
          <FileEdit className="h-4.5 w-4.5" />
        </div>
        <div className="space-y-0.5">
          <p className="font-display text-sm font-semibold text-ink">Unsaved report in progress</p>
          <p className="font-body text-xs text-ink/70">
            {context ?? "You have an unsaved draft from your recent session."}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-ink/60 hover:text-signal-open hover:bg-signal-open/10 text-xs gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Discard
        </Button>
        <Button size="sm" onClick={onResume} className="text-xs cursor-pointer shadow-xs">
          Resume Draft
        </Button>
      </div>
    </div>
  );
}
