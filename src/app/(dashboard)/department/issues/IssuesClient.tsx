"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { IssueDetailSheet } from "@/components/issues/IssueDetailSheet";
import { CivicIssuesTable } from "@/components/tables/CivicIssuesTable";
import { CivicIssueContextMenu } from "@/components/tables/columns/CivicIssueContextMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMe } from "@/hooks/auth.hook";
import { useDepartmentIssues } from "@/hooks/issue.hook";
import type { CivicIssue } from "@/types";

export const CIVIC_ISSUE_SUB_ROUTES = [
  {
    stage: "queue",
    title: "Issue Queue",
    description: "Civic issues awaiting triage, review, and work order creation",
    icon: Inbox,
  },
  {
    stage: "in_progress",
    title: "In-Progress Issues",
    description: "Active civic issues with dispatched work orders undergoing field remediation",
    icon: Clock,
  },
  {
    stage: "resolved",
    title: "Resolved Issues",
    description: "Civic issues verified as resolved, completed, and closed",
    icon: CheckCircle2,
  },
  {
    stage: "escalated",
    title: "Escalated Issues",
    description:
      "Issues with active, unresolved escalations or SLA breaches requiring urgent intervention",
    icon: AlertTriangle,
  },
];

export function IssuesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Resolve active stage from query params
  const rawStage = searchParams.get("stage");
  const rawStatus = searchParams.get("status");

  const currentStage = rawStage
    ? rawStage
    : rawStatus === "resolved"
      ? "resolved"
      : rawStatus === "scheduled" || rawStatus === "pending"
        ? "in_progress"
        : "queue";

  // Search input & debounce
  const [searchInput, setSearchInput] = useState(searchParams.get("searchTerm") || "");
  const [debouncedSearch] = useDebounce(searchInput, 400);

  // Filters & Pagination query params
  const selectedPriority = searchParams.get("priority") || "ALL";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  // Detail Drawer & Context Menu state
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>();
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const { data: userData, isLoading: isUserLoading } = useGetMe();
  const departmentId = userData?.data?.staffProfile?.departmentMembers?.[0]?.departmentId;

  // Query issues for the current sub-route
  const {
    data: issuesData,
    isLoading: isIssuesLoading,
    isFetching,
    isError,
  } = useDepartmentIssues(departmentId, {
    stage: currentStage,
    priority: selectedPriority !== "ALL" ? selectedPriority : undefined,
    searchTerm: debouncedSearch.trim() || undefined,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const isLoading = isUserLoading || isIssuesLoading;
  const issues: CivicIssue[] = issuesData?.data || [];
  const totalCount = issuesData?.meta?.total ?? issues.length;

  const activeSubRoute =
    CIVIC_ISSUE_SUB_ROUTES.find((r) => r.stage === currentStage) || CIVIC_ISSUE_SUB_ROUTES[0];

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

  const handlePriorityChange = (priority: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (priority && priority !== "ALL") {
      params.set("priority", priority);
    } else {
      params.delete("priority");
    }
    params.delete("page");
    router.replace(`?${params.toString()}`);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["civic-issues"] });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row: Heading, Search, Priority & Sync on same row for large screens */}
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

        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          {/* Priority Filter */}
          <div className="w-36 shrink-0">
            <Select value={selectedPriority} onValueChange={handlePriorityChange}>
              <SelectTrigger
                size="sm"
                className="h-8 text-xs bg-paper border-line/40 cursor-pointer text-ink font-body"
              >
                <Filter className="size-3 mr-1 text-ink/40" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs cursor-pointer">
                  All Priorities
                </SelectItem>
                <SelectItem value="LOW" className="text-xs cursor-pointer">
                  Low
                </SelectItem>
                <SelectItem value="MEDIUM" className="text-xs cursor-pointer">
                  Medium
                </SelectItem>
                <SelectItem value="HIGH" className="text-xs cursor-pointer">
                  High
                </SelectItem>
                <SelectItem value="CRITICAL" className="text-xs cursor-pointer">
                  Critical
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/40" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search issues..."
              className="h-8 pl-8 pr-7 text-xs bg-paper border-line/40 focus-visible:ring-1 focus-visible:ring-ledger font-body"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink cursor-pointer p-0.5"
              >
                <X className="h-3 w-3" />
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
          <span className="tracking-wide text-sm">Syncing with operations core...</span>
        </div>
      ) : isError ? (
        <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
            <span className="text-signal-open text-xl font-display">!</span>
          </div>
          <p className="text-signal-open font-medium text-lg">System Disconnect</p>
          <p className="text-ink/60 max-w-sm text-xs">
            Unable to retrieve departmental issues. Please verify your connection and try
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
        <CivicIssuesTable
          data={issues}
          currentStage={currentStage}
          searchTerm={debouncedSearch}
          totalCount={totalCount}
          selectedId={selectedIssueId}
          onRowClick={(issue, e) => {
            if (e.type === "contextmenu") {
              // Right click: open action panel only
              setSelectedIssue(issue as CivicIssue);
              setMenuPosition({ x: e.clientX, y: e.clientY });
              setIsMenuOpen(true);
            } else {
              // Left click: open issue detail sidebar drawer
              setSelectedIssueId(issue.id);
            }
          }}
        />
      )}

      {/* Action Context Menu (Right-Click Only) */}
      <CivicIssueContextMenu
        issue={selectedIssue}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        position={menuPosition}
        onViewDetails={() => setSelectedIssueId(selectedIssue?.id)}
      />

      {/* Issue Detail Sidebar Drawer (Left-Click) */}
      <IssueDetailSheet
        issueId={selectedIssueId}
        isOpen={!!selectedIssueId}
        onOpenChange={(open) => !open && setSelectedIssueId(undefined)}
      />
    </div>
  );
}
