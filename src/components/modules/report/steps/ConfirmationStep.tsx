"use client";

import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  FileCheck2,
  Loader2,
  MapPin,
  RotateCcw,
  Share2,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
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
  const [copiedIssue, setCopiedIssue] = useState(false);
  const [copiedReq, setCopiedReq] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!response) return null;

  const { trackingNumber, civicIssue, category, location } = response;
  const issueNumber = civicIssue?.issueNumber || trackingNumber;
  const reportedCount = civicIssue?.reportedCount || 1;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const trackUrl = `${appUrl}/track?issueNumber=${issueNumber}`;

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopy = async (text: string, isIssue: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isIssue) {
        setCopiedIssue(true);
        setTimeout(() => setCopiedIssue(false), 2000);
        toast.success("Issue tracking ID copied to clipboard");
      } else {
        setCopiedReq(true);
        setTimeout(() => setCopiedReq(false), 2000);
        toast.success("Service request reference copied to clipboard");
      }
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleShare = async () => {
    const summary = `Civic Issue #${issueNumber}: "${category?.name || "Reported Issue"}" in ${location?.address || "your city"}. Track real-time progress:`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: `Civix Issue ${issueNumber}`,
          text: summary,
          url: trackUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${summary} ${trackUrl}`);
        toast.success("Tracking link copied to clipboard");
      }
    } catch {
      // User cancelled share
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#FAF8F5",
      });

      const link = document.createElement("a");
      link.download = `Civix-Issue-${issueNumber}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Issue snapshot downloaded");
    } catch (_err) {
      toast.error("Could not generate snapshot download", {
        description: "Please take a screenshot or copy the issue tracking ID.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const submittedTime = formatDateTime(response.submittedAt || response.createdAt);
  const resolutionDeadline = formatDateTime(civicIssue?.resolutionDeadlineAt);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-6 sm:py-10 animate-slide-up motion-reduce:animate-none">
      {/* Official Civic Issue Tracking Card */}
      <div
        ref={cardRef}
        className="w-full max-w-xl bg-paper border border-line/70 rounded-2xl overflow-hidden shadow-lg transition-all text-ink"
      >
        {/* Top Accent Strip */}
        <div className="h-2 w-full bg-ledger" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Row: Seal / Badges */}
          <div className="flex items-start justify-between gap-3 sm:gap-4 pb-4 border-b border-line/40">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-ledger/10 text-ledger flex items-center justify-center shrink-0 border border-ledger/20 shadow-xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-ledger">
                    CIVIX OFFICIAL DISPATCH
                  </span>
                  <span className="h-1 w-1 rounded-full bg-line" />
                  <span className="font-mono text-[10px] text-ink/50 uppercase">
                    {submittedTime ? submittedTime.split(",")[0] : "Verified"}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-ink">Civic Issue Manifest</h3>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/20">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved animate-pulse" />
                {civicIssue?.status || response.status || "IN_PROGRESS"}
              </span>
              <span className="text-[10px] font-mono text-ink/45">Dispatched to Queue</span>
            </div>
          </div>

          {/* Primary Reference: Civic Issue Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink/55 font-medium flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-ledger" /> Primary Civic Issue ID
              </span>
              <span className="font-mono text-[10px] text-ink/45">Use for public lookup</span>
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-line/70 bg-field/30 shadow-xs">
              <div className="min-w-0">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-ink select-all break-all">
                  {issueNumber}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(issueNumber, true)}
                className="h-10 sm:h-8 px-2.5 text-xs gap-1.5 text-ink/70 hover:text-ink hover:bg-field/70 cursor-pointer rounded-lg border border-line/50 shrink-0"
                title="Copy issue tracking ID"
              >
                {copiedIssue ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-ledger" />
                    <span className="font-medium text-ledger">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Secondary Statement: Service Request Reference */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 py-2 px-3 rounded-lg bg-field/15 border border-line/40 text-xs font-mono">
            <span className="text-ink/60">Service Request:</span>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="font-bold text-ink select-all break-all">{trackingNumber}</span>
              <button
                type="button"
                onClick={() => handleCopy(trackingNumber, false)}
                aria-label="Copy service request number"
                className="text-ink/50 hover:text-ink cursor-pointer transition-colors p-1.5 -m-0.5 shrink-0"
                title="Copy service request number"
              >
                {copiedReq ? (
                  <Check className="h-3.5 w-3.5 text-ledger" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Issue Details Grid */}
          <div className="grid gap-3 sm:grid-cols-2 pt-1 font-body text-xs">
            {/* Problem Type */}
            <div className="p-3 rounded-xl border border-line/40 bg-field/20 space-y-1">
              <div className="flex items-center gap-1.5 text-ink/50 font-mono text-[10px] uppercase tracking-wider">
                <Tag className="w-3 h-3 text-ledger" /> Problem Type
              </div>
              <p className="font-display text-sm font-semibold text-ink">
                {category?.name || "Civic Infrastructure"}
              </p>
              {civicIssue?.title && (
                <p className="text-[11px] text-ink/65 line-clamp-1">{civicIssue.title}</p>
              )}
            </div>

            {/* SLA / Timeline */}
            <div className="p-3 rounded-xl border border-line/40 bg-field/20 space-y-1">
              <div className="flex items-center gap-1.5 text-ink/50 font-mono text-[10px] uppercase tracking-wider">
                <Clock className="w-3 h-3 text-ledger" /> Target Resolution
              </div>
              <p className="font-display text-sm font-semibold text-ink">
                {resolutionDeadline || "Under SLA Dispatch"}
              </p>
              <p className="text-[11px] text-ink/65">
                {reportedCount === 1 ? (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-ledger" /> 1st Citizen Report
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-ledger" /> {reportedCount} Citizens Corroborated
                  </span>
                )}
              </p>
            </div>

            {/* Location Details */}
            <div className="sm:col-span-2 p-3 rounded-xl border border-line/40 bg-field/20 space-y-1.5">
              <div className="flex items-center justify-between text-ink/50 font-mono text-[10px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-ledger" /> Physical Incident Site
                </span>
                {location?.latitude && location?.longitude && (
                  <span className="text-[10px] text-ink/60 font-mono">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </span>
                )}
              </div>
              <p className="font-medium text-ink text-xs sm:text-sm">
                {location?.address || "Address Recorded"}
              </p>
              {(location?.landmark || location?.postalCode) && (
                <p className="text-[11px] text-ink/65 flex items-center gap-2">
                  {location.landmark && <span>Landmark: {location.landmark}</span>}
                  {location.landmark && location.postalCode && <span>•</span>}
                  {location.postalCode && <span>Postal: {location.postalCode}</span>}
                </p>
              )}
            </div>
          </div>

          {/* Card Footer Stamp */}
          <div className="pt-3 border-t border-line/40 flex items-center justify-between text-[11px] font-mono text-ink/45">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-ledger" /> Logged: {submittedTime || "Today"}
            </span>
            <span>Civix Public Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Attachment status banner if uploading or errored */}
      <div className="mt-6 space-y-4 w-full max-w-xl">
        {attachmentStatus === "uploading" && (
          <div className="text-center text-xs font-mono text-ink/60 animate-pulse flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Synchronizing photo evidence to
            repository...
          </div>
        )}

        {attachmentStatus === "error" && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-signal-open/30 bg-signal-open/[0.06] p-3.5 text-xs">
            <p className="text-signal-open font-medium">
              Report registered, but attached photos encountered a synchronization issue.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetryAttachments}
              className="gap-1.5 shrink-0 cursor-pointer h-8 text-xs"
            >
              <RotateCcw className="w-3 h-3" /> Retry Upload
            </Button>
          </div>
        )}

        {/* Modern Action Buttons */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <Link href={`/track?issueNumber=${issueNumber}`} className="w-full sm:flex-1">
              <Button
                size="default"
                className="w-full h-10 px-4 text-xs sm:text-sm font-medium gap-2 cursor-pointer rounded-xl shadow-xs bg-ledger text-paper hover:bg-ledger/90"
              >
                Track Issue in Real-Time <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="default"
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="w-full sm:w-auto h-10 px-4 text-xs sm:text-sm font-medium gap-2 cursor-pointer rounded-xl border-line/70 bg-paper hover:bg-field/50 text-ink shadow-xs shrink-0"
              title="Save issue snapshot as PNG image"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Snapshot
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-medium">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-ink/65 hover:text-ink cursor-pointer transition-colors"
            >
              <Share2 className="h-3.5 w-3.5 text-ledger" /> Share Issue Link
            </button>

            <span className="text-line">•</span>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-ink/65 hover:text-ink cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Submit Another Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
