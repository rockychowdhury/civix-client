import { addDays, format } from "date-fns";
import { CalendarIcon, CalendarPlus, CheckCircle, Eye, History, RefreshCw } from "lucide-react";
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
import { Field, FieldLabel } from "@/components/ui/field";
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
          toast.success("Custom work order created successfully");
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
            <span>Custom Work Order</span>
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
          if (!open) onClose();
        }}
      >
        <DialogContent
          className="sm:max-w-md bg-paper border-line"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Custom Work Order</DialogTitle>
            <DialogDescription>
              Create a custom work order for issue {issue.issueNumber}.
            </DialogDescription>
          </DialogHeader>

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
                      !scheduledAt && "text-ink/50",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {scheduledAt ? format(scheduledAt, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-line bg-paper shadow-xl" align="start">
                  <Calendar mode="single" selected={scheduledAt} onSelect={setScheduledAt} />
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
            <Button variant="ghost" onClick={() => setIsWorkOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkOrder} disabled={createWorkOrder.isPending || !title}>
              {createWorkOrder.isPending ? "Creating..." : "Create Work Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
