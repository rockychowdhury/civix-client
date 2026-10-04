"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMyQueue, useAcceptWorkOrder } from "@/hooks/work-order.hook";
import { WorkOrdersTable } from "@/components/tables/WorkOrdersTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { WorkOrder } from "@/types";

export function TechnicianQueueClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentFilter = searchParams.get("filter") || "today";
  
  const { data: queueData, isLoading, isError, refetch } = useMyQueue({ filter: currentFilter });
  const workOrders = queueData?.data || [];
  
  const { mutate: acceptOrder, isPending: isAccepting } = useAcceptWorkOrder();

  const handleFilterChange = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", newFilter);
    router.push(`?${params.toString()}`);
  };

  const handleAccept = (workOrderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    acceptOrder({ id: workOrderId }, {
      onSuccess: () => {
        toast.success("Work order accepted");
      },
      onError: () => {
        toast.error("Failed to accept work order");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up motion-reduce:animate-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink">My Queue</h1>
        <Tabs value={currentFilter} onValueChange={handleFilterChange}>
          <TabsList className="bg-field/50 border border-line/20 p-1">
            <TabsTrigger value="today" className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer">
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer">
              This Week
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs uppercase tracking-wider font-display data-[state=active]:bg-ledger data-[state=active]:text-paper cursor-pointer">
              All Upcoming
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
          <div className="h-8 w-8 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-4" />
          <span className="tracking-wide text-sm">Loading your assignments...</span>
        </div>
      ) : isError ? (
        <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
            <span className="text-signal-open text-xl font-display">!</span>
          </div>
          <p className="text-signal-open font-medium text-lg">Unable to load queue</p>
          <button onClick={() => refetch()} className="text-ledger underline text-sm hover:text-ledger/80 cursor-pointer">
            Try again
          </button>
        </div>
      ) : (
        <WorkOrdersTable 
          data={workOrders} 
          currentTab="technician-queue"
          onRowClick={(workOrder) => {
            router.push(`/technician/work-orders/${workOrder.id}`);
          }}
          onAccept={handleAccept}
          isAccepting={isAccepting}
        />
      )}
    </div>
  );
}
