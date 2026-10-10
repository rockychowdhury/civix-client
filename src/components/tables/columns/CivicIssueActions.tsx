import { addDays, format } from "date-fns";
import {
  CalendarIcon,
  CalendarPlus,
  CheckCircle,
  MoreHorizontal,
  RefreshCw,
  X,
} from "lucide-react";
import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function CivicIssueActions({ issue }: { issue: CivicIssue }) {
  const updateStatus = useUpdateIssueStatus();
  const createWorkOrder = useCreateWorkOrder();

  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(addDays(new Date(), 1));

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(
      { id: issue.id, payload: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
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
          setIsWorkOrderModalOpen(false);
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
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 border-0 hover:bg-ink/5 cursor-pointer focus-visible:outline-none focus-visible:ring-0"
            onClick={(e) => {
              const row = e.currentTarget.closest("tr");
              if (row) row.click();
            }}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Update Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-[200px]">
              {STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(status);
                  }}
                  disabled={updateStatus.isPending || issue.status === status}
                >
                  {status.replace(/_/g, " ")}
                  {issue.status === status && (
                    <CheckCircle className="ml-auto h-4 w-4 opacity-50" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleAutoCreateWorkOrder();
            }}
            disabled={issue.hasWorkOrder || createWorkOrder.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Auto Create Work Order</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsWorkOrderModalOpen(true);
            }}
            disabled={issue.hasWorkOrder || createWorkOrder.isPending}
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            <span>Create Work Order</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isWorkOrderModalOpen}
        onOpenChange={(open) => {
          setIsWorkOrderModalOpen(open);
          if (!open) {
            setIsCalendarOpen(false);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md bg-paper border border-line/40 rounded-lg p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="text-left space-y-1 pb-1 border-b border-line/30">
            <DialogTitle className="font-display text-lg font-semibold text-ink tracking-tight">
              Create Work Order
            </DialogTitle>
            <DialogDescription className="text-xs text-ink/60 font-body">
              Create an actionable work order for issue {issue.issueNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label htmlFor="wo-title-act" className="text-xs font-medium text-ink block">
                Work Order Title <span className="text-signal-open">*</span>
              </label>
              <Input
                id="wo-title-act"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Repair Pothole"
                className="h-9 text-xs bg-field/30 hover:bg-field/50 border-line/40 rounded-md focus-visible:ring-1 focus-visible:ring-ledger font-body text-ink placeholder:text-ink/40"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="wo-date-act" className="text-xs font-medium text-ink">
                  Scheduled For
                </label>
                <span className="text-[10px] font-mono text-ink/40">Optional</span>
              </div>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="wo-date-act"
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
              <label htmlFor="wo-description-act" className="text-xs font-medium text-ink block">
                Task Description
              </label>
              <Textarea
                id="wo-description-act"
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
              onClick={() => setIsWorkOrderModalOpen(false)}
              className="h-8 text-xs text-ink/60 hover:text-ink cursor-pointer"
            >
              Cancel
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
        </DialogContent>
      </Dialog>
    </>
  );
}
