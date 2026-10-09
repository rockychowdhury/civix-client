"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useServiceRequests } from "@/hooks";
import { ServiceRequestsTable } from "@/components/tables/ServiceRequestsTable";
import { ServiceRequestFilters } from "@/components/service-requests/ServiceRequestFilters";
import { ServiceRequestDetailSheet } from "@/components/service-requests/ServiceRequestDetailSheet";
import { ServiceRequestContextMenu } from "@/components/tables/columns/ServiceRequestContextMenu";
import type { ServiceRequest } from "@/types";

export function CitizenReportsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read status from URL, default to "all"
  const currentStatus = searchParams.get("status") || "all";

  // Detail sheet state
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Context Menu state
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuRequest, setContextMenuRequest] = useState<ServiceRequest | null>(null);

  // Fetch data
  const { data: requests, isLoading, isError } = useServiceRequests({ status: currentStatus });

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", newStatus);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4 animate-slide-up motion-reduce:animate-none">
      <ServiceRequestFilters status={currentStatus} onStatusChange={handleStatusChange} />

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
          <p className="text-ink/40 max-w-sm">
            Unable to retrieve citizen reports from the main queue at this time. Please try
            refreshing.
          </p>
        </div>
      ) : (
        <ServiceRequestsTable
          data={requests || []}
          onRowClick={(row, event) => {
            if (event.type === "contextmenu") {
              setContextMenuRequest(row);
              setContextMenuPosition({ x: event.clientX, y: event.clientY });
              setContextMenuOpen(true);
            } else {
              setSelectedRequestId(row.id);
            }
          }}
          selectedId={selectedRequestId || undefined}
        />
      )}

      <ServiceRequestDetailSheet
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
      />

      <ServiceRequestContextMenu
        request={contextMenuRequest}
        isOpen={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        position={contextMenuPosition}
        onViewDetails={() => setSelectedRequestId(contextMenuRequest?.id || null)}
        onOpenReclassify={() => setSelectedRequestId(contextMenuRequest?.id || null)} // Ideally opens sheet directly to reclassify
        onOpenLinkIssue={() => setSelectedRequestId(contextMenuRequest?.id || null)}
        onOpenFlagInvalid={() => setSelectedRequestId(contextMenuRequest?.id || null)}
      />
    </div>
  );
}
