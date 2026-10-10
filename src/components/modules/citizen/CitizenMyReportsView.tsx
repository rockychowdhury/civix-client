"use client";

import { format } from "date-fns";
import {
  ArrowUpRight,
  Check,
  Copy,
  MapPin,
  PlusCircle,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCancelServiceRequest, useMyServiceRequests } from "@/hooks/citizen.hook";
import { cn } from "@/lib/utils";
import type { ServiceRequest } from "@/types";

type FilterTab = "ALL" | "IN_PROGRESS" | "SUBMITTED" | "RESOLVED" | "CANCELLED";

const ITEMS_PER_PAGE = 12;

export function CitizenMyReportsView() {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<ServiceRequest | null>(null);

  const { data: requestsRes, isLoading } = useMyServiceRequests();
  const allRequests: ServiceRequest[] = requestsRes?.data || [];

  const cancelMutation = useCancelServiceRequest();

  const counts = useMemo(() => {
    const all = allRequests.length;
    const inProgress = allRequests.filter((r) => r.status.toUpperCase() === "IN_PROGRESS").length;
    const submitted = allRequests.filter((r) => {
      const s = r.status.toUpperCase();
      return s === "SUBMITTED" || s === "NEW";
    }).length;
    const resolved = allRequests.filter((r) => {
      const s = r.status.toUpperCase();
      return s === "RESOLVED" || s === "CLOSED" || s === "COMPLETED";
    }).length;
    const cancelled = allRequests.filter((r) => r.status.toUpperCase() === "CANCELLED").length;

    return { all, inProgress, submitted, resolved, cancelled };
  }, [allRequests]);

  const filteredRequests = useMemo(() => {
    return allRequests.filter((req) => {
      const status = req.status.toUpperCase();

      if (activeTab === "IN_PROGRESS" && status !== "IN_PROGRESS") {
        return false;
      }
      if (activeTab === "SUBMITTED" && status !== "SUBMITTED" && status !== "NEW") {
        return false;
      }
      if (
        activeTab === "RESOLVED" &&
        status !== "RESOLVED" &&
        status !== "CLOSED" &&
        status !== "COMPLETED"
      ) {
        return false;
      }
      if (activeTab === "CANCELLED" && status !== "CANCELLED") {
        return false;
      }

      // Search filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTracking = req.trackingNumber?.toLowerCase().includes(q);
        const matchesCivicIssue =
          req.civicIssue?.issueNumber?.toLowerCase().includes(q) ||
          req.linkedIssue?.issueNumber?.toLowerCase().includes(q) ||
          (req as any).issueNumber?.toLowerCase().includes(q);
        const matchesDesc = req.description?.toLowerCase().includes(q);
        const matchesAddress = req.location?.address?.toLowerCase().includes(q);
        const matchesCategory = req.category?.name?.toLowerCase().includes(q);
        if (
          !matchesTracking &&
          !matchesCivicIssue &&
          !matchesDesc &&
          !matchesAddress &&
          !matchesCategory
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allRequests, activeTab, searchQuery]);

  const totalReports = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalReports / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalReports);

  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(startIndex, endIndex);
  }, [filteredRequests, startIndex, endIndex]);

  const paginationItems = useMemo(() => {
    const items: Array<{ type: "page"; page: number } | { type: "ellipsis"; key: string }> = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push({ type: "page", page: i });
      }
    } else {
      items.push({ type: "page", page: 1 });
      if (safeCurrentPage > 3) {
        items.push({ type: "ellipsis", key: "ellipsis-start" });
      }
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        items.push({ type: "page", page: i });
      }
      if (safeCurrentPage < totalPages - 2) {
        items.push({ type: "ellipsis", key: "ellipsis-end" });
      }
      items.push({ type: "page", page: totalPages });
    }
    return items;
  }, [totalPages, safeCurrentPage]);

  const handleCopy = (idText: string) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(idText);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleConfirmCancel = async () => {
    if (!requestToCancel) return;
    await cancelMutation.mutateAsync({ id: requestToCancel.id });
    setRequestToCancel(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">My Reports</h1>
          <p className="font-body text-xs text-ink/60 mt-0.5">
            Overview of your reported civic issues and active municipal status.
          </p>
        </div>

        <Button
          asChild
          variant="primary"
          size="sm"
          className="cursor-pointer shrink-0 active:translate-y-px"
        >
          <Link href="/report">
            <PlusCircle className="size-3.5 mr-1.5" /> Report Issue
          </Link>
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-line">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as FilterTab);
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-field/50 border border-line/60 p-1 rounded-sm gap-1">
            <TabsTrigger value="ALL" className="font-body text-xs cursor-pointer">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="IN_PROGRESS" className="font-body text-xs cursor-pointer">
              In Progress ({counts.inProgress})
            </TabsTrigger>
            <TabsTrigger value="SUBMITTED" className="font-body text-xs cursor-pointer">
              Submitted ({counts.submitted})
            </TabsTrigger>
            <TabsTrigger value="RESOLVED" className="font-body text-xs cursor-pointer">
              Resolved ({counts.resolved})
            </TabsTrigger>
            {counts.cancelled > 0 && (
              <TabsTrigger value="CANCELLED" className="font-body text-xs cursor-pointer">
                Cancelled ({counts.cancelled})
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
          <Input
            type="text"
            placeholder="Search tracking # or keyword..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8.5 pr-8 h-8 text-xs bg-paper border-line"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-ink/40 animate-pulse">
          Loading service reports...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-xl border border-line bg-field/10 p-10 text-center space-y-3">
          <Sparkles className="size-8 mx-auto text-ink/30" />
          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-ink">No reports found</h3>
            <p className="font-body text-xs text-ink/60 max-w-sm mx-auto">
              {searchQuery
                ? `No reports match "${searchQuery}".`
                : activeTab !== "ALL"
                  ? `No reports currently in ${activeTab.toLowerCase().replace("_", " ")} status.`
                  : "You haven't submitted any civic issue reports yet."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            {searchQuery && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer text-xs h-8 active:translate-y-px"
              >
                Clear Search
              </Button>
            )}
            <Button
              asChild
              variant="primary"
              size="sm"
              className="cursor-pointer text-xs h-8 active:translate-y-px"
            >
              <Link href="/report">Report an Issue</Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Reports Container with 12 items per page pagination */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedRequests.map((request) => {
              const statusUpper = request.status.toUpperCase();
              const isInProgress = statusUpper === "IN_PROGRESS";

              // Priority: Civic Issue Number (ISS-...) over Request tracking number
              const civicIssueNumber =
                request.civicIssue?.issueNumber ||
                request.linkedIssue?.issueNumber ||
                (request as any).issue?.issueNumber ||
                (request as any).issueNumber ||
                (request as any).civicIssueNumber ||
                (request.trackingNumber?.startsWith("ISS") ? request.trackingNumber : null);

              const primaryDisplayId = civicIssueNumber || request.trackingNumber;
              const secondaryRefId =
                civicIssueNumber && request.trackingNumber && civicIssueNumber !== request.trackingNumber
                  ? request.trackingNumber
                  : null;

              return (
                <div
                  key={request.id}
                  className="rounded-xl border border-line/70 bg-paper p-4.5 flex flex-col justify-between gap-3.5 shadow-2xs hover:border-line hover:shadow-xs transition-all duration-150"
                >
                  {/* Top Row: Ref ID + Status */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-ink bg-field/70 border border-line/60 px-2 py-0.5 rounded-xs tracking-tight">
                            #{primaryDisplayId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(primaryDisplayId)}
                            title="Copy issue reference"
                            className="p-1 text-ink/40 hover:text-ink cursor-pointer transition-colors active:translate-y-px rounded-xs hover:bg-field/50"
                          >
                            {copiedId === primaryDisplayId ? (
                              <Check className="size-3 text-signal-resolved" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                        {secondaryRefId && (
                          <div className="font-mono text-[10px] text-ink/40 mt-1 truncate">
                            Ref: {secondaryRefId}
                          </div>
                        )}
                      </div>

                      <StatusPill status={request.status} />
                    </div>

                    {/* Category tag & Date */}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-ink/50 pt-0.5">
                      {request.category?.name && (
                        <span className="px-2 py-0.5 rounded-xs bg-field/60 border border-line/60 text-ink/75 truncate max-w-[140px] font-medium">
                          {request.category.name}
                        </span>
                      )}
                      {request.category?.name && <span className="text-ink/30">•</span>}
                      <span>
                        {request.submittedAt
                          ? format(new Date(request.submittedAt), "MMM d, yyyy")
                          : ""}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Description snippet & Location */}
                  <div className="space-y-2 flex-1">
                    <p className="font-body text-xs text-ink/80 line-clamp-2 leading-relaxed min-h-[2.4rem]">
                      {request.description || "No description provided."}
                    </p>

                    {request.location?.address && (
                      <div className="flex items-center gap-1.5 text-[11px] text-ink/50 font-body truncate pt-0.5">
                        <MapPin className="size-3 text-ink/40 shrink-0" />
                        <span className="truncate">{request.location.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="pt-3 border-t border-line/50 flex items-center justify-end gap-2">
                    {/* Cancel action: ONLY if currently in progress */}
                    {isInProgress && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setRequestToCancel(request)}
                        className="h-7.5 px-3 text-xs text-signal-open border border-signal-open/30 bg-transparent hover:bg-signal-open/10 hover:border-signal-open/60 active:translate-y-px cursor-pointer font-medium rounded-xs"
                      >
                        Cancel
                      </Button>
                    )}

                    {/* Track action: Redirects to /track using the Civic Issue Number (ISS-...) */}
                    <Button
                      asChild
                      variant="primary"
                      size="sm"
                      className="h-7.5 px-3 text-xs active:translate-y-px cursor-pointer font-medium rounded-xs shadow-2xs"
                    >
                      <Link href={`/track?issueNumber=${encodeURIComponent(primaryDisplayId)}`}>
                        Track <ArrowUpRight className="size-3.5 ml-1 text-paper/80" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shadcn Pagination Controls (12 reports per page) */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="font-mono text-ink/60">
                Showing <strong className="text-ink font-semibold">{startIndex + 1}</strong>–
                <strong className="text-ink font-semibold">{endIndex}</strong> of{" "}
                <strong className="text-ink font-semibold">{totalReports}</strong> reports
              </span>

              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    />
                  </PaginationItem>

                  {paginationItems.map((item) => {
                    if (item.type === "ellipsis") {
                      return (
                        <PaginationItem key={item.key}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={`page-${item.page}`}>
                        <PaginationLink
                          isActive={item.page === safeCurrentPage}
                          onClick={() => setCurrentPage(item.page)}
                        >
                          {item.page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Cancel Action */}
      <Dialog open={!!requestToCancel} onOpenChange={(open) => !open && setRequestToCancel(null)}>
        <DialogContent className="sm:max-w-md bg-paper border border-line text-ink">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-ink">
              Cancel Service Request
            </DialogTitle>
            <DialogDescription className="font-body text-xs text-ink/70">
              Are you sure you want to cancel request{" "}
              <span className="font-mono font-semibold text-ink">
                {requestToCancel?.trackingNumber}
              </span>
              ? This will notify municipal dispatch and halt technician operations for this issue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRequestToCancel(null)}
              disabled={cancelMutation.isPending}
              className="cursor-pointer text-xs active:translate-y-px"
            >
              Keep Request
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={cancelMutation.isPending}
              onClick={handleConfirmCancel}
              className="cursor-pointer text-xs active:translate-y-px"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
