"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Image as ImageIcon,
  RotateCcw,
  ShieldCheck,
  Star,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useResolutionById,
  useResolutionFeedback,
  useVerifyResolution,
} from "@/hooks/resolution.hook";
import { cn } from "@/lib/utils";
import type { WorkResolution } from "@/types";

interface ResolutionVerificationCardProps {
  resolutionId?: string;
  initialResolution?: WorkResolution | null;
  workOrderStatus?: string;
  onVerifiedSuccess?: () => void;
}

export function ResolutionVerificationCard({
  resolutionId,
  initialResolution,
  workOrderStatus,
  onVerifiedSuccess,
}: ResolutionVerificationCardProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Verification action dialog state
  const [activeDecision, setActiveDecision] = useState<"VERIFIED" | "REJECTED" | "REOPENED" | null>(
    null,
  );
  const [decisionNotes, setDecisionNotes] = useState("");

  const verifyMutation = useVerifyResolution();

  // Fetch full resolution data if resolutionId is present
  const { data: resData } = useResolutionById(resolutionId);
  const resolution: WorkResolution | undefined = resData || initialResolution || undefined;

  // Fetch resolution feedbacks
  const { data: feedbacksData, isLoading: isFeedbacksLoading } =
    useResolutionFeedback(resolutionId);

  const feedbacks = feedbacksData || resolution?.feedbacks || [];
  const verifications = resolution?.verifications || [];

  const isPendingVerification =
    workOrderStatus?.toUpperCase() === "PENDING_VERIFICATION" ||
    (resolution && !resolution.approvedAt && !resolution.rejectedAt);

  const handleDecisionSubmit = async () => {
    if (!activeDecision || !resolution?.id) return;

    await verifyMutation.mutateAsync({
      id: resolution.id,
      payload: {
        status: activeDecision,
        notes: decisionNotes.trim() || undefined,
      },
    });

    setActiveDecision(null);
    setDecisionNotes("");
    if (onVerifiedSuccess) onVerifiedSuccess();
  };

  if (!resolutionId && !initialResolution) {
    return null;
  }

  const decisionModalConfig = {
    VERIFIED: {
      title: "Approve Resolution & Mark Resolved",
      description:
        "This will approve the technician's work, transition the civic issue and service requests to RESOLVED, and notify the reporting citizen.",
      actionLabel: "Approve & Resolve",
      buttonClass: "bg-signal-resolved hover:bg-signal-resolved/90 text-white cursor-pointer",
      placeholder:
        "e.g. Inspected site photos, work meets quality standards based on citizen confirmation.",
    },
    REOPENED: {
      title: "Reopen Issue for Reassignment",
      description:
        "This will reject the resolution, mark the issue as REOPENED, and reset the work order to TRIAGED in dispatch so it can be reassigned to a new technician or team.",
      actionLabel: "Reopen Issue",
      buttonClass: "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer",
      placeholder:
        "e.g. Citizen feedback indicates pothole was not fully paved. Reopening for new assignment.",
    },
    REJECTED: {
      title: "Reject Back to Assigned Technician",
      description:
        "This will bounce the work order back to IN_PROGRESS for the currently assigned technician to rework and resubmit.",
      actionLabel: "Reject Back to Technician",
      buttonClass: "bg-orange-600 hover:bg-orange-700 text-white cursor-pointer",
      placeholder: "e.g. Incomplete photo evidence or cleanup needed before work can be approved.",
    },
  };

  return (
    <div className="rounded-xl border border-line bg-paper overflow-hidden shadow-xs space-y-0">
      {/* Card Header */}
      <div className="p-4 sm:p-5 bg-field/30 border-b border-line flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="size-5 text-signal-progress" />
          <h3 className="font-display text-base font-semibold text-ink">
            Technician Resolution Review
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {resolution?.approvedAt ? (
            <Badge
              variant="outline"
              className="border-signal-resolved/40 text-signal-resolved bg-signal-resolved/10 text-xs font-mono"
            >
              <CheckCircle2 className="size-3 mr-1" /> Approved & Verified
            </Badge>
          ) : resolution?.rejectedAt ? (
            <Badge
              variant="outline"
              className="border-signal-open/40 text-signal-open bg-signal-open/10 text-xs font-mono"
            >
              <RotateCcw className="size-3 mr-1" /> Rejected / Sent Back
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-400 text-amber-700 bg-amber-50 text-xs font-mono"
            >
              <Clock className="size-3 mr-1" /> Pending Dispatch Verification
            </Badge>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Technician Summary Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-ink/60 font-mono">
            <span className="uppercase tracking-wider">Work Performed by Technician</span>
            {resolution?.createdAt && (
              <span>Submitted {format(new Date(resolution.createdAt), "PPP 'at' p")}</span>
            )}
          </div>

          <div className="p-4 rounded-lg bg-field/20 border border-line/60 text-sm font-body text-ink leading-relaxed whitespace-pre-wrap">
            {resolution?.summary || "No summary provided."}
          </div>

          {/* Evidence Attachments */}
          {resolution?.attachments && resolution.attachments.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-mono uppercase tracking-wider text-ink/50 flex items-center gap-1.5">
                <ImageIcon className="size-3.5" /> Resolution Evidence Photos (
                {resolution.attachments.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {resolution.attachments.map((att, idx) => (
                  <button
                    key={att.id || idx}
                    type="button"
                    onClick={() => setSelectedPhoto(att.url)}
                    className="group relative aspect-video rounded-md overflow-hidden border border-line bg-field focus:outline-none focus:ring-2 focus:ring-signal-open cursor-pointer"
                  >
                    <Image
                      src={att.url}
                      alt={`Resolution proof ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Citizen Feedback Section */}
        <div className="pt-4 border-t border-line/60 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-medium text-ink uppercase tracking-wider font-mono">
              Citizen Feedback & Quality Rating
            </h4>
            {feedbacks.length > 0 && (
              <span className="text-xs font-mono text-ink/60">
                {feedbacks.length} response{feedbacks.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isFeedbacksLoading ? (
            <div className="p-3 text-xs font-mono text-ink/40 animate-pulse">
              Checking citizen feedback...
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="p-3.5 rounded-lg border border-line/60 bg-field/15 flex items-center gap-3 text-xs text-ink/70">
              <AlertCircle className="size-4 text-amber-500 shrink-0" />
              <span>Citizen has not submitted feedback yet (pending citizen confirmation).</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {feedbacks.map((fb: any) => (
                <div
                  key={fb.id}
                  className="p-3.5 rounded-lg border border-line bg-paper space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "size-3.5",
                              s <= fb.rating ? "fill-amber-400 text-amber-500" : "text-ink/20",
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-mono font-medium text-ink">{fb.rating}/5 Stars</span>
                    </div>

                    <div className="flex items-center gap-2 text-ink/50 font-mono text-[11px]">
                      {fb.citizen && (
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {fb.citizen.firstName} {fb.citizen.lastName || ""}
                        </span>
                      )}
                      {fb.createdAt && (
                        <span>• {format(new Date(fb.createdAt), "MMM d, yyyy")}</span>
                      )}
                    </div>
                  </div>

                  {fb.comment && (
                    <div className="p-2.5 rounded-md bg-field/30 border border-line/40 italic font-body text-ink/80">
                      "{fb.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification History / Audit Log */}
        {verifications.length > 0 && (
          <div className="pt-4 border-t border-line/60 space-y-3">
            <h4 className="font-display text-xs font-medium text-ink uppercase tracking-wider font-mono flex items-center gap-1.5 text-ink/70">
              <History className="size-3.5" /> Verification History & Audit Log
            </h4>

            <div className="space-y-2">
              {verifications.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-lg border border-line/60 bg-field/20 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-mono",
                        v.status === "VERIFIED"
                          ? "border-signal-resolved text-signal-resolved bg-signal-resolved/10"
                          : v.status === "REOPENED"
                            ? "border-amber-400 text-amber-700 bg-amber-50"
                            : "border-signal-open text-signal-open bg-signal-open/10",
                      )}
                    >
                      {v.status}
                    </Badge>
                    <span className="font-mono text-[10px] text-ink/40">
                      {v.verifiedAt ? format(new Date(v.verifiedAt), "PPP 'at' p") : ""}
                    </span>
                  </div>
                  {v.notes && <p className="font-body text-ink/80 text-xs pt-0.5">{v.notes}</p>}
                  {v.verifiedBy && (
                    <p className="text-[10px] font-mono text-ink/50 pt-0.5">
                      Reviewed by: {v.verifiedBy.firstName} {v.verifiedBy.lastName} (
                      {v.verifiedBy.email})
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dispatcher Actions Strip */}
        {isPendingVerification && resolution?.id && (
          <div className="pt-5 border-t border-line space-y-3 bg-field/15 -mx-5 -mb-5 p-5">
            <div>
              <h4 className="font-display text-sm font-semibold text-ink">
                Dispatcher Verification Decision
              </h4>
              <p className="font-body text-xs text-ink/60">
                Inspect evidence and citizen review to approve the resolution or route back.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveDecision("VERIFIED")}
                className="cursor-pointer text-xs bg-signal-resolved hover:bg-signal-resolved/90 text-white"
              >
                <CheckCircle2 className="size-3.5 mr-1.5" /> Approve & Resolve
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveDecision("REOPENED")}
                className="cursor-pointer text-xs border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100"
              >
                <RotateCcw className="size-3.5 mr-1.5 text-amber-700" /> Reopen for Reassignment
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveDecision("REJECTED")}
                className="cursor-pointer text-xs border-orange-400 text-orange-800 bg-orange-50 hover:bg-orange-100"
              >
                <XCircle className="size-3.5 mr-1.5 text-orange-700" /> Reject Back to Technician
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Decision Confirmation Dialog */}
      {activeDecision && (
        <Dialog open={!!activeDecision} onOpenChange={(open) => !open && setActiveDecision(null)}>
          <DialogContent className="sm:max-w-md bg-paper border border-line text-ink">
            <DialogHeader>
              <DialogTitle className="font-display text-lg text-ink">
                {decisionModalConfig[activeDecision].title}
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-ink/70">
                {decisionModalConfig[activeDecision].description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <label htmlFor="decision-notes" className="text-xs font-medium text-ink/80 block">
                Administrative Notes & Rationale{" "}
                {activeDecision !== "VERIFIED" ? "*" : "(Optional)"}
              </label>
              <Textarea
                id="decision-notes"
                rows={3}
                placeholder={decisionModalConfig[activeDecision].placeholder}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="bg-paper border-line text-xs font-body"
              />
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveDecision(null)}
                disabled={verifyMutation.isPending}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDecisionSubmit}
                disabled={
                  verifyMutation.isPending ||
                  (activeDecision !== "VERIFIED" && !decisionNotes.trim())
                }
                className={cn(
                  "cursor-pointer text-xs",
                  decisionModalConfig[activeDecision].buttonClass,
                )}
              >
                {verifyMutation.isPending
                  ? "Processing..."
                  : decisionModalConfig[activeDecision].actionLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Photo Lightbox */}
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
              alt="Enlarged resolution evidence"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        </button>
      )}
    </div>
  );
}
