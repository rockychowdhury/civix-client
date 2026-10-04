"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDepartmentWorkOrders } from "@/hooks/work-order.hook";
import { useGetMe } from "@/hooks/auth.hook";
import { WorkOrdersTable } from "@/components/tables/WorkOrdersTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkOrderDetailSheet } from "@/components/work-orders/WorkOrderDetailSheet";
import { WorkOrderContextMenu } from "@/components/tables/columns/WorkOrderContextMenu";
import type { WorkOrder } from "@/types";

export function WorkOrdersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL state sync
  const currentTab = searchParams.get("tab") || "needs-assignment";
  
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | undefined>();
  
  // Context Menu State
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuWorkOrder, setContextMenuWorkOrder] = useState<WorkOrder | null>(null);
  
  const { data: userData, isLoading: isUserLoading } = useGetMe();
  const departmentId = userData?.data?.staffProfile?.departmentMembers?.[0]?.departmentId;

  // Fetch via TanStack Query
  const { data: workOrdersData, isLoading: isWorkOrdersLoading, isError } = useDepartmentWorkOrders(departmentId, {
    tab: currentTab,
  });

  const isLoading = isUserLoading || isWorkOrdersLoading;
  const workOrders = workOrdersData?.data || [];

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-2 mb-4">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-2xl font-semibold text-ink">Work Orders</h1>
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="bg-field/50 border border-line/20 p-1">
              <TabsTrigger value="needs-assignment" className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer">
                Needs Assignment
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer">
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end pb-3">
          <Button variant="secondary" className="h-10 px-4 text-xs font-medium cursor-pointer bg-paper border border-line text-ink hover:bg-ink/5">
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
          <div className="h-8 w-8 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-4" />
          <span className="tracking-wide text-sm">Syncing with dispatch...</span>
        </div>
      ) : isError ? (
        <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
            <span className="text-signal-open text-xl font-display">!</span>
          </div>
          <p className="text-signal-open font-medium text-lg">System Disconnect</p>
          <p className="text-ink/40 max-w-sm">Unable to retrieve work orders. Please try refreshing.</p>
        </div>
      ) : (
        <WorkOrdersTable 
          data={workOrders} 
          currentTab={currentTab}
          selectedId={selectedWorkOrderId}
          onRowClick={(workOrder, event) => {
            if (event.type === 'contextmenu') {
              setContextMenuWorkOrder(workOrder);
              setContextMenuPosition({ x: event.clientX, y: event.clientY });
              setContextMenuOpen(true);
            } else {
              setSelectedWorkOrderId(workOrder.id);
            }
          }}
        />
      )}
      
      <WorkOrderDetailSheet 
        workOrderId={selectedWorkOrderId}
        isOpen={!!selectedWorkOrderId}
        onOpenChange={(open) => !open && setSelectedWorkOrderId(undefined)}
      />
      
      <WorkOrderContextMenu
        workOrder={contextMenuWorkOrder}
        isOpen={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        position={contextMenuPosition}
        onViewDetails={() => setSelectedWorkOrderId(contextMenuWorkOrder?.id)}
      />
    </>
  );
}
