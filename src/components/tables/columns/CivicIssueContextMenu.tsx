import { addDays, format } from "date-fns";
import { CalendarIcon, CalendarPlus, CheckCircle, Eye, History, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

interface CivicIssueContextMenuProps {
  issue: CivicIssue | null;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onViewDetails?: () => void;
}

export function CivicIssueContextMenu({
  issue,
  isOpen,
  onClose,
  position,
  onViewDetails,
}: CivicIssueContextMenuProps) {
  const updateStatus = useUpdateIssueStatus();
  const createWorkOrder = useCreateWorkOrder();

  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(addDays(new Date(), 1));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          setIsWorkOrderModalOpen(false);
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

  const openWorkOrderModal = () => {
    setTitle("");
    setDescription("");
    setScheduledAt(addDays(new Date(), 1));
    setIsWorkOrderModalOpen(true);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={(open) => !open && onClose()} modal={false}>
        {mounted && typeof document !== "undefined"
          ? createPortal(
              <DropdownMenuTrigger asChild>
                <div
                  className="fixed z-50 pointer-events-none"
                  style={{
                    left: position.x,
                    top: position.y,
                    width: 1,
                    height: 1,
                  }}
                />
              </DropdownMenuTrigger>,
              document.body,
            )
          : null}
        <DropdownMenuContent
          align="start"
          sideOffset={5}
          collisionPadding={10}
          className="w-56"
          onCloseAutoFocus={(e) => {
            // Prevent focus stealing when we transition to Dialog
            if (isWorkOrderModalOpen) {
              e.preventDefault();
            }
          }}
        >
          <DropdownMenuLabel>Issue #{issue.issueNumber}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              onClose();
              onViewDetails?.();
            }}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>View Issue Details</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Update Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              {STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={updateStatus.isPending || issue.status === status}
                  className="cursor-pointer"
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
            onClick={handleAutoCreateWorkOrder}
            disabled={issue.hasWorkOrder || createWorkOrder.isPending}
            className="cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Auto Create Work Order</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={openWorkOrderModal}
            disabled={issue.hasWorkOrder || createWorkOrder.isPending}
            className="cursor-pointer"
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            <span>Create Work Order</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/track?issueNumber=${issue.issueNumber}`} className="w-full">
              <History className="mr-2 h-4 w-4" />
              <span>View Full History</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isWorkOrderModalOpen}
        onOpenChange={(open) => {
          setIsWorkOrderModalOpen(open);
          if (!open) {
            setIsCalendarOpen(false);
            onClose();
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
              <label htmlFor="wo-title-ctx" className="text-xs font-medium text-ink block">
                Work Order Title <span className="text-signal-open">*</span>
              </label>
              <Input
                id="wo-title-ctx"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Repair Pothole"
                className="h-9 text-xs bg-field/30 hover:bg-field/50 border-line/40 rounded-md focus-visible:ring-1 focus-visible:ring-ledger font-body text-ink placeholder:text-ink/40"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="wo-date-ctx" className="text-xs font-medium text-ink">
                  Scheduled For
                </label>
                <span className="text-[10px] font-mono text-ink/40">Optional</span>
              </div>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="wo-date-ctx"
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
              <label htmlFor="wo-description-ctx" className="text-xs font-medium text-ink block">
                Task Description
              </label>
              <Textarea
                id="wo-description-ctx"
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
