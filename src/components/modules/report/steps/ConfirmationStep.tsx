"use client";

import { ArrowRight, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ServiceRequestResponse } from "@/types";

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const trackUrl = `${appUrl}/track?issueNumber=${trackingNumber}`;

  const handleShare = async () => {
    const summary = `I reported "${category?.name ?? "a civic issue"}" on Civix (Ref ${trackingNumber}).`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: "Civix report",
          text: summary,
          url: trackUrl,
        });
      } else {
        const copyText = `${summary} Track it: ${trackUrl}`;
        await navigator.clipboard.writeText(copyText);
        toast.success("Share details copied to clipboard");
      }
    } catch {
      // User closed the share sheet or clipboard was unavailable — low-stakes, skip silently.
    }
  };

  const handleCopyTrackingNumber = async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      toast.success("Tracking number copied to clipboard");
    } catch {
      toast.error("Failed to copy tracking number");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="w-full max-w-lg bg-paper border border-line rounded-xs overflow-hidden relative animate-slide-up motion-reduce:animate-none">
        {/* Decorative receipt edge */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(circle,transparent_4px,currentColor_5px)] bg-[size:10px_10px] -mt-1 text-paper" />

        <div className="relative p-8 sm:p-12 text-center space-y-8">
          {/* Official stamp — settles in with a single scale+opacity motion */}
          <div
            aria-hidden="true"
            className="absolute right-6 top-8 h-24 w-24 -rotate-12 rounded-full border-2 border-dashed border-ledger/60 text-ledger animate-slide-up [animation-delay:150ms] motion-reduce:animate-none opacity-80 select-none"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full">
              <p className="px-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-center leading-relaxed">
                Received
                <span className="block">Civix</span>
              </p>
            </div>
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ledger/10 text-ledger">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink/50">
              Official Reference
            </p>
            <div className="flex items-center justify-center border-y border-line py-4">
              <h2 className="font-mono text-2xl sm:text-3xl tracking-tight text-ink">
                {trackingNumber}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyTrackingNumber}
                className="ml-2 h-8 w-8 text-ink/50 hover:text-ink cursor-pointer"
                title="Copy tracking number"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </Button>
            </div>
          </div>

          <div className="space-y-4 text-ink/80 font-body text-sm">
            {reportedCount === 1 ? (
              <p>
                You&apos;re the first to report this. Thank you for keeping watch over your
                neighborhood.
              </p>
            ) : (
              <p>
                You&apos;ve joined {reportedCount - 1} other neighbors already tracking this issue —
                that helps it get prioritized.
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
          <div className="text-center text-sm text-ink/60 animate-dot motion-reduce:animate-none">
            Attaching your photos...
          </div>
        )}

        {attachmentStatus === "error" && (
          <div className="flex items-center justify-between gap-3 rounded-xs border border-signal-open/25 bg-signal-open/[0.06] p-4">
            <p className="text-sm text-signal-open">
              Some photos didn&apos;t upload — your report is safe. Would you like to retry?
            </p>
            <Button variant="secondary" size="sm" onClick={onRetryAttachments} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Retry
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Typically navigates to a real tracking page, using href="#" for now */}
          <Link href={`/track?issueNumber=${trackingNumber}`} className="w-full">
            <Button size="lg" className="w-full gap-2 cursor-pointer">
              Track this report <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <div className="flex flex-col items-center gap-1">
            <Button variant="ghost" onClick={handleShare} className="gap-2 text-ink/50">
              <Share2 className="h-4 w-4" /> Let others know this was reported
            </Button>
            <Button variant="ghost" onClick={onReset} className="text-ink/60">
              Report another issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
