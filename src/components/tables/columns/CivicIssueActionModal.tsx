import { addDays, format } from "date-fns";
import { ArrowLeft, CalendarIcon, CalendarPlus, History, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateIssueStatus } from "@/hooks/issue.hook";
import { useCreateWorkOrder } from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import type { CivicIssue } from "@/types";

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setView("actions");
      setTitle("");
      setDescription("");
      setScheduledAt(addDays(new Date(), 1));
      setIsCalendarOpen(false);
    }
  }, [isOpen, issue]);

  if (!issue) return null;

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(
      { id: issue.id, payload: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
          onClose();
        },
      },
    );
  };

  const handleCreateWorkOrder = () => {
    createWorkOrder.mutate(
      {
        civicIssueId: issue.id,
        title,
        description,
        scheduledAt: scheduledAt ? scheduledAt.toISOString() : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Work order created successfully");
          onClose();
        },
      },
    );
  };

  const handleAutoCreateWorkOrder = () => {
    createWorkOrder.mutate(
      {
        civicIssueId: issue.id,
      },
      {
        onSuccess: () => {
          toast.success("Work order auto-created successfully");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-paper border border-line/60 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            {view !== "actions" && (
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 cursor-pointer"
                onClick={() => setView("actions")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {view === "actions" && `Manage Issue ${issue.issueNumber}`}
              {view === "status" && "Update Status"}
              {view === "custom-work-order" && "Create Work Order"}
            </DialogTitle>
          </div>
          {view === "custom-work-order" && (
            <DialogDescription className="text-xs text-ink/60">
              Create a work order for issue {issue.issueNumber}.
            </DialogDescription>
          )}
        </DialogHeader>

        {view === "actions" && (
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="ghost"
              className="justify-start h-12 px-4 border border-line/40 hover:bg-ink/5 cursor-pointer"
              onClick={() => setView("status")}
            >
              <RefreshCw className="mr-3 h-4 w-4 text-ink/60" />
              Update Status
            </Button>
            <Button
              variant="ghost"
              className="justify-start h-12 px-4 border border-line/40 hover:bg-ink/5 cursor-pointer"
              onClick={handleAutoCreateWorkOrder}
              disabled={issue.hasWorkOrder || createWorkOrder.isPending}
            >
              <RefreshCw className="mr-3 h-4 w-4 text-ink/60" />
              Auto Create Work Order
            </Button>
            <Button
              variant="ghost"
              className="justify-start h-12 px-4 border border-line/40 hover:bg-ink/5 cursor-pointer"
              onClick={() => setView("custom-work-order")}
              disabled={issue.hasWorkOrder || createWorkOrder.isPending}
            >
              <CalendarPlus className="mr-3 h-4 w-4 text-ink/60" />
              Create Work Order
            </Button>
            <Button
              variant="ghost"
              asChild
              className="justify-start h-12 px-4 border border-line/40 hover:bg-ink/5 cursor-pointer"
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
                  "h-auto py-3 text-xs justify-start border border-line/40 hover:bg-ink/5 cursor-pointer",
                  issue.status === status && "pointer-events-none",
                )}
                onClick={() => handleStatusChange(status)}
                disabled={updateStatus.isPending}
              >
                {status.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        )}

        {view === "custom-work-order" && (
          <>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label htmlFor="modal-wo-title" className="text-xs font-medium text-ink block">
                  Work Order Title <span className="text-signal-open">*</span>
                </label>
                <Input
                  id="modal-wo-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Repair Pothole"
                  className="h-9 text-xs bg-field/30 hover:bg-field/50 border-line/40 rounded-md focus-visible:ring-1 focus-visible:ring-ledger font-body text-ink placeholder:text-ink/40"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="modal-wo-date" className="text-xs font-medium text-ink">
                    Scheduled For
                  </label>
                  <span className="text-[10px] font-mono text-ink/40">Optional</span>
                </div>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="modal-wo-date"
                      type="button"
                      variant="ghost"
                      className={cn(
                        "flex h-9 w-full rounded-md border border-line/40 bg-field/30 hover:bg-field/50 px-3 py-2 font-body text-xs text-ink justify-start text-left font-normal cursor-pointer focus-visible:ring-1 focus-visible:ring-ledger",
                        !scheduledAt && "text-ink/40",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-ink/40 shrink-0" />
                      <span className="flex-1 truncate">
                        {scheduledAt ? format(scheduledAt, "PPP") : "Pick a date"}
                      </span>
                      {scheduledAt && (
                        <span
                          role="none"
                          className="p-0.5 rounded-xs hover:bg-ink/10 text-ink/40 hover:text-ink cursor-pointer ml-1 inline-flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setScheduledAt(undefined);
                          }}
                        >
                          <X className="size-3" />
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border border-line/40 bg-paper shadow-xl z-[70]"
                    align="start"
                    onInteractOutside={() => setIsCalendarOpen(false)}
                  >
                    <Calendar
                      mode="single"
                      selected={scheduledAt}
                      onSelect={(date) => {
                        setScheduledAt(date);
                        setIsCalendarOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="modal-wo-description"
                  className="text-xs font-medium text-ink block"
                >
                  Task Description
                </label>
                <Textarea
                  id="modal-wo-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detailed description of the task..."
                  className="min-h-[85px] text-xs bg-field/30 hover:bg-field/50 border-line/40 rounded-md focus-visible:ring-1 focus-visible:ring-ledger font-body text-ink placeholder:text-ink/40 p-3 leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2 border-t border-line/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("actions")}
                className="h-8 text-xs text-ink/60 hover:text-ink cursor-pointer"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleCreateWorkOrder}
                disabled={createWorkOrder.isPending || !title.trim()}
                className="h-8 text-xs font-medium bg-ledger text-paper hover:bg-ledger/90 shadow-2xs cursor-pointer px-4"
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
