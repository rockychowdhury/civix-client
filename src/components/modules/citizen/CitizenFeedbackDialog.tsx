"use client";

import { CheckCircle2, Image as ImageIcon, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
import { useSubmitCitizenFeedback } from "@/hooks/citizen.hook";
import { cn } from "@/lib/utils";

interface CitizenFeedbackDialogProps {
  serviceRequestId: string | null;
  resolutionId?: string;
  resolutionSummary?: string;
  resolutionAttachments?: Array<{ id?: string; url: string; fileType?: string }>;
  trackingNumber?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RATING_DESCRIPTIONS = [
  "Very Dissatisfied - Issue unresolved or poorly addressed",
  "Dissatisfied - Significant issues remain",
  "Neutral - Acceptable resolution",
  "Satisfied - Well addressed in timely manner",
  "Very Satisfied - Outstanding speed and craftsmanship",
];

export function CitizenFeedbackDialog({
  serviceRequestId,
  resolutionId,
  resolutionSummary,
  resolutionAttachments,
  trackingNumber,
  isOpen,
  onClose,
  onSuccess,
}: CitizenFeedbackDialogProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");

  const submitFeedbackMutation = useSubmitCitizenFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceRequestId) return;

    await submitFeedbackMutation.mutateAsync({
      serviceRequestId,
      resolutionId: resolutionId || undefined,
      rating,
      comment: comment.trim() || undefined,
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  const activeRating = hoverRating ?? rating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg bg-paper border border-line text-ink max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-ink">
              Rate Resolution Quality
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-ink/60">
              {trackingNumber ? (
                <>
                  How satisfied are you with the resolution of{" "}
                  <span className="font-mono font-medium text-ink">{trackingNumber}</span>?
                </>
              ) : (
                "Help your city improve civic services by rating the work done."
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Technician Resolution Summary & Evidence Context */}
          {resolutionSummary && (
            <div className="rounded-lg border border-line/60 bg-field/30 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-signal-resolved font-medium">
                <CheckCircle2 className="size-3.5" />
                <span>Technician Reported Fix</span>
              </div>
              <p className="text-xs text-ink/80 font-body whitespace-pre-wrap leading-relaxed">
                {resolutionSummary}
              </p>

              {resolutionAttachments && resolutionAttachments.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase text-ink/50 flex items-center gap-1 mb-1.5">
                    <ImageIcon className="size-3" /> Technician Evidence
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {resolutionAttachments.map((att, idx) => (
                      <div
                        key={att.id || idx}
                        className="relative aspect-video rounded-md overflow-hidden border border-line bg-field/50"
                      >
                        <Image
                          src={att.url}
                          alt={`Resolution proof ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="flex flex-col items-center justify-center gap-2 py-3.5 rounded-lg bg-field/40 border border-line/40">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 rounded-sm text-ink/30 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-open cursor-pointer"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      star <= activeRating
                        ? "fill-amber-400 text-amber-500"
                        : "text-ink/20 hover:text-ink/40",
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-mono text-ink/70 h-4 text-center">
              {RATING_DESCRIPTIONS[activeRating - 1] || ""}
            </p>
          </div>

          {/* Comment Field */}
          <div className="space-y-1.5">
            <label htmlFor="feedback-comment" className="text-xs font-medium text-ink/80">
              Comments or Observations (Optional)
            </label>
            <Textarea
              id="feedback-comment"
              rows={3}
              placeholder="e.g. Pothole was fully filled and area swept clean. Great work!"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none bg-paper border-line text-ink text-sm focus-visible:ring-1"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitFeedbackMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitFeedbackMutation.isPending}
              className="cursor-pointer"
            >
              {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
