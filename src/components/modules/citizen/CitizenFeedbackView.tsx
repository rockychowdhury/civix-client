"use client";

import { format } from "date-fns";
import { CheckCircle2, MessageSquare, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyServiceRequests } from "@/hooks/citizen.hook";
import type { ServiceRequest } from "@/types";
import { CitizenFeedbackDialog } from "./CitizenFeedbackDialog";

export function CitizenFeedbackView() {
  const [activeTab, setActiveTab] = useState<"PENDING" | "SUBMITTED">("PENDING");
  const [targetRequest, setTargetRequest] = useState<ServiceRequest | null>(null);

  const { data: requestsRes, isLoading } = useMyServiceRequests();
  const requests: ServiceRequest[] = requestsRes?.data || [];

  const { pendingReviews, completedReviews } = useMemo(() => {
    const resolved = requests.filter((r) => {
      const s = r.status.toUpperCase();
      return s === "RESOLVED" || s === "CLOSED" || s === "COMPLETED";
    });

    const pending = resolved.filter((r) => !r.feedback);
    const completed = resolved.filter((r) => !!r.feedback);

    return { pendingReviews: pending, completedReviews: completed };
  }, [requests]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Feedback & Reviews</h1>
        <p className="font-body text-sm text-ink/60">
          Your feedback directly evaluates technician performance and ensures quality resolution.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "PENDING" | "SUBMITTED")}
        className="w-full"
      >
        <TabsList className="bg-field/40 border border-line p-1">
          <TabsTrigger value="PENDING" className="text-xs cursor-pointer">
            Needs Review ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="SUBMITTED" className="text-xs cursor-pointer">
            Completed Reviews ({completedReviews.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-sm font-mono text-ink/40 animate-pulse">
          Loading feedback items...
        </div>
      ) : activeTab === "PENDING" ? (
        pendingReviews.length === 0 ? (
          <div className="rounded-xl border border-line bg-field/10 p-12 text-center space-y-3">
            <CheckCircle2 className="size-10 mx-auto text-signal-resolved" />
            <h3 className="font-display text-lg font-semibold text-ink">All caught up!</h3>
            <p className="font-body text-sm text-ink/60 max-w-md mx-auto">
              You have no resolved reports pending quality ratings. When a technician finishes
              working on your report, it will appear here for your review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingReviews.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-line bg-paper p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ink">
                      {req.trackingNumber}
                    </span>
                    {req.category && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
                        {req.category.name}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-ink/80 line-clamp-2">{req.description}</p>
                  <p className="font-mono text-[10px] text-ink/40">
                    Reported {req.submittedAt ? format(new Date(req.submittedAt), "PPP") : ""}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setTargetRequest(req)}
                  className="shrink-0 cursor-pointer"
                >
                  <Star className="size-3.5 mr-1.5 fill-amber-300 text-amber-300" /> Rate Resolution
                </Button>
              </div>
            ))}
          </div>
        )
      ) : completedReviews.length === 0 ? (
        <div className="rounded-xl border border-line bg-field/10 p-12 text-center space-y-3">
          <MessageSquare className="size-10 mx-auto text-ink/30" />
          <h3 className="font-display text-lg font-semibold text-ink">No reviews submitted yet</h3>
          <p className="font-body text-sm text-ink/60 max-w-md mx-auto">
            Once you rate resolved service requests, your review history and feedback comments will
            be archived here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {completedReviews.map((req) => (
            <div key={req.id} className="rounded-xl border border-line bg-paper p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-ink">
                    {req.trackingNumber}
                  </span>
                  {req.category && (
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
                      {req.category.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={
                        s <= (req.feedback?.rating || 0)
                          ? "size-4 fill-amber-400 text-amber-500"
                          : "size-4 text-ink/20"
                      }
                    />
                  ))}
                  <span className="font-mono text-xs text-ink/60 ml-1.5">
                    ({req.feedback?.rating}/5)
                  </span>
                </div>
              </div>

              {req.feedback?.comment && (
                <div className="p-3 rounded-md bg-field/30 border border-line/40 text-xs text-ink/80 italic font-body">
                  "{req.feedback.comment}"
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-ink/40 font-mono pt-1">
                <span>Issue: {req.description?.slice(0, 50)}...</span>
                <span>
                  {req.feedback?.createdAt
                    ? `Reviewed ${format(new Date(req.feedback.createdAt), "MMM d, yyyy")}`
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Dialog */}
      {targetRequest && (
        <CitizenFeedbackDialog
          isOpen={!!targetRequest}
          onClose={() => setTargetRequest(null)}
          serviceRequestId={targetRequest.id}
          trackingNumber={targetRequest.trackingNumber}
        />
      )}
    </div>
  );
}
