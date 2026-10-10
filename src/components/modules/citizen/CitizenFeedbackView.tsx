"use client";

import { format } from "date-fns";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMe } from "@/hooks/auth.hook";
import { useMyServiceRequests, usePendingFeedbackRequests } from "@/hooks/citizen.hook";
import type { ServiceRequest } from "@/types";
import { CitizenFeedbackDialog } from "./CitizenFeedbackDialog";
import { CitizenTrustBadge } from "./CitizenTrustBadge";

export function CitizenFeedbackView() {
  const [activeTab, setActiveTab] = useState<"PENDING" | "SUBMITTED">("PENDING");
  const [targetRequest, setTargetRequest] = useState<ServiceRequest | null>(null);

  const { data: userData } = useGetMe();
  const user = userData?.data;
  const trustLevel = user?.citizenProfile?.trustLevel || user?.trustLevel || "NEW";

  const { data: requestsRes, isLoading: isMyRequestsLoading } = useMyServiceRequests({
    limit: 100,
  });
  const requests: ServiceRequest[] = requestsRes?.data || [];

  const { data: pendingFeedbackRes, isLoading: isPendingLoading } = usePendingFeedbackRequests();
  const dedicatedPending: ServiceRequest[] = pendingFeedbackRes?.data || [];

  const { pendingReviews, completedReviews, averageRating, verificationRate } = useMemo(() => {
    const pendingMap = new Map<string, ServiceRequest>();

    // 1. Dedicated endpoint results
    dedicatedPending.forEach((item) => {
      pendingMap.set(item.id, item);
    });

    // 2. Any eligible resolved requests without feedback from user's history
    requests.forEach((r) => {
      const s = r.status.toUpperCase();
      const isEligible =
        s === "RESOLVED" || s === "CLOSED" || s === "COMPLETED" || s === "PENDING_VERIFICATION";
      if (isEligible && !r.feedback) {
        if (!pendingMap.has(r.id)) {
          pendingMap.set(r.id, r);
        }
      }
    });

    const completed = requests.filter((r) => !!r.feedback);
    const avg =
      completed.length > 0
        ? (
            completed.reduce((acc, curr) => acc + (curr.feedback?.rating || 0), 0) /
            completed.length
          ).toFixed(1)
        : null;

    const totalEligible = completed.length + pendingMap.size;
    const rate = totalEligible > 0 ? Math.round((completed.length / totalEligible) * 100) : 100;

    return {
      pendingReviews: Array.from(pendingMap.values()),
      completedReviews: completed,
      averageRating: avg,
      verificationRate: rate,
    };
  }, [requests, dedicatedPending]);

  const isLoading = isMyRequestsLoading || isPendingLoading;

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      {/* Editorial Header */}
      <div className="space-y-1.5 border-b border-line pb-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
            Municipal Accountability
          </span>
          <span className="text-ink/30">•</span>
          <span className="font-mono text-xs text-ink/60">Quality Assurance</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
          Service Verification & Reviews
        </h1>
        <p className="font-body text-xs sm:text-sm text-ink/70 max-w-2xl leading-relaxed">
          Audit completed field repairs across your ward. Your ratings confirm municipal contractor
          quality standards and build your personal Citizen Trust score.
        </p>
      </div>

      {/* Meaningful Asymmetrical Layout: 8 cols stream + 4 cols oversight sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Stream Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Tabs Filter Bar */}
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-line/60">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "PENDING" | "SUBMITTED")}
              className="w-full sm:w-auto"
            >
              <TabsList className="bg-field/50 border border-line/60 p-1 rounded-sm gap-1">
                <TabsTrigger value="PENDING" className="font-body text-xs cursor-pointer">
                  Action Required ({pendingReviews.length})
                </TabsTrigger>
                <TabsTrigger value="SUBMITTED" className="font-body text-xs cursor-pointer">
                  Review History ({completedReviews.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <span className="hidden sm:inline font-mono text-[11px] text-ink/50">
              {activeTab === "PENDING"
                ? `${pendingReviews.length} repair${pendingReviews.length === 1 ? "" : "s"} awaiting sign-off`
                : `${completedReviews.length} past rating${completedReviews.length === 1 ? "" : "s"} recorded`}
            </span>
          </div>

          {/* Stream Body */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-ink/40 animate-pulse rounded-xl border border-line bg-field/10">
              Loading verification records...
            </div>
          ) : activeTab === "PENDING" ? (
            pendingReviews.length === 0 ? (
              <div className="rounded-xl border border-line/70 bg-paper p-10 sm:p-12 text-center space-y-4 shadow-2xs">
                <div className="size-12 rounded-full bg-signal-resolved/10 text-signal-resolved flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    All Completed Work Verified
                  </h3>
                  <p className="font-body text-xs text-ink/65 leading-relaxed">
                    You have no repairs waiting for inspection. When city technicians finish work on
                    one of your reported issues, you will receive an alert here to review photo
                    proof and rate craftsmanship.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer active:translate-y-px text-xs"
                  >
                    <Link href="/citizen/my-reports">
                      View All Reports <ArrowRight className="size-3.5 ml-1.5 text-ink/50" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map((req) => {
                  const activeWo = req.civicIssue?.workOrders?.[0];
                  const resolution = activeWo?.resolution;
                  const summary = resolution?.summary || req.resolutionNotes;
                  const attachments = resolution?.attachments || [];

                  const displayIssueId =
                    req.civicIssue?.issueNumber ||
                    req.linkedIssue?.issueNumber ||
                    (req as any).issueNumber ||
                    req.trackingNumber;

                  return (
                    <div
                      key={req.id}
                      className="rounded-xl border border-line/80 bg-paper p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-2xs hover:border-line hover:shadow-xs transition-all duration-150"
                    >
                      {/* Top Meta Header */}
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-ink bg-field/70 border border-line/60 px-2 py-0.5 rounded-xs tracking-tight">
                              #{displayIssueId}
                            </span>
                            {req.category?.name && (
                              <span className="px-2 py-0.5 rounded-xs bg-field/60 border border-line/60 text-ink/75 font-mono text-[11px] font-medium">
                                {req.category.name}
                              </span>
                            )}
                            {req.trackingNumber && req.trackingNumber !== displayIssueId && (
                              <span className="font-mono text-[10px] text-ink/40">
                                ({req.trackingNumber})
                              </span>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-xs border border-signal-resolved/40 bg-signal-resolved/10 text-signal-resolved self-start sm:self-auto">
                            <CheckCircle2 className="size-3" /> Work Completed
                          </span>
                        </div>

                        {req.location?.address && (
                          <div className="flex items-center gap-1.5 text-[11px] text-ink/50 font-body">
                            <MapPin className="size-3 text-ink/40 shrink-0" />
                            <span className="truncate">{req.location.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Issue Description */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-ink/45">
                          Citizen Report Summary
                        </span>
                        <p className="font-body text-xs text-ink/80 leading-relaxed">
                          {req.description}
                        </p>
                      </div>

                      {/* Technician Resolution Memo */}
                      {summary && (
                        <div className="rounded-md bg-field/35 border-l-2 border-ledger/70 border-y border-r border-line/50 p-3.5 space-y-1">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-ledger font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="size-3 text-signal-resolved" /> Technician
                            Resolution Memo
                          </span>
                          <p className="font-body text-xs text-ink/85 italic leading-relaxed">
                            "{summary}"
                          </p>
                        </div>
                      )}

                      {/* Attached Photo Evidence */}
                      {attachments.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-ink/45 flex items-center gap-1">
                            <ImageIcon className="size-3" /> Field Repair Evidence (
                            {attachments.length})
                          </span>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {attachments.map((att, idx) => (
                              <div
                                key={att.id || idx}
                                className="relative size-14 shrink-0 rounded-sm overflow-hidden border border-line bg-field/50 shadow-2xs"
                              >
                                <Image
                                  src={att.url}
                                  alt={`Proof ${idx + 1}`}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Action Footer */}
                      <div className="pt-3 border-t border-line/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="font-mono text-[11px] text-ink/45">
                          Submitted{" "}
                          {req.submittedAt ? format(new Date(req.submittedAt), "MMM d, yyyy") : ""}
                        </span>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 text-xs cursor-pointer active:translate-y-px rounded-xs font-medium"
                          >
                            <Link href={`/track?issueNumber=${encodeURIComponent(displayIssueId)}`}>
                              Track <ArrowUpRight className="size-3 ml-1 text-ink/50" />
                            </Link>
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setTargetRequest(req)}
                            className="h-8 px-3.5 text-xs cursor-pointer active:translate-y-px rounded-xs shadow-2xs font-medium"
                          >
                            <Star className="size-3.5 mr-1.5 fill-paper text-paper" /> Rate
                            Resolution
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : completedReviews.length === 0 ? (
            <div className="rounded-xl border border-line/70 bg-paper p-10 sm:p-12 text-center space-y-3 shadow-2xs">
              <MessageSquare className="size-10 mx-auto text-ink/30" />
              <h3 className="font-display text-lg font-semibold text-ink">
                No Reviews Recorded Yet
              </h3>
              <p className="font-body text-xs text-ink/65 max-w-md mx-auto leading-relaxed">
                When you evaluate resolved reports, your comments, ratings, and resolution audits
                will be permanently archived here for your records.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedReviews.map((req) => {
                const displayIssueId =
                  req.civicIssue?.issueNumber ||
                  req.linkedIssue?.issueNumber ||
                  (req as any).issueNumber ||
                  req.trackingNumber;

                const ratingNum = req.feedback?.rating || 0;

                return (
                  <div
                    key={req.id}
                    className="rounded-xl border border-line/70 bg-paper p-5 space-y-3 shadow-2xs hover:border-line hover:shadow-xs transition-all duration-150"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-ink bg-field/70 border border-line/60 px-2 py-0.5 rounded-xs">
                          #{displayIssueId}
                        </span>
                        {req.category?.name && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-field/50 border border-line/60 text-ink/75">
                            {req.category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={
                                s <= ratingNum
                                  ? "size-3.5 fill-signal-progress text-signal-progress"
                                  : "size-3.5 text-ink/20"
                              }
                            />
                          ))}
                        </div>
                        <span className="font-mono text-xs font-semibold text-ink ml-1">
                          {ratingNum}/5
                        </span>
                      </div>
                    </div>

                    <p className="font-body text-xs text-ink/75 line-clamp-2 leading-relaxed">
                      {req.description}
                    </p>

                    {req.feedback?.comment && (
                      <div className="p-3 rounded-md bg-field/30 border border-line/50 text-xs text-ink/85 italic font-body">
                        "{req.feedback.comment}"
                      </div>
                    )}

                    <div className="pt-2 border-t border-line/40 flex items-center justify-between text-[11px] font-mono text-ink/45">
                      <span>
                        {req.feedback?.createdAt
                          ? `Reviewed ${format(new Date(req.feedback.createdAt), "MMM d, yyyy")}`
                          : "Review submitted"}
                      </span>

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-[11px] text-ink/60 hover:text-ink cursor-pointer"
                      >
                        <Link href={`/track?issueNumber=${encodeURIComponent(displayIssueId)}`}>
                          Track History <ArrowUpRight className="size-3 ml-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Oversight & Accountability Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Standing & Score Card */}
          <div className="rounded-xl border border-line bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-line/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-signal-resolved" />
                <h3 className="font-display text-sm font-semibold text-ink">Citizen Standing</h3>
              </div>
              <CitizenTrustBadge level={trustLevel} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-field/30 border border-line/60 space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-ink/50">
                  Verification Rate
                </span>
                <p className="font-display text-lg font-bold text-ink">{verificationRate}%</p>
                <span className="text-[10px] font-mono text-ink/40">of closed repairs</span>
              </div>

              <div className="p-3 rounded-lg bg-field/30 border border-line/60 space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-ink/50">Average Rating</span>
                <p className="font-display text-lg font-bold text-ink">
                  {averageRating ? `${averageRating}` : "—"}
                </p>
                <span className="text-[10px] font-mono text-ink/40">
                  {completedReviews.length} review{completedReviews.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <p className="font-body text-xs text-ink/70 leading-relaxed">
              Your feedback ratings directly adjust municipal contractor performance indexes and
              boost your standing toward higher community trust perks.
            </p>
          </div>

          {/* Verification Protocol Timeline */}
          <div className="rounded-xl border border-line bg-paper p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-ink/50" />
              <h4 className="font-display text-sm font-semibold text-ink">
                How Verification Works
              </h4>
            </div>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-line">
              <div className="flex items-start gap-3 relative">
                <span className="size-6 rounded-full bg-field border border-line text-ink font-mono text-[10px] flex items-center justify-center shrink-0 font-semibold">
                  1
                </span>
                <div className="space-y-0.5">
                  <h5 className="font-body text-xs font-semibold text-ink">
                    Technician Fix Logged
                  </h5>
                  <p className="font-body text-[11px] text-ink/60 leading-relaxed">
                    Contractor resolves the issue and attaches timestamped photos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="size-6 rounded-full bg-ledger text-paper font-mono text-[10px] flex items-center justify-center shrink-0 font-semibold shadow-2xs">
                  2
                </span>
                <div className="space-y-0.5">
                  <h5 className="font-body text-xs font-semibold text-ink">
                    Citizen Quality Audit
                  </h5>
                  <p className="font-body text-[11px] text-ink/60 leading-relaxed">
                    You inspect the repair, award 1–5 stars, and leave optional notes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="size-6 rounded-full bg-field border border-line text-ink font-mono text-[10px] flex items-center justify-center shrink-0 font-semibold">
                  3
                </span>
                <div className="space-y-0.5">
                  <h5 className="font-body text-xs font-semibold text-ink">SLA Score Finalized</h5>
                  <p className="font-body text-[11px] text-ink/60 leading-relaxed">
                    Municipal administration seals the work order based on your sign-off.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-xl border border-line bg-paper p-4.5 space-y-2.5 shadow-2xs">
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink/50">
              Related Citizen Hubs
            </h4>
            <div className="space-y-1.5">
              <Link
                href="/citizen/my-reports"
                className="flex items-center justify-between p-2 rounded-lg border border-line/60 bg-field/20 hover:bg-field/40 text-xs font-medium text-ink transition-colors cursor-pointer"
              >
                <span>View All My Reports</span>
                <ArrowRight className="size-3 text-ink/40" />
              </Link>
              <Link
                href="/citizen/profile"
                className="flex items-center justify-between p-2 rounded-lg border border-line/60 bg-field/20 hover:bg-field/40 text-xs font-medium text-ink transition-colors cursor-pointer"
              >
                <span>My Profile & Reputation</span>
                <ArrowRight className="size-3 text-ink/40" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Rating Dialog */}
      {targetRequest && (
        <CitizenFeedbackDialog
          isOpen={!!targetRequest}
          onClose={() => setTargetRequest(null)}
          serviceRequestId={targetRequest.id}
          resolutionId={targetRequest.civicIssue?.workOrders?.[0]?.resolution?.id}
          resolutionSummary={
            targetRequest.civicIssue?.workOrders?.[0]?.resolution?.summary ||
            targetRequest.resolutionNotes
          }
          resolutionAttachments={targetRequest.civicIssue?.workOrders?.[0]?.resolution?.attachments}
          trackingNumber={targetRequest.trackingNumber}
        />
      )}
    </div>
  );
}
