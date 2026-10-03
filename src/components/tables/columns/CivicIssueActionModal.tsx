import { useState, useEffect } from "react";
import { useUpdateIssueStatus } from "@/hooks/issue.hook";
import { useCreateWorkOrder } from "@/hooks/work-order.hook";
import { Button } from "@/components/ui/button";
import { CalendarPlus, RefreshCw, History, ArrowLeft } from "lucide-react";
import type { CivicIssue } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STATUSES = [
  "TRIAGED",
  "ACCEPTED",
  "IN_PROGRESS",
  "PENDING_VERIFICATION",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "REJECTED",
  "DUPLICATE",
  "INSUFFICIENT_INFORMATION",
];

interface CivicIssueActionModalProps {
  issue: CivicIssue | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CivicIssueActionModal({ issue, isOpen, onClose }: CivicIssueActionModalProps) {
  const updateStatus = useUpdateIssueStatus();
  const createWorkOrder = useCreateWorkOrder();
  
  const [view, setView] = useState<"actions" | "status" | "custom-work-order">("actions");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(addDays(new Date(), 1));

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setView("actions");
      setTitle("");
      setDescription("");
      setScheduledAt(addDays(new Date(), 1));
    }
  }, [isOpen, issue]);

  if (!issue) return null;

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ id: issue.id, payload: { status: newStatus } }, {
      onSuccess: () => {
        toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
        onClose();
      }
    });
  };

  const handleCreateWorkOrder = () => {
    createWorkOrder.mutate({
      civicIssueId: issue.id,
      title,
      description,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : undefined,
    }, {
      onSuccess: () => {
        toast.success("Custom work order created successfully");
        onClose();
      }
    });
  };

  const handleAutoCreateWorkOrder = () => {
    createWorkOrder.mutate({
      civicIssueId: issue.id,
    }, {
      onSuccess: () => {
        toast.success("Work order auto-created successfully");
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-paper border-line" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            {view !== "actions" && (
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setView("actions")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {view === "actions" && `Manage Issue ${issue.issueNumber}`}
              {view === "status" && "Update Status"}
              {view === "custom-work-order" && "Custom Work Order"}
            </DialogTitle>
          </div>
          {view === "custom-work-order" && (
            <DialogDescription>
              Create a custom work order for issue {issue.issueNumber}.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {view === "actions" && (
          <div className="flex flex-col gap-3 py-4">
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 border border-line/40 hover:bg-ink/5" 
              onClick={() => setView("status")}
            >
              <RefreshCw className="mr-3 h-4 w-4 text-ink/60" />
              Update Status
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 border border-line/40 hover:bg-ink/5" 
              onClick={handleAutoCreateWorkOrder}
              disabled={issue.hasWorkOrder || createWorkOrder.isPending}
            >
              <RefreshCw className="mr-3 h-4 w-4 text-ink/60" />
              Auto Create Work Order
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 border border-line/40 hover:bg-ink/5" 
              onClick={() => setView("custom-work-order")}
              disabled={issue.hasWorkOrder || createWorkOrder.isPending}
            >
              <CalendarPlus className="mr-3 h-4 w-4 text-ink/60" />
              Custom Work Order
            </Button>
            <Button 
              variant="ghost" 
              asChild
              className="justify-start h-12 px-4 border border-line/40 hover:bg-ink/5" 
            >
              <Link href={`/track?issueNumber=${issue.issueNumber}`}>
                <History className="mr-3 h-4 w-4 text-ink/60" />
                View Full History
              </Link>
            </Button>
          </div>
        )}

        {view === "status" && (
          <div className="grid grid-cols-2 gap-2 py-4">
            {STATUSES.map((status) => (
              <Button
                key={status}
                variant={issue.status === status ? "primary" : "ghost"}
                className={cn(
                  "h-auto py-3 text-xs justify-start border border-line/40 hover:bg-ink/5",
                  issue.status === status && "pointer-events-none"
                )}
                onClick={() => handleStatusChange(status)}
                disabled={updateStatus.isPending}
              >
                {status.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        )}

        {view === "custom-work-order" && (
          <>
            <div className="space-y-4 py-4">
              <Field>
                <FieldLabel htmlFor="title">Work Order Title</FieldLabel>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="E.g., Repair Pothole"
                />
              </Field>
              
              <Field>
                <FieldLabel>Scheduled For (Optional)</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex h-11 w-full appearance-none rounded-xs border border-line bg-field px-3.5 py-2 font-body text-base text-ink justify-start text-left font-normal hover:bg-field hover:border-ink/45 focus-visible:border-ledger focus-visible:ring-2 focus-visible:ring-ledger/25 focus-visible:outline-none transition-[border-color,box-shadow,background-color] duration-150",
                        !scheduledAt && "text-ink/50"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {scheduledAt ? format(scheduledAt, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-line bg-paper shadow-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledAt}
                      onSelect={setScheduledAt}
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Task Description</FieldLabel>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Detailed description of the task..."
                />
              </Field>
            </div>
            
            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => setView("actions")}
              >
                Back
              </Button>
              <Button 
                onClick={handleCreateWorkOrder} 
                disabled={createWorkOrder.isPending || !title}
              >
                {createWorkOrder.isPending ? "Creating..." : "Create Work Order"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
