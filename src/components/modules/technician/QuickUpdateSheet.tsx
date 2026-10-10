"use client";

import { useForm } from "@tanstack/react-form";
import { AlertCircle, Clock, MapPin, NotebookPen, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { WORK_UPDATE_TYPE_LABEL, WORK_UPDATE_TYPES } from "@/constant/technician.constant";
import { useSubmitWorkUpdate } from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import { workUpdateFormSchema } from "@/validation";

const UPDATE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ON_SITE: MapPin,
  PROGRESS: NotebookPen,
  BLOCKED: AlertCircle,
  DELAYED: Clock,
  PAUSED: Pause,
  RESUMED: Play,
};

/**
 * Clean field-fast site log modal.
 * Non-redundant status pills, sanitized title, clean notes and instant dispatch sync.
 */
export function QuickUpdateSheet({
  workOrderId,
  jobTitle,
  open,
  onOpenChange,
}: {
  workOrderId: string;
  jobTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useSubmitWorkUpdate();

  // Strip duplicate trailing "(ISS-...)" if issue number is already shown
  const rawTitle = jobTitle || "Job Update";
  const cleanTitle = rawTitle.replace(/\s*\([A-Z0-9-]+\)$/i, "").trim() || rawTitle;
  const issueMatch = rawTitle.match(/\(([A-Z0-9-]+)\)/i);
  const issueTag = issueMatch ? issueMatch[1] : null;

  const form = useForm({
    defaultValues: { updateType: "PROGRESS", notes: "" },
    validators: { onSubmit: workUpdateFormSchema as never },
    onSubmit: ({ value }) => {
      mutation.mutate(
        {
          id: workOrderId,
          payload: { updateType: value.updateType, notes: value.notes || undefined },
        },
        {
          onSuccess: () => {
            toast.success("Site log posted — dispatch notified");
            form.reset();
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to post update"),
        },
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-paper text-ink border border-line/70 rounded-xl p-6 shadow-lg">
        <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-line/40">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50 font-medium">
              Site Log
            </span>
            {issueTag ? (
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-xs bg-field/70 text-ink/80 border border-line/50 font-medium">
                #{issueTag}
              </span>
            ) : null}
          </div>
          <DialogTitle className="font-display text-lg font-semibold text-ink leading-snug">
            {cleanTitle}
          </DialogTitle>
          <DialogDescription className="font-body text-xs text-ink/65">
            Log real-time field progress, on-site arrival, or blockers for dispatch.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
          className="flex flex-col gap-5 pt-3"
        >
          {/* Status Selection: Clean interactive pills without redundant dropdown */}
          <form.Field
            name="updateType"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="space-y-2">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-mono font-medium text-ink/60 uppercase tracking-wider"
                  >
                    Select Status Update
                  </FieldLabel>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {WORK_UPDATE_TYPES.map((t) => {
                      const isSelected = field.state.value === t;
                      const Icon = UPDATE_TYPE_ICONS[t];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => field.handleChange(t)}
                          className={cn(
                            "flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer text-left active:translate-y-px",
                            isSelected
                              ? "bg-ledger text-paper border-ledger shadow-xs"
                              : "bg-paper text-ink/75 border-line/60 hover:bg-field/40 hover:text-ink hover:border-line",
                          )}
                        >
                          {Icon ? (
                            <Icon
                              className={cn(
                                "size-3.5 shrink-0",
                                isSelected ? "text-paper" : "text-ink/50",
                              )}
                              aria-hidden="true"
                            />
                          ) : null}
                          <span className="truncate">{WORK_UPDATE_TYPE_LABEL[t]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* Notes Input */}
          <form.Field
            name="notes"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="space-y-1.5">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-mono font-medium text-ink/60 uppercase tracking-wider flex items-center justify-between"
                  >
                    <span>Field Notes</span>
                    <span className="font-body text-[11px] text-ink/40 normal-case">Optional</span>
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    placeholder="Describe progress, parts needed, or blockers for dispatch…"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    className="min-h-24 resize-none rounded-lg border border-line/60 bg-field/15 text-xs text-ink placeholder:text-ink/40 focus-visible:border-ledger focus-visible:ring-1 focus-visible:ring-ledger p-3 leading-relaxed"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-line/30">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer h-9 px-4 text-xs bg-paper border border-line/60 text-ink/70 hover:text-ink hover:bg-field/40"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={mutation.isPending}
              loadingText="Posting…"
              className="cursor-pointer h-9 px-5 text-xs bg-ledger text-paper hover:bg-ledger/90 font-medium shadow-2xs"
            >
              Post update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
