import { Button } from "@/components/ui/button";
import { useConfirmSuggestedTechnician } from "@/hooks/work-order.hook";
import { toast } from "sonner";
import type { WorkOrder } from "@/types";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AssignTechnicianSelect } from "./AssignTechnicianSelect";
export function TechnicianSuggestionInline({ workOrder }: { workOrder: WorkOrder }) {
  const confirmSuggestion = useConfirmSuggestedTechnician();
  const [isAssigning, setIsAssigning] = useState(false);

  const isPendingAssignment = !workOrder.currentAssigneeId && !workOrder.suggestedAssigneeId;
  const hasSuggestion = !workOrder.currentAssigneeId && !!workOrder.suggestedAssigneeId;
  const isConfirmed = !!workOrder.currentAssigneeId;

  if (isAssigning) {
    return <AssignTechnicianSelect workOrder={workOrder} onCancel={() => setIsAssigning(false)} />;
  }

  if (isConfirmed) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-ledger font-mono text-[0.625rem] font-medium text-paper">
          {workOrder.currentAssignee?.firstName?.[0]}{workOrder.currentAssignee?.lastName?.[0]}
        </span>
        <span className="text-sm font-medium text-ink">
          Assigned to {workOrder.currentAssignee?.firstName} {workOrder.currentAssignee?.lastName}
        </span>
      </div>
    );
  }

  if (isPendingAssignment) {
    return (
      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 text-signal-open text-xs font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          No technician available
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-7 text-xs bg-signal-open/10 text-signal-open hover:bg-signal-open/20 cursor-pointer"
          onClick={() => setIsAssigning(true)}
        >
          Assign manually
        </Button>
      </div>
    );
  }

  if (hasSuggestion) {
    const suggested = workOrder.suggestedAssignee;
    return (
      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink/80">
            {suggested?.firstName} {suggested?.lastName}
          </span>
          <span className="text-xs font-mono text-ink/50 bg-ink/5 px-1.5 py-0.5 rounded-sm">
            (Suggested)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            className="h-7 px-3 text-xs bg-ledger hover:bg-ledger/90 text-paper cursor-pointer"
            onClick={() => {
              confirmSuggestion.mutate({ id: workOrder.id }, {
                onSuccess: () => toast.success("Technician assignment confirmed")
              });
            }}
            disabled={confirmSuggestion.isPending}
          >
            {confirmSuggestion.isPending ? <RefreshCw className="h-3 w-3 animate-spin mr-1.5" /> : <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
            Confirm
          </Button>
          <span 
            className="text-xs font-medium text-ink/50 hover:text-ink cursor-pointer hover:underline underline-offset-2 transition-colors"
            onClick={() => setIsAssigning(true)}
          >
            Change
          </span>
        </div>
      </div>
    );
  }

  return null;
}
