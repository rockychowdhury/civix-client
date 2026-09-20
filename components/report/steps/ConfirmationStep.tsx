"use client";

import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ServiceRequestResponse } from "@/services/report.service";

interface ConfirmationStepProps {
  response: ServiceRequestResponse | null;
  attachmentStatus: "idle" | "uploading" | "success" | "error";
  onRetryAttachments: () => void;
  onReset: () => void;
}

export function ConfirmationStep({
  response,
  attachmentStatus,
  onRetryAttachments,
  onReset,
}: ConfirmationStepProps) {
  if (!response) return null;

  const { trackingNumber, civicIssue, category } = response;
  const reportedCount = civicIssue?.reportedCount || 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 animate-in zoom-in-95 fade-in duration-700 ease-out">
      <div className="w-full max-w-lg bg-paper border border-line rounded-xs shadow-sm overflow-hidden relative">
        {/* Decorative receipt edge */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(circle,transparent_4px,#ffffff_5px)] bg-[size:10px_10px] -mt-1" />

        <div className="p-8 sm:p-12 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ledger/10 text-ledger mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink/50">
              Official Reference
            </p>
            <h2 className="font-mono text-2xl sm:text-3xl tracking-tight text-ink border-y border-line py-4">
              {trackingNumber}
            </h2>
          </div>

          <div className="space-y-4 text-ink/80 font-body text-sm">
            {reportedCount === 1 ? (
              <p>
                You're the first to report this. Thank you for keeping watch over your neighborhood.
              </p>
            ) : (
              <p>
                You've joined {reportedCount - 1} other neighbors already tracking this issue — that
                helps it get prioritized.
              </p>
            )}

            <div className="pt-4 border-t border-line border-dashed">
              <p className="text-xs text-ink/60 uppercase tracking-wide mb-1">Routed to</p>
              <p className="font-medium">{category?.name} Department</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4 w-full max-w-lg">
        {attachmentStatus === "uploading" && (
          <div className="text-center text-sm text-ink/60 animate-pulse">
            Attaching your photos...
          </div>
        )}

        {attachmentStatus === "error" && (
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-md">
            <p className="text-sm text-red-800">Some photos didn't upload.</p>
            <Button variant="secondary" size="sm" onClick={onRetryAttachments} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Retry
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Typically navigates to a real tracking page, using href="#" for now */}
          <Link href={`/track/${trackingNumber}`} className="w-full">
            <Button size="lg" className="w-full gap-2">
              Track this report <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Button variant="ghost" onClick={onReset} className="text-ink/60">
            Report another issue
          </Button>
        </div>
      </div>
    </div>
  );
}
