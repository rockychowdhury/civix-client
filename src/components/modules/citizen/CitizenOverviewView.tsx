"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  MapPin,
  PhoneCall,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  User,
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
import { CitizenTrustBadge } from "./CitizenTrustBadge";

export function CitizenOverviewView() {
  const router = useRouter();
  const [trackingSearch, setTrackingSearch] = useState("");
  const [copiedTrackingNum, setCopiedTrackingNum] = useState<string | null>(null);

  const { data: userData } = useGetMe();
  const user = userData?.data;
  const citizenProfile = user?.citizenProfile;

  const citizenName = citizenProfile?.firstName
    ? `${citizenProfile.firstName} ${citizenProfile.lastName || ""}`.trim()
    : user?.displayName || user?.email?.split("@")[0] || "Citizen";

  const trustLevel = citizenProfile?.trustLevel || user?.trustLevel || "NEW";

  const { data: requestsRes, isLoading } = useMyServiceRequests({ limit: 20 });
  const requests: ServiceRequest[] = requestsRes?.data || [];

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
        s === "PENDING_ASSIGNMENT" ||
        s === "NEW"
      );
    }).length;
    const resolved = requests.filter((r) => {
      const s = r.status.toUpperCase();
      return s === "RESOLVED" || s === "CLOSED" || s === "COMPLETED";
    }).length;

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

    const matched = requests.find(
      (r) =>
        r.trackingNumber?.toLowerCase() === query.toLowerCase() ||
        r.id.toLowerCase() === query.toLowerCase() ||
        r.civicIssue?.issueNumber?.toLowerCase() === query.toLowerCase(),
    );

    if (matched) {
      const trackId = matched.civicIssue?.issueNumber || matched.trackingNumber;
      router.push(`/track?issueNumber=${encodeURIComponent(trackId)}`);
    } else {
      router.push(`/track?issueNumber=${encodeURIComponent(query)}`);
    }
  };

  const handleCopy = (trackingNum: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(trackingNum);
    setCopiedTrackingNum(trackingNum);
    setTimeout(() => {
      setCopiedTrackingNum(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
              Citizen Portal
            </span>
            <span className="text-ink/30">•</span>
            <CitizenTrustBadge level={trustLevel} showPerk={false} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Welcome back, {citizenName}
          </h1>
          <p className="font-body text-xs text-ink/65 max-w-xl">
            Live overview of your ward reports, municipal resolution statuses, and repair audits.
          </p>
        </div>

        <Button
          asChild
          variant="primary"
          size="default"
          className="cursor-pointer shrink-0 active:translate-y-px rounded-xs shadow-2xs font-medium"
        >
          <Link href="/report">
            <PlusCircle className="size-4 mr-2" /> Report an Issue
          </Link>
        </Button>
      </div>

      {/* Action Required: Pending Verification Notice */}
      {!isPendingFeedbackLoading && stats.pendingFeedback > 0 && (
        <div className="rounded-xl border border-line/80 bg-paper p-4.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-full bg-signal-resolved/10 flex items-center justify-center text-signal-resolved shrink-0 mt-0.5">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold text-ink">
                  Repairs Completed — Sign-Off Required
                </h2>
                <Badge
                  variant="outline"
                  className="border-signal-resolved/40 bg-signal-resolved/10 text-signal-resolved text-[10px] font-mono"
                >
                  {stats.pendingFeedback} awaiting review
                </Badge>
              </div>
              <p className="font-body text-xs text-ink/70 leading-relaxed">
                Field technicians logged completed repairs on your reported issues. Inspect photos
                and rate workmanship to officially close the work orders.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="primary"
            size="sm"
            className="cursor-pointer text-xs shrink-0 self-start sm:self-auto active:translate-y-px rounded-xs"
          >
            <Link href="/citizen/feedback">
              Review Work <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Realistic Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-line/70 bg-paper p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-ink/50 text-xs font-mono uppercase tracking-wider">
            <span>In Progress</span>
            <Clock className="size-4 text-ink/40" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">{stats.active}</p>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">Assigned or under active repair</p>
          </div>
        </div>

        <div className="rounded-xl border border-line/70 bg-paper p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-signal-resolved text-xs font-mono uppercase tracking-wider">
            <span>Resolved</span>
            <CheckCircle2 className="size-4 text-signal-resolved" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">{stats.resolved}</p>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">Repairs completed</p>
          </div>
        </div>

        <Link
          href="/citizen/feedback"
          className="rounded-xl border border-line/70 bg-paper p-4 flex flex-col justify-between shadow-2xs hover:border-line hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-ink/50 group-hover:text-ink">
            <span>Awaiting Sign-Off</span>
            <Star className="size-4 text-ink/40 group-hover:text-ledger transition-colors" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">
                {stats.pendingFeedback}
              </p>
              {stats.pendingFeedback > 0 && (
                <span className="text-[10px] font-mono text-ledger font-semibold">Rate now →</span>
              )}
            </div>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">Pending your verification</p>
          </div>
        </Link>

        <div className="rounded-xl border border-line/70 bg-paper p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between text-ink/50 text-xs font-mono uppercase tracking-wider">
            <span>Total Reported</span>
            <FileText className="size-4 text-ink/40" />
          </div>
          <div className="mt-3">
            <p className="font-display text-2xl sm:text-3xl font-semibold text-ink">{stats.total}</p>
            <p className="font-body text-[11px] text-ink/60 mt-0.5">Lifetime citizen reports</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Submissions (2 cols) + Citizen Ward Standing (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Recent Submissions & Search (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-line/80 bg-paper p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/60">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">Recent Reports</h2>
              <p className="font-body text-xs text-ink/60 mt-0.5">
                Active municipal status and direct tracking.
              </p>
            </div>

            <Button asChild variant="ghost" size="sm" className="cursor-pointer text-xs self-start sm:self-auto h-7 px-2">
              <Link href="/citizen/my-reports">
                View all ({stats.total}) <ArrowRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Quick Issue Tracker Search */}
          <form onSubmit={handleQuickTrack} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <Input
              type="text"
              placeholder="Track issue directly by # (e.g. ISS-..., REQ-...)..."
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              className="pl-8.5 pr-20 h-8.5 text-xs bg-field/30 border-line/70 rounded-xs"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6.5 px-2.5 text-[11px] font-mono cursor-pointer rounded-xs"
            >
              Track ↗
            </Button>
          </form>

          {/* Reports List */}
          {isLoading ? (
            <div className="h-44 flex items-center justify-center text-xs font-mono text-ink/40 animate-pulse">
              Loading recent reports...
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-line/40 bg-field/15 space-y-3">
              <Sparkles className="size-8 mx-auto text-ink/30" />
              <div className="space-y-1 max-w-sm mx-auto">
                <p className="font-display text-sm font-semibold text-ink">
                  No issues reported yet
                </p>
                <p className="font-body text-xs text-ink/60">
                  Notice a broken streetlight, pothole, or garbage accumulation in your ward?
                </p>
              </div>
              <Button asChild variant="primary" size="sm" className="cursor-pointer text-xs active:translate-y-px">
                <Link href="/report">Report an Issue</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-line/60">
              {recentRequests.map((request) => {
                const civicIssueNumber =
                  request.civicIssue?.issueNumber ||
                  request.linkedIssue?.issueNumber ||
                  (request as any).issueNumber;

                const primaryId = civicIssueNumber || request.trackingNumber;

                return (
                  <div
                    key={request.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-field/20 px-2 rounded-xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/track?issueNumber=${encodeURIComponent(primaryId)}`}
                          className="font-mono text-xs font-semibold text-ink hover:underline cursor-pointer"
                        >
                          #{primaryId}
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(primaryId, e)}
                          title="Copy reference ID"
                          className="p-0.5 text-ink/40 hover:text-ink transition-colors cursor-pointer"
                        >
                          {copiedTrackingNum === primaryId ? (
                            <Check className="size-3 text-signal-resolved" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                        {request.category && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-field/60 border border-line/60 text-ink/75">
                            {request.category.name}
                          </span>
                        )}
                      </div>

                      <p className="font-body text-xs text-ink/75 truncate max-w-md">
                        {request.description}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-ink/45">
                        <span>
                          {request.submittedAt
                            ? format(new Date(request.submittedAt), "MMM d, yyyy")
                            : ""}
                        </span>
                        {request.location?.address && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px] flex items-center gap-1">
                              <MapPin className="size-2.5 text-ink/35 shrink-0" />
                              {request.location.address}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <StatusPill status={request.status} />
                      <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="text-xs h-7 px-2.5 cursor-pointer active:translate-y-px rounded-xs font-medium"
                      >
                        <Link href={`/track?issueNumber=${encodeURIComponent(primaryId)}`}>
                          Track <ArrowUpRight className="size-3 ml-1 text-ink/50" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Citizen Profile Standing & Helplines (1 col) */}
        <div className="flex flex-col gap-5">
          {/* Real Citizen Standing Card */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-line/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-signal-resolved" />
                <h3 className="font-display text-sm font-semibold text-ink">Citizen Standing</h3>
              </div>
              <CitizenTrustBadge level={trustLevel} />
            </div>

            <div className="space-y-2 text-xs font-body">
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60">Registered Name:</span>
                <span className="font-medium text-ink truncate max-w-[150px]">{citizenName}</span>
              </div>
              {citizenProfile?.phone && (
                <div className="flex items-center justify-between py-1 border-b border-line/40">
                  <span className="text-ink/60">Contact Phone:</span>
                  <span className="font-mono text-ink font-medium">{citizenProfile.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-1 border-b border-line/40">
                <span className="text-ink/60">Triage Priority:</span>
                <span className="font-mono text-xs font-semibold text-ledger">
                  {trustLevel === "TRUSTED"
                    ? "Priority Dispatch"
                    : trustLevel === "REGULAR"
                      ? "Standard Verified"
                      : "Standard Queue"}
                </span>
              </div>
            </div>

            <p className="font-body text-[11px] text-ink/65 leading-relaxed pt-1">
              {trustLevel === "TRUSTED"
                ? "You hold Trusted Citizen status! Your reported issues skip municipal triage backlogs and are dispatched immediately."
                : "Verify completed repairs on resolved issues to build reputation score and unlock priority emergency dispatch."}
            </p>

            <Button
              asChild
              variant="secondary"
              size="sm"
              className="w-full text-xs h-7.5 cursor-pointer active:translate-y-px rounded-xs font-medium"
            >
              <Link href="/citizen/profile">
                Manage Profile & NID <ArrowRight className="size-3 ml-1 text-ink/50" />
              </Link>
            </Button>
          </div>

          {/* Civic Emergency & Ward Helplines */}
          <div className="rounded-xl border border-line/80 bg-paper p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-line/50">
              <PhoneCall className="size-3.5 text-ink/50" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink/60 font-semibold">
                Civic Helplines
              </h4>
            </div>

            <div className="space-y-2.5 text-xs font-body">
              <div className="flex items-center justify-between p-2 rounded-md bg-field/30 border border-line/50">
                <div>
                  <p className="font-semibold text-ink">Municipal Services & Info</p>
                  <p className="text-[10px] text-ink/50">Public helpline & complaints</p>
                </div>
                <span className="font-mono font-bold text-sm text-ledger">333</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-field/30 border border-line/50">
                <div>
                  <p className="font-semibold text-ink">National Emergency</p>
                  <p className="text-[10px] text-ink/50">Police, Fire & Ambulance</p>
                </div>
                <span className="font-mono font-bold text-sm text-signal-open">999</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
