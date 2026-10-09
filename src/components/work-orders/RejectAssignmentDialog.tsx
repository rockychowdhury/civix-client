"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderTitle?: string;
  onConfirm: (reason: string) => void;
  isPending?: boolean;
}

const COMMON_REASONS = [
  "Workload at capacity",
  "Specialized tools or parts unavailable",
  "Outside assigned service zone",
  "Safety hazard or inaccessible location",
];

export function RejectAssignmentDialog({
  open,
  onOpenChange,
  workOrderTitle,
  onConfirm,
  isPending = false,
}: RejectAssignmentDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const handleConfirm = () => {
    const finalReason = customReason.trim()
      ? selectedReason
        ? `${selectedReason}: ${customReason.trim()}`
        : customReason.trim()
      : selectedReason || "Declined by technician";
    onConfirm(finalReason);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedReason("");
      setCustomReason("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-paper text-ink border-line">
        <DialogHeader>
          <div className="flex items-center gap-2 text-signal-open">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle className="font-display text-lg text-ink">Reject Work Order</DialogTitle>
          </div>
          <DialogDescription className="text-ink/70 text-sm">
            {workOrderTitle
              ? `Provide a reason for declining assignment for "${workOrderTitle}". This will notify dispatchers to reassign.`
              : "Provide a reason for declining this assignment. This will notify dispatchers to reassign."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-ink/70 uppercase tracking-wider block">
              Common Reasons
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {COMMON_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(isSelected ? "" : reason)}
                    className={`text-left px-3 py-2 text-xs rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? "border-signal-open bg-signal-open/10 text-signal-open font-medium"
                        : "border-line/40 bg-field/30 text-ink/80 hover:bg-field/60"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="reject-details"
              className="text-xs font-semibold text-ink/70 uppercase tracking-wider block"
            >
              Additional Details (Optional)
            </label>
            <Textarea
              id="reject-details"
              placeholder="Explain any specifics to assist the dispatcher..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="min-h-[80px] text-xs resize-none border-line focus-visible:ring-signal-open bg-paper"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={isPending}
            className="cursor-pointer text-ink/70 hover:text-ink hover:bg-ink/5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="cursor-pointer bg-signal-open hover:bg-signal-open/90 text-white font-medium text-xs tracking-wider uppercase h-9 px-4"
          >
            {isPending ? "Rejecting..." : "Confirm Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
