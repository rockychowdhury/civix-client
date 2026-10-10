"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, FileText, Inbox, RefreshCw, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { ServiceRequestDetailSheet } from "@/components/service-requests/ServiceRequestDetailSheet";
import { ServiceRequestContextMenu } from "@/components/tables/columns/ServiceRequestContextMenu";
import { ServiceRequestsTable } from "@/components/tables/ServiceRequestsTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMe } from "@/hooks/auth.hook";
import { useDepartmentServiceRequests } from "@/hooks/service-requests.hook";
import type { ServiceRequest } from "@/types";

export const CITIZEN_REPORT_SUB_ROUTES = [
  {
    stage: "queue",
    title: "Request Queue",
    description:
      "Incoming citizen submissions awaiting triage, review, or merging into civic issues",
    icon: Inbox,
  },
  {
    stage: "in_progress",
    title: "In-Progress Requests",
    description:
      "Active citizen reports linked to underlying civic issues undergoing field remediation",
    icon: Clock,
  },
  {
    stage: "resolved",
    title: "Resolved Requests",
    description: "Citizen service requests verified as resolved, completed, and closed",
    icon: CheckCircle2,
  },
  {
    stage: "all",
    title: "All Citizen Reports",
    description: "Complete historical registry of all departmental citizen service submissions",
    icon: FileText,
  },
];

export function CitizenReportsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // URL state
  const rawStage = searchParams.get("stage");
  const rawStatus = searchParams.get("status");

  const currentStage = rawStage
    ? rawStage
    : rawStatus === "RESOLVED" || rawStatus === "CLOSED"
      ? "resolved"
      : rawStatus === "ASSIGNED" || rawStatus === "IN_PROGRESS"
        ? "in_progress"
        : "queue";

  // Search input & debounce
  const [searchInput, setSearchInput] = useState(searchParams.get("searchTerm") || "");
  const [debouncedSearch] = useDebounce(searchInput, 400);

  // Pagination & sorting query params
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  // Detail Sheet & Context Menu states
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuRequest, setContextMenuRequest] = useState<ServiceRequest | null>(null);

  const { data: userData, isLoading: isUserLoading } = useGetMe();
  const departmentId = userData?.data?.staffProfile?.departmentMembers?.[0]?.departmentId;

  // Query service requests for active sub-route
  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    isFetching,
    isError,
  } = useDepartmentServiceRequests(departmentId, {
    stage: currentStage,
    searchTerm: debouncedSearch.trim() || undefined,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const isLoading = isUserLoading || isRequestsLoading;
  const requests: ServiceRequest[] = requestsData?.data || [];
  const totalCount = requestsData?.meta?.total ?? requests.length;

  const activeSubRoute =
    CITIZEN_REPORT_SUB_ROUTES.find((r) => r.stage === currentStage) || CITIZEN_REPORT_SUB_ROUTES[0];

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("searchTerm", value.trim());
    } else {
      params.delete("searchTerm");
    }
    params.delete("page");
    router.replace(`?${params.toString()}`);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    queryClient.invalidateQueries({ queryKey: ["department-service-requests"] });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row: Heading, Search & Sync on same row for large screens */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-line/40 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
              {activeSubRoute.title}
            </h1>
            {!isLoading && (
              <Badge
                variant="secondary"
                className="bg-ink/5 text-ink/70 border-line/40 font-mono text-xs px-2 py-0.5"
              >
                {totalCount} total
              </Badge>
            )}
          </div>
          <p className="text-xs text-ink/60 mt-1">{activeSubRoute.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/40" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by tracking # or issue..."
              className="h-8 pl-8 pr-7 text-xs bg-paper border-line/40 focus-visible:ring-1 focus-visible:ring-ledger font-body"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink cursor-pointer p-2"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sync Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="h-8 px-2.5 text-xs text-ink/70 hover:text-ink bg-paper border-line/40 cursor-pointer shrink-0"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
          <div className="h-8 w-8 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-4" />
          <span className="tracking-wide text-sm">Syncing with intake queue...</span>
        </div>
      ) : isError ? (
        <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
            <span className="text-signal-open text-xl font-display">!</span>
          </div>
          <p className="text-signal-open font-medium text-lg">System Disconnect</p>
          <p className="text-ink/60 max-w-sm text-xs">
            Unable to retrieve citizen reports from the main queue at this time. Please try
            refreshing.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="cursor-pointer text-xs mt-2 bg-paper border-line/40 text-ink"
          >
            Retry Connection
          </Button>
        </div>
      ) : (
        <ServiceRequestsTable
          data={requests}
          currentStage={currentStage}
          searchTerm={debouncedSearch}
          totalCount={totalCount}
          selectedId={selectedRequestId || undefined}
          onRowClick={(row, event) => {
            if (event.type === "contextmenu") {
              // Right-click: open action panel only
              setContextMenuRequest(row);
              setContextMenuPosition({ x: event.clientX, y: event.clientY });
              setContextMenuOpen(true);
            } else {
              // Left-click: open detail sidebar drawer
              setSelectedRequestId(row.id);
            }
          }}
        />
      )}

      {/* Detail Sidebar Drawer (Left-Click) */}
      <ServiceRequestDetailSheet
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
      />

      {/* Context Action Menu (Right-Click Only) */}
      <ServiceRequestContextMenu
        request={contextMenuRequest}
        isOpen={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        position={contextMenuPosition}
        onViewDetails={() => setSelectedRequestId(contextMenuRequest?.id || null)}
        onOpenReclassify={() => setSelectedRequestId(contextMenuRequest?.id || null)}
        onOpenLinkIssue={() => setSelectedRequestId(contextMenuRequest?.id || null)}
        onOpenFlagInvalid={() => setSelectedRequestId(contextMenuRequest?.id || null)}
      />
    </div>
  );
}
