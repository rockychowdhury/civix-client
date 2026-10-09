"use client";

import { format } from "date-fns";
import { MapPin, PlusCircle, Search, Sparkles, Star, Tag } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyServiceRequests } from "@/hooks/citizen.hook";
import type { ServiceRequest } from "@/types";
import { CitizenFeedbackDialog } from "./CitizenFeedbackDialog";
import { CitizenRequestDetailModal } from "./CitizenRequestDetailModal";

type FilterTab = "ALL" | "SUBMITTED" | "IN_PROGRESS" | "RESOLVED";

export function CitizenMyReportsView() {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [feedbackRequest, setFeedbackRequest] = useState<ServiceRequest | null>(null);

  const { data: requestsRes, isLoading } = useMyServiceRequests();
  const allRequests: ServiceRequest[] = requestsRes?.data || [];

  const filteredRequests = useMemo(() => {
    return allRequests.filter((req) => {
      // Status tab filtering
      const status = req.status.toUpperCase();
      if (activeTab === "SUBMITTED" && status !== "SUBMITTED" && status !== "NEW") {
        return false;
      }
      if (
        activeTab === "IN_PROGRESS" &&
        ![
          "ASSIGNED",
          "ACCEPTED",
          "IN_PROGRESS",
          "PENDING_ASSIGNMENT",
          "PENDING_VERIFICATION",
        ].includes(status)
      ) {
        return false;
      }
      if (activeTab === "RESOLVED" && !["RESOLVED", "CLOSED", "COMPLETED"].includes(status)) {
        return false;
      }

      // Search filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTracking = req.trackingNumber?.toLowerCase().includes(q);
        const matchesDesc = req.description?.toLowerCase().includes(q);
        const matchesAddress = req.location?.address?.toLowerCase().includes(q);
        const matchesCategory = req.category?.name?.toLowerCase().includes(q);
        if (!matchesTracking && !matchesDesc && !matchesAddress && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [allRequests, activeTab, searchQuery]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My Reports</h1>
          <p className="font-body text-sm text-ink/60">
            Review status updates and track municipal resolution for your reported issues.
          </p>
        </div>

        <Button asChild variant="primary" className="cursor-pointer shrink-0">
          <Link href="/report">
            <PlusCircle className="size-4 mr-2" /> Report New Issue
          </Link>
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-line">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as FilterTab)}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-field/40 border border-line p-1">
            <TabsTrigger value="ALL" className="text-xs cursor-pointer">
              All ({allRequests.length})
            </TabsTrigger>
            <TabsTrigger value="SUBMITTED" className="text-xs cursor-pointer">
              Submitted
            </TabsTrigger>
            <TabsTrigger value="IN_PROGRESS" className="text-xs cursor-pointer">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="RESOLVED" className="text-xs cursor-pointer">
              Resolved
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
          <Input
            type="text"
            placeholder="Search tracking # or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-paper border-line"
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-sm font-mono text-ink/40 animate-pulse">
          Loading your service reports...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-xl border border-line bg-field/10 p-12 text-center space-y-4">
          <Sparkles className="size-10 mx-auto text-ink/30" />
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-ink">No reports found</h3>
            <p className="font-body text-sm text-ink/60 max-w-md mx-auto">
              {searchQuery
                ? `No reports match your search query "${searchQuery}".`
                : activeTab !== "ALL"
                  ? `You have no reports currently in the "${activeTab.toLowerCase()}" state.`
                  : "You haven't submitted any civic issue reports yet."}
            </p>
          </div>
          <Button asChild variant="primary" size="sm" className="cursor-pointer">
            <Link href="/report">Report an Issue Now</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((request) => {
            const statusUpper = request.status.toUpperCase();
            const isEligibleForRating =
              statusUpper === "RESOLVED" ||
              statusUpper === "CLOSED" ||
              statusUpper === "COMPLETED" ||
              statusUpper === "PENDING_VERIFICATION";
            const needsRating = isEligibleForRating && !request.feedback;
            const activeWo = request.civicIssue?.workOrders?.[0];
            const resolution = activeWo?.resolution;
            const resolutionSummary = resolution?.summary || request.resolutionNotes;

            return (
              <div
                key={request.id}
                className="rounded-xl border border-line bg-paper p-5 transition-shadow hover:shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-ink">
                      {request.trackingNumber}
                    </span>
                    {request.category && (
                      <Badge variant="outline" className="text-xs bg-field/50 border-line text-ink">
                        <Tag className="size-3 mr-1 text-ink/40" />
                        {request.category.name}
                      </Badge>
                    )}
                    <span className="text-xs text-ink/40 font-mono">
                      •{" "}
                      {request.submittedAt
                        ? format(new Date(request.submittedAt), "MMM d, yyyy")
                        : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusPill status={request.status} />
                  </div>
                </div>

                <p className="font-body text-sm text-ink/80 leading-relaxed line-clamp-2">
                  {request.description}
                </p>

                {resolutionSummary && (
                  <div className="p-3 rounded-md bg-field/30 border border-line/40 text-xs text-ink/80 space-y-0.5">
                    <span className="font-mono text-[10px] uppercase text-signal-resolved font-medium block">
                      Technician Fix Summary:
                    </span>
                    <p className="font-body italic line-clamp-2">{resolutionSummary}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-line/60 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-ink/60 font-body">
                    {request.location?.address && (
                      <span className="flex items-center gap-1.5 truncate max-w-sm">
                        <MapPin className="size-3.5 text-signal-progress shrink-0" />
                        <span className="truncate">{request.location.address}</span>
                      </span>
                    )}
                    {request.attachments && request.attachments.length > 0 && (
                      <span className="font-mono text-[11px] text-ink/50">
                        {request.attachments.length} photo
                        {request.attachments.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {needsRating && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setFeedbackRequest(request)}
                        className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50 cursor-pointer"
                      >
                        <Star className="size-3.5 mr-1.5 fill-amber-400 text-amber-500" /> Rate Work
                      </Button>
                    )}

                    {request.feedback && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-mono font-medium px-2 py-1 rounded-sm bg-amber-50/60 border border-amber-200">
                        <Star className="size-3 fill-amber-400 text-amber-500" />
                        {request.feedback.rating}/5 Rated
                      </span>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedRequestId(request.id)}
                      className="text-xs cursor-pointer"
                    >
                      Inspect Timeline
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Sheet Modal */}
      <CitizenRequestDetailModal
        isOpen={!!selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        requestId={selectedRequestId}
      />

      {/* Direct Feedback Dialog */}
      {feedbackRequest && (
        <CitizenFeedbackDialog
          isOpen={!!feedbackRequest}
          onClose={() => setFeedbackRequest(null)}
          serviceRequestId={feedbackRequest.id}
          resolutionId={feedbackRequest.civicIssue?.workOrders?.[0]?.resolution?.id}
          resolutionSummary={
            feedbackRequest.civicIssue?.workOrders?.[0]?.resolution?.summary ||
            feedbackRequest.resolutionNotes
          }
          resolutionAttachments={
            feedbackRequest.civicIssue?.workOrders?.[0]?.resolution?.attachments
          }
          trackingNumber={feedbackRequest.trackingNumber}
        />
      )}
    </div>
  );
}
