import { addDays, format } from "date-fns";
import { CalendarIcon, CalendarPlus, CheckCircle, MoreHorizontal, RefreshCw } from "lucide-react";
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

export function CivicIssueActions({ issue }: { issue: CivicIssue }) {
  const updateStatus = useUpdateIssueStatus();
  const createWorkOrder = useCreateWorkOrder();

  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
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
          toast.success("Custom work order created successfully");
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
            <span>Custom Work Order</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isWorkOrderModalOpen} onOpenChange={setIsWorkOrderModalOpen}>
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
