"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** Destructive-confirm dialog with theme tokens and bottom-right toasts untouched. */
export function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-line bg-paper">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-ink">{title}</AlertDialogTitle>
          <AlertDialogDescription className="font-body leading-relaxed text-ink/65">
            {body}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={pending}
            className="cursor-pointer bg-signal-open text-paper hover:bg-signal-open/90"
          >
            {pending ? "Working…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
