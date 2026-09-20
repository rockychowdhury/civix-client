"use client";

import { Button } from "@/components/ui/button";

interface DraftResumeBannerProps {
  onResume: () => void;
  onClear: () => void;
}

export function DraftResumeBanner({ onResume, onClear }: DraftResumeBannerProps) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-md border border-line bg-paper p-4 sm:flex-row sm:items-center">
      <div className="space-y-1">
        <p className="font-body text-sm font-medium text-ink">Pick up where you left off?</p>
        <p className="font-body text-xs text-ink/60">You have an unsaved report in progress.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onClear}>
          Start over
        </Button>
        <Button size="sm" onClick={onResume}>
          Resume report
        </Button>
      </div>
    </div>
  );
}
