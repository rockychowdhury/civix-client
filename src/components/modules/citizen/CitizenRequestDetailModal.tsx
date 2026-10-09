"use client";

import { format } from "date-fns";
import { Calendar, Clock, ExternalLink, MapPin, ShieldAlert, Star, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCitizenServiceRequest, useCivicIssueDetail } from "@/hooks/citizen.hook";
import { cn, formatWard, formatZone } from "@/lib/utils";
import { CitizenFeedbackDialog } from "./CitizenFeedbackDialog";

interface CitizenRequestDetailModalProps {
  requestId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const LIFECYCLE_STEPS = [
  { key: "SUBMITTED", label: "Submitted", desc: "Report received by municipal intake" },
  { key: "TRIAGED", label: "Triaged", desc: "Verified and linked to civic work pipeline" },
  { key: "IN_PROGRESS", label: "In Progress", desc: "Technician dispatched and actively working" },
  { key: "RESOLVED", label: "Resolved", desc: "Resolution verified and completed" },
];

function getActiveStepIndex(status: string): number {
  const s = status.toUpperCase();
  if (s === "RESOLVED" || s === "CLOSED" || s === "COMPLETED") return 3;
  if (s === "IN_PROGRESS" || s === "PENDING_VERIFICATION") return 2;
  if (s === "ASSIGNED" || s === "ACCEPTED" || s === "SUGGESTED" || s === "PENDING_ASSIGNMENT")
    return 1;
  return 0;
}

export function CitizenRequestDetailModal({
  requestId,
  isOpen,
  onClose,
}: CitizenRequestDetailModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const { data: requestRes, isLoading } = useCitizenServiceRequest(requestId || "");
  const request = requestRes?.data;

  const linkedCivicIssueId = request?.linkedIssueId || request?.linkedIssue?.id;
  const { data: issueRes } = useCivicIssueDetail(linkedCivicIssueId || "");
  const civicIssue = issueRes?.data || request?.civicIssue;

  if (!isOpen || !requestId) return null;

  const activeStep = request ? getActiveStepIndex(request.status) : 0;
  const isResolved =
    request?.status?.toUpperCase() === "RESOLVED" || request?.status?.toUpperCase() === "CLOSED";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-xl border-l border-line bg-paper flex flex-col gap-0 overflow-y-auto p-0 text-ink">
          {/* Header */}
          <SheetHeader className="p-6 border-b border-line bg-field/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
                  Service Request
                </span>
                <SheetTitle className="font-display text-2xl text-ink font-semibold mt-0.5">
                  {request?.trackingNumber || "Loading..."}
                </SheetTitle>
                <SheetDescription className="text-xs text-ink/60 mt-1 flex items-center gap-2">
                  <Calendar className="size-3.5 text-ink/40" />
                  {request?.submittedAt
                    ? format(new Date(request.submittedAt), "PPP 'at' p")
                    : "Fetching details..."}
                </SheetDescription>
              </div>
              {request?.status && <StatusPill status={request.status} />}
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="p-6 space-y-6 flex-1">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-sm font-mono text-ink/40 animate-pulse">
                Loading request details...
              </div>
            ) : !request ? (
              <div className="p-8 text-center text-sm text-signal-open">
                Unable to load request details.
              </div>
            ) : (
              <>
                {/* Lifecycle Progress Bar */}
                <div className="rounded-lg border border-line bg-field/30 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-ink/60">
                    <span>LIFECYCLE STATUS</span>
                    <span>Step {activeStep + 1} of 4</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {LIFECYCLE_STEPS.map((step, idx) => {
                      const isComplete = idx <= activeStep;
                      const isCurrent = idx === activeStep;
                      return (
                        <div key={step.key} className="space-y-1.5">
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-colors",
                              isComplete ? "bg-signal-resolved" : "bg-line",
                            )}
                          />
                          <p
                            className={cn(
                              "text-[11px] font-medium leading-tight truncate",
                              isCurrent
                                ? "text-ink font-semibold"
                                : isComplete
                                  ? "text-ink/80"
                                  : "text-ink/40",
                            )}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description & Category */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60">
                      Problem Description
                    </h4>
                    {request.category && (
                      <Badge variant="outline" className="text-xs border-line bg-paper text-ink">
                        <Tag className="size-3 mr-1 text-ink/50" />
                        {request.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 rounded-md border border-line bg-field/20 text-sm font-body text-ink whitespace-pre-wrap leading-relaxed">
                    {request.description}
                  </div>
                </div>

                {/* Location */}
                {request.location && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60">
                      Location
                    </h4>
                    <div className="p-3.5 rounded-md border border-line bg-field/10 flex items-start gap-3">
                      <MapPin className="size-4 text-signal-progress shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-ink">{request.location.address}</p>
                        <p className="text-xs text-ink/60 mt-0.5 font-mono">
                          {formatWard(request.location.ward)} • {formatZone(request.location.zone)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photo Evidence */}
                {request.attachments && request.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60">
                      Submitted Photos ({request.attachments.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      {request.attachments.map((att, idx) => (
                        <button
                          key={att.id || idx}
                          type="button"
                          onClick={() => setSelectedPhoto(att.url)}
                          className="group relative aspect-video rounded-md overflow-hidden border border-line bg-field focus:outline-none focus:ring-2 focus:ring-signal-open cursor-pointer"
                        >
                          <Image
                            src={att.url}
                            alt={`Photo evidence ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Civic Issue Timeline Card */}
                {civicIssue && (
                  <div className="rounded-lg border border-line bg-field/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="size-4 text-signal-open" />
                        <span className="text-xs font-mono uppercase tracking-wider text-ink/70">
                          Civic Issue Pipeline
                        </span>
                      </div>
                      <Link
                        href={`/track?issueNumber=${encodeURIComponent(civicIssue.issueNumber)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-mono text-signal-progress hover:underline cursor-pointer"
                      >
                        Public Tracker <ExternalLink className="size-3" />
                      </Link>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-ink font-mono">{civicIssue.issueNumber}</p>
                        {civicIssue.title && (
                          <p className="text-xs text-ink/60 mt-0.5">{civicIssue.title}</p>
                        )}
                      </div>
                      <StatusPill status={civicIssue.status} />
                    </div>

                    {request.slaTarget && (
                      <div className="flex items-center gap-1.5 text-xs text-ink/60 font-mono pt-1 border-t border-line/40">
                        <Clock className="size-3 text-ink/40" />
                        <span>SLA Target: {format(new Date(request.slaTarget), "PPP")}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback / Quality Review Section */}
                {isResolved && (
                  <div className="rounded-lg border border-line bg-paper p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-ink/70">
                        Resolution Quality & Feedback
                      </h4>
                      {request.feedback && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "size-3.5",
                                s <= (request.feedback?.rating ?? 0)
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-ink/20",
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {request.feedback ? (
                      <div className="p-3 rounded-md bg-field/30 border border-line/40 text-xs text-ink/80 space-y-1">
                        <p className="font-medium text-ink">
                          You rated this {request.feedback.rating} out of 5 stars
                        </p>
                        {request.feedback.comment && (
                          <p className="italic text-ink/70 font-body">
                            "{request.feedback.comment}"
                          </p>
                        )}
                        {request.feedback.createdAt && (
                          <p className="text-[10px] font-mono text-ink/40 pt-1">
                            Submitted {format(new Date(request.feedback.createdAt), "PPP")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4 p-3 rounded-md bg-signal-resolved/[0.05] border border-signal-resolved/20">
                        <div className="text-xs">
                          <p className="font-medium text-ink">
                            This issue has been marked resolved
                          </p>
                          <p className="text-ink/60">
                            Did the city solve this to your satisfaction?
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setIsFeedbackOpen(true)}
                          className="shrink-0 text-xs cursor-pointer"
                        >
                          <Star className="size-3.5 mr-1.5" /> Rate Work
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Photo Lightbox Dialog */}
      {selectedPhoto && (
        <button
          type="button"
          aria-label="Close photo preview"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer w-full border-none"
          onClick={() => setSelectedPhoto(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-[70vh]">
            <Image
              src={selectedPhoto}
              alt="Enlarged photo evidence"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        </button>
      )}

      {/* Feedback Dialog */}
      <CitizenFeedbackDialog
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        serviceRequestId={request?.id || null}
        trackingNumber={request?.trackingNumber}
      />
    </>
  );
}
