"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFlagServiceRequestInvalid } from "@/hooks";

interface FlagInvalidFormProps {
  requestId: string;
  onSuccess?: () => void;
}

export function FlagInvalidForm({ requestId, onSuccess }: FlagInvalidFormProps) {
  const [reason, setReason] = useState("");
  const { mutate, isPending } = useFlagServiceRequestInvalid();

  const handleFlag = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    mutate(
      { id: requestId, reason },
      {
        onSuccess: () => {
          toast.success("Request flagged as invalid.");
          onSuccess?.();
        },
        onError: () => {
          toast.error("Failed to flag request.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-line rounded-md bg-paper">
      <h4 className="font-display font-medium text-signal-open">Flag as Invalid</h4>
      <p className="text-sm text-ink/70">
        Mark this request as spam or invalid. It will not be routed to a department.
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="secondary"
            className="w-fit text-signal-open border border-signal-open/30 hover:bg-signal-open hover:text-white transition-colors cursor-pointer"
          >
            Flag Request
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-line bg-paper">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-ink">
              Flag Request as Invalid
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink/70">
              Please provide a short reason for flagging this request. This action is destructive
              and removes it from the operational queue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g. Spam, duplicate, or irrelevant..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none h-20"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFlag}
              disabled={isPending || !reason.trim()}
              className="bg-signal-open hover:bg-signal-open/90 text-white font-body cursor-pointer"
            >
              {isPending ? "Flagging..." : "Confirm Flag"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
