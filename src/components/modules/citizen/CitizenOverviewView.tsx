"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
  PlusCircle,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMe } from "@/hooks/auth.hook";
import { useMyServiceRequests, usePendingFeedbackRequests } from "@/hooks/citizen.hook";
import type { ServiceRequest } from "@/types";
import { CitizenFeedbackDialog } from "./CitizenFeedbackDialog";
import { CitizenRequestDetailModal } from "./CitizenRequestDetailModal";
import { CitizenTrustBadge } from "./CitizenTrustBadge";

export function CitizenOverviewView() {
  const router = useRouter();
  const [trackingSearch, setTrackingSearch] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Direct feedback modal state for pending banner
  const [feedbackTargetRequest, setFeedbackTargetRequest] = useState<ServiceRequest | null>(null);

  const { data: userData } = useGetMe();
  const user = userData?.data;

  const citizenName = user?.citizenProfile?.firstName
    ? `${user.citizenProfile.firstName} ${user.citizenProfile.lastName || ""}`.trim()
    : user?.displayName || user?.email?.split("@")[0] || "Citizen";

  const trustLevel = user?.citizenProfile?.trustLevel || user?.trustLevel || "NEW";

  const { data: requestsRes, isLoading } = useMyServiceRequests({ limit: 20 });
  const requests: ServiceRequest[] = requestsRes?.data || [];

  // Dedicated pending feedback requests hook
  const { data: pendingFeedbackRes, isLoading: isPendingFeedbackLoading } =
    usePendingFeedbackRequests();
  const pendingFeedbackRequests: ServiceRequest[] = pendingFeedbackRes?.data || [];

  const stats = useMemo(() => {
    const total = requests.length;
    const active = requests.filter((r) => {
      const s = r.status.toUpperCase();
      return (
        s === "SUBMITTED" ||
        s === "ASSIGNED" ||
        s === "ACCEPTED" ||
        s === "IN_PROGRESS" ||
        s === "PENDING_VERIFICATION" ||
        s === "PENDING_ASSIGNMENT"
      );
    }).length;
    const resolved = requests.filter((r) => {
      const s = r.status.toUpperCase();
      return s === "RESOLVED" || s === "CLOSED" || s === "COMPLETED";
    }).length;
    // Prefer count from pending feedback endpoint if available
    const pendingFeedback =
      pendingFeedbackRequests.length > 0
        ? pendingFeedbackRequests.length
        : requests.filter((r) => {
            const s = r.status.toUpperCase();
            return (
              (s === "RESOLVED" || s === "CLOSED" || s === "PENDING_VERIFICATION") && !r.feedback
            );
          }).length;

    return { total, active, resolved, pendingFeedback };
  }, [requests, pendingFeedbackRequests]);

  const recentRequests = useMemo(() => {
    return [...requests]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5);
  }, [requests]);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingSearch.trim();
    if (!query) return;

    // Check if it matches an existing request ID or tracking number
    const matched = requests.find(
      (r) =>
        r.trackingNumber?.toLowerCase() === query.toLowerCase() ||
        r.id.toLowerCase() === query.toLowerCase(),
    );

    if (matched) {
      setSelectedRequestId(matched.id);
    } else {
      router.push(`/track?issueNumber=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-gradient-to-br from-paper via-paper to-field/40 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
                Citizen Portal
              </span>
              <CitizenTrustBadge level={trustLevel} showPerk={true} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              Hello, {citizenName}
            </h1>
            <p className="font-body text-sm text-ink/70 max-w-xl">
              Track your reported civic issues, monitor municipal response times, and help keep our
              city clean and functioning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button asChild variant="primary" size="lg" className="cursor-pointer shadow-xs">
              <Link href="/report">
                <PlusCircle className="size-4 mr-2" /> Report an Issue
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Tracker Search */}
        <div className="mt-6 pt-6 border-t border-line/60">
          <form
            onSubmit={handleQuickTrack}
            className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
              <Input
                type="text"
                placeholder="Lookup by tracking number (e.g. #SR-2024-..., #IS-...)"
                value={trackingSearch}
                onChange={(e) => setTrackingSearch(e.target.value)}
                className="pl-9.5 h-10 bg-paper/90 border-line text-sm"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-10 cursor-pointer shrink-0">
              Track Status
            </Button>
          </form>
        </div>
      </div>

      {/* Action Required: Pending Feedback Alert Banner */}
      {!isPendingFeedbackLoading && pendingFeedbackRequests.length > 0 && (
        <div className="rounded-xl border border-amber-300/80 bg-amber-50/50 dark:bg-amber-950/20 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-semibold text-ink">
                    Action Required: Review Completed Work
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-amber-400 bg-amber-100 text-amber-800 text-[11px] font-mono"
                  >
                    {pendingFeedbackRequests.length} pending
                  </Badge>
                </div>
                <p className="font-body text-xs text-ink/70 mt-0.5">
                  You have <strong>{pendingFeedbackRequests.length}</strong> completed request
                  {pendingFeedbackRequests.length > 1 ? "s" : ""} waiting for your review. Please
                  confirm if the issue was satisfactorily resolved.
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="cursor-pointer text-xs text-amber-800 hover:bg-amber-100/50 self-start sm:self-auto"
            >
              <Link href="/citizen/feedback">
                View all reviews <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingFeedbackRequests.slice(0, 2).map((req) => {
              const activeWo = req.civicIssue?.workOrders?.[0];
              const resolution = activeWo?.resolution;
              const summary = resolution?.summary || req.resolutionNotes;
              const attachments = resolution?.attachments || [];

              return (
                <div
                  key={req.id}
                  className="rounded-lg border border-amber-200/90 bg-paper p-4 flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-ink">
                        {req.trackingNumber}
                      </span>
                      {req.category && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-field border border-line text-ink/70">
                          {req.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-body text-ink/80 line-clamp-1 font-medium">
                      {req.description}
                    </p>

                    {summary && (
                      <div className="p-2.5 rounded-md bg-field/40 border border-line/40 text-xs text-ink/80">
                        <span className="font-mono text-[10px] uppercase text-signal-resolved font-medium block mb-0.5">
                          Technician Summary:
                        </span>
                        <p className="line-clamp-2 italic font-body">{summary}</p>
                      </div>
                    )}

                    {attachments.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink/60 pt-1">
                        <ImageIcon className="size-3 text-ink/40" />
                        <span>
                          {attachments.length} photo proof attachment
                          {attachments.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-line/40">
                    <span className="text-[11px] font-mono text-ink/50">
                      {req.submittedAt ? format(new Date(req.submittedAt), "MMM d") : ""}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setFeedbackTargetRequest(req)}
                      className="cursor-pointer text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Star className="size-3.5 mr-1.5 fill-amber-300 text-amber-300" /> Submit
                      Feedback
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-line bg-paper p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink/50 text-xs font-mono uppercase tracking-wider">
            <span>Total Submitted</span>
            <FileText className="size-4 text-ink/40" />
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-semibold text-ink">{stats.total}</p>
            <p className="font-body text-xs text-ink/60 mt-1">Lifetime reported issues</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-paper p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-signal-progress text-xs font-mono uppercase tracking-wider">
            <span>In Progress</span>
            <Clock className="size-4 text-signal-progress" />
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-semibold text-ink">{stats.active}</p>
            <p className="font-body text-xs text-ink/60 mt-1">Assigned or under repair</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-paper p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-signal-resolved text-xs font-mono uppercase tracking-wider">
            <span>Resolved</span>
            <CheckCircle2 className="size-4 text-signal-resolved" />
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-semibold text-ink">{stats.resolved}</p>
            <p className="font-body text-xs text-ink/60 mt-1">Successfully addressed</p>
          </div>
        </div>

        <Link
          href="/citizen/feedback"
          className="rounded-lg border border-line bg-paper p-5 flex flex-col justify-between hover:border-amber-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-600 text-xs font-mono uppercase tracking-wider">
            <span>Reviews Needed</span>
            <Star className="size-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-3xl font-semibold text-ink group-hover:text-amber-600 transition-colors">
                {stats.pendingFeedback}
              </p>
              {stats.pendingFeedback > 0 && (
                <span className="text-[11px] font-mono text-amber-600 font-medium">
                  Review now →
                </span>
              )}
            </div>
            <p className="font-body text-xs text-ink/60 mt-1">Resolved jobs to rate</p>
          </div>
        </Link>
      </div>

      {/* Main Content Grid: Recent Submissions + Trust Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-line bg-paper p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Recent Reports</h2>
              <p className="font-body text-xs text-ink/60">
                Latest submissions and their current lifecycle statuses.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="cursor-pointer text-xs">
              <Link href="/citizen/my-reports">
                View all <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="h-48 flex items-center justify-center text-sm font-mono text-ink/40 animate-pulse">
              Loading recent reports...
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-line/40 bg-field/10 space-y-3">
              <Sparkles className="size-8 mx-auto text-ink/30" />
              <p className="font-body text-sm text-ink/70">
                You haven't reported any civic issues yet.
              </p>
              <Button asChild variant="primary" size="sm" className="cursor-pointer">
                <Link href="/report">Report your first issue</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-line/60">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-field/20 px-2 rounded-md"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-ink">
                        {request.trackingNumber}
                      </span>
                      {request.category && (
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-xs bg-field border border-line/60 text-ink/70">
                          {request.category.name}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-ink/70 truncate max-w-md">
                      {request.description}
                    </p>
                    <p className="font-mono text-[10px] text-ink/40">
                      {request.submittedAt
                        ? format(new Date(request.submittedAt), "MMM d, yyyy")
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={request.status} />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedRequestId(request.id)}
                      className="text-xs cursor-pointer"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Trust & Progression (1 col) */}
        <div className="rounded-xl border border-line bg-paper p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-signal-progress" />
            <h3 className="font-display text-base font-semibold text-ink">Trust Progression</h3>
          </div>

          <div className="p-4 rounded-lg bg-field/30 border border-line/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-ink/60">Current Standing</span>
              <CitizenTrustBadge level={trustLevel} />
            </div>
            <p className="font-body text-xs text-ink/70 leading-relaxed">
              {trustLevel === "TRUSTED"
                ? "You hold our highest community trust score! Your reports bypass standard manual triage."
                : trustLevel === "REGULAR"
                  ? "You have a proven track record of accurate civic reporting. 3 more verified resolutions to reach Trusted."
                  : "Welcome! Report issues with accurate photos and street addresses to build your reputation score."}
            </p>
          </div>

          <div className="space-y-2 text-xs font-body text-ink/70">
            <h4 className="font-medium text-ink text-xs uppercase font-mono tracking-wider">
              Best practices
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-signal-resolved shrink-0 mt-0.5" />
                <span>Upload clear, well-lit photos of the problem.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-signal-resolved shrink-0 mt-0.5" />
                <span>Provide exact landmarks or door numbers.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3.5 text-signal-resolved shrink-0 mt-0.5" />
                <span>Rate resolutions once work is finished.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Details Sheet Modal */}
      <CitizenRequestDetailModal
        isOpen={!!selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        requestId={selectedRequestId}
      />

      {/* Direct Feedback Dialog from Pending Banner */}
      {feedbackTargetRequest && (
        <CitizenFeedbackDialog
          isOpen={!!feedbackTargetRequest}
          onClose={() => setFeedbackTargetRequest(null)}
          serviceRequestId={feedbackTargetRequest.id}
          resolutionId={feedbackTargetRequest.civicIssue?.workOrders?.[0]?.resolution?.id}
          resolutionSummary={
            feedbackTargetRequest.civicIssue?.workOrders?.[0]?.resolution?.summary ||
            feedbackTargetRequest.resolutionNotes
          }
          resolutionAttachments={
            feedbackTargetRequest.civicIssue?.workOrders?.[0]?.resolution?.attachments
          }
          trackingNumber={feedbackTargetRequest.trackingNumber}
        />
      )}
    </div>
  );
}
