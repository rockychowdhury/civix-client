"use client";

import { useWorkOrderById, useWorkOrderUpdates } from "@/hooks/work-order.hook";
import { format } from "date-fns";
import { ArrowLeft, Paperclip, MapPin } from "lucide-react";
import Link from "next/link";
import { StatusPill } from "@/components/layout/dashboard/StatusPill";
import { Badge } from "@/components/ui/badge";
import { WorkOrderStatusLedger } from "@/components/work-orders/WorkOrderStatusLedger";
import { WorkUpdateForm } from "@/components/forms/WorkUpdateForm";
import { ResolutionUpdateForm } from "@/components/forms/ResolutionUpdateForm";

interface TechnicianWorkOrderDetailClientProps {
  id: string;
}

export function TechnicianWorkOrderDetailClient({ id }: TechnicianWorkOrderDetailClientProps) {
  const { data: workOrderData, isLoading: isLoadingWO, isError: isErrorWO } = useWorkOrderById(id);
  const { data: updatesData, isLoading: isLoadingUpdates } = useWorkOrderUpdates(id);

  if (isLoadingWO || isLoadingUpdates) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-ink/40 font-body animate-pulse">
        <div className="h-8 w-8 rounded-full border-2 border-ledger border-t-transparent animate-spin mb-4" />
        <span className="tracking-wide text-sm">Loading details...</span>
      </div>
    );
  }

  if (isErrorWO || !workOrderData?.data) {
    return (
      <div className="h-64 flex flex-col items-center justify-center font-body text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-signal-open/10 flex items-center justify-center mb-2">
          <span className="text-signal-open text-xl font-display">!</span>
        </div>
        <p className="text-signal-open font-medium text-lg">Work order not found</p>
      </div>
    );
  }

  const workOrder = workOrderData.data;
  const updates = updatesData?.data || [];
  const priority = workOrder.priority || "Normal";
  
  const isCompleted = workOrder.status === "RESOLVED" || workOrder.status === "CLOSED" || workOrder.status === "PENDING_VERIFICATION";

  return (
    <div className="flex flex-col gap-8 w-full animate-slide-up motion-reduce:animate-none pb-24">
      {/* Header - Minimal Chrome */}
      <div className="flex flex-col gap-4">
        <Link href="/technician/queue" className="flex items-center text-sm font-medium text-ink/50 hover:text-ink transition-colors w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Queue
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-2xl font-semibold text-ink">
            {workOrder.id.split('-')[0].toUpperCase()}
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant={priority === "HIGH" || priority === "URGENT" || priority === "CRITICAL" ? "destructive" : "secondary"} className="text-xs uppercase tracking-wider">
              {priority}
            </Badge>
            <StatusPill status={workOrder.status} />
          </div>
        </div>
        <h2 className="font-display text-xl text-ink/90">{workOrder.title}</h2>
      </div>

      {/* Location */}
      {workOrder.civicIssue?.location && (
        <div className="bg-field/30 p-4 rounded-lg border border-line/20 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-ink/50 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-ink">{workOrder.civicIssue.location.address}</p>
            <p className="text-sm text-ink/60">{workOrder.civicIssue.location.ward} / {workOrder.civicIssue.location.zone}</p>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-paper p-6 rounded-lg border border-line">
        <h3 className="font-display font-medium text-ink mb-2">Instructions / Description</h3>
        <p className="text-ink/80 whitespace-pre-wrap">{workOrder.description}</p>
        
        {workOrder.civicIssue?.attachments?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-line/20">
            <div className="flex items-center gap-2 text-sm font-medium text-ink/70 mb-3">
              <Paperclip className="h-4 w-4" />
              Reference Photos ({workOrder.civicIssue.attachments.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {workOrder.civicIssue.attachments.map((att: any, i: number) => (
                <div key={i} className="h-20 w-20 rounded-md bg-field/50 border border-line/30 flex items-center justify-center text-xs text-ink/40">
                  Photo {i+1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions / Ledger Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Col: Ledger */}
        <div className="w-full md:w-1/2">
          <h3 className="font-display font-medium text-lg text-ink mb-4">Activity</h3>
          <WorkOrderStatusLedger 
            createdAt={workOrder.createdAt}
            updates={updates}
          />
        </div>

        {/* Right Col: Forms */}
        {!isCompleted && (
          <div className="w-full md:w-1/2 flex flex-col gap-8">
            <div>
              <h3 className="font-display font-medium text-lg text-ink mb-4">Post an Update</h3>
              <WorkUpdateForm workOrderId={workOrder.id} />
            </div>

            <div className="pt-8 border-t border-line/20">
              <ResolutionUpdateForm workOrderId={workOrder.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
