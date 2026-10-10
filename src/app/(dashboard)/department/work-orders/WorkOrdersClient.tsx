"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, RefreshCw, Search, ShieldAlert, Users, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { WorkOrderContextMenu } from "@/components/tables/columns/WorkOrderContextMenu";
import { WorkOrdersTable } from "@/components/tables/WorkOrdersTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkOrderDetailSheet } from "@/components/work-orders/WorkOrderDetailSheet";
import { useGetMe } from "@/hooks/auth.hook";
import { useDepartmentWorkOrders } from "@/hooks/work-order.hook";
import type { WorkOrder } from "@/types";

const SUB_ROUTES = [
  {
    status: "WORK_ORDER_CREATED",
    title: "Assign Crew",
    description: "Work orders awaiting technician or maintenance team assignment",
    icon: Users,
  },
  {
    status: "ASSIGNED,TEAM_ASSIGNED,IN_PROGRESS",
    title: "Active",
    description: "Field work actively underway or assigned to dispatched crews",
    icon: Clock,
  },
  {
    status: "PENDING_VERIFICATION",
    title: "Resolution Verification",
    description: "Completed work entries submitted for department sign-off and quality review",
    icon: ShieldAlert,
  },
  {
    status: "RESOLVED,CLOSED",
    title: "Completed",
    description: "Successfully resolved, verified, and officially closed work orders",
    icon: CheckCircle2,
  },
];

export function WorkOrdersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Route & status resolution
  const rawStatus = searchParams.get("status");
  const legacyTab = searchParams.get("tab");

  const currentStatus = rawStatus
    ? rawStatus
    : legacyTab === "needs-assignment"
      ? "WORK_ORDER_CREATED"
      : legacyTab === "active"
        ? "ASSIGNED,TEAM_ASSIGNED,IN_PROGRESS"
        : legacyTab === "pending-verification"
          ? "PENDING_VERIFICATION"
          : legacyTab === "completed"
            ? "RESOLVED,CLOSED"
            : "WORK_ORDER_CREATED";

  // Search filter
  const [searchInput, setSearchInput] = useState(searchParams.get("searchTerm") || "");
  const [debouncedSearch] = useDebounce(searchInput, 400);

  // Pagination & sorting query params
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  // Detail Sheet & Context Menu states
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | undefined>();
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuWorkOrder, setContextMenuWorkOrder] = useState<WorkOrder | null>(null);

  const { data: userData, isLoading: isUserLoading } = useGetMe();
  const departmentId = userData?.data?.staffProfile?.departmentMembers?.[0]?.departmentId;

  // Query department work orders with active status and filters
  const {
    data: workOrdersData,
    isLoading: isWorkOrdersLoading,
    isFetching,
    isError,
  } = useDepartmentWorkOrders(departmentId, {
    status: currentStatus,
    searchTerm: debouncedSearch.trim() || undefined,
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const isLoading = isUserLoading || isWorkOrdersLoading;
  const workOrders: WorkOrder[] = workOrdersData?.data || [];
  const totalCount = workOrdersData?.meta?.total ?? workOrders.length;

  const activeSubRoute = SUB_ROUTES.find((r) => r.status === currentStatus) || SUB_ROUTES[0];

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
    queryClient.invalidateQueries({ queryKey: ["department-work-orders"] });
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
              placeholder="Search work orders..."
              className="h-8 pl-8 pr-9 text-xs bg-paper border-line/40 focus-visible:ring-1 focus-visible:ring-ledger font-body"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink cursor-pointer p-2"
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
          <span className="tracking-wide text-sm">Retrieving department work orders...</span>
        </div>
      ) : isError ? (
        <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
            <span className="text-signal-open text-xl font-display">!</span>
          </div>
          <p className="text-signal-open font-medium text-lg">Unable to Load Work Orders</p>
          <p className="text-ink/60 max-w-sm text-xs">
            There was a problem syncing with the dispatch server. Please verify your connection and
            try refreshing.
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
        <WorkOrdersTable
          data={workOrders}
          currentTab={currentStatus}
          searchTerm={debouncedSearch}
          totalCount={totalCount}
          selectedId={selectedWorkOrderId}
          onRowClick={(workOrder, event) => {
            if (event.type === "contextmenu") {
              setContextMenuWorkOrder(workOrder);
              setContextMenuPosition({ x: event.clientX, y: event.clientY });
              setContextMenuOpen(true);
            } else {
              setSelectedWorkOrderId(workOrder.id);
            }
          }}
        />
      )}

      {/* Details Sheet Modal */}
      <WorkOrderDetailSheet
        workOrderId={selectedWorkOrderId}
        isOpen={!!selectedWorkOrderId}
        onOpenChange={(open) => !open && setSelectedWorkOrderId(undefined)}
      />

      {/* Context Menu */}
      <WorkOrderContextMenu
        workOrder={contextMenuWorkOrder}
        isOpen={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        position={contextMenuPosition}
        onViewDetails={() => setSelectedWorkOrderId(contextMenuWorkOrder?.id)}
      />
    </div>
  );
}
