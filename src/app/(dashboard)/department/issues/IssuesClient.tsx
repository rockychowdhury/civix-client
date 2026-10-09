"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDepartmentIssues } from "@/hooks/issue.hook";
import { useGetMe } from "@/hooks/auth.hook";
import { CivicIssuesTable } from "@/components/tables/CivicIssuesTable";
import { IssueFilters } from "@/components/issues/IssueFilters";
import { CivicIssueContextMenu } from "@/components/tables/columns/CivicIssueContextMenu";
import type { CivicIssue } from "@/types";

export function IssuesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state sync
  const currentStatus = searchParams.get("status") || "on-queue";

  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>();
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const { data: userData, isLoading: isUserLoading } = useGetMe();
  const departmentId = userData?.data?.staffProfile?.departmentMembers?.[0]?.departmentId;

  // Fetch via TanStack Query
  const {
    data: issuesData,
    isLoading: isIssuesLoading,
    isError,
  } = useDepartmentIssues(departmentId, {
    status: currentStatus,
  });

  const isLoading = isUserLoading || isIssuesLoading;

  const issues = issuesData?.data || [];

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", newStatus);
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <IssueFilters status={currentStatus} onStatusChange={handleStatusChange} />

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
          <div className="h-8 w-8 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-4" />
          <span className="tracking-wide text-sm">Syncing with queue...</span>
        </div>
      ) : isError ? (
        <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
            <span className="text-signal-open text-xl font-display">!</span>
          </div>
          <p className="text-signal-open font-medium text-lg">System Disconnect</p>
          <p className="text-ink/40 max-w-sm">
            Unable to retrieve operational issues. Please try refreshing.
          </p>
        </div>
      ) : (
        <>
          <CivicIssuesTable
            data={issues}
            selectedId={selectedIssueId}
            onRowClick={(issue, e) => {
              setSelectedIssueId(issue.id);
              setSelectedIssue(issue as CivicIssue);
              setMenuPosition({ x: e.clientX, y: e.clientY });
              setIsMenuOpen(true);
            }}
          />
          <CivicIssueContextMenu
            issue={selectedIssue}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            position={menuPosition}
          />
        </>
      )}
    </>
  );
}
