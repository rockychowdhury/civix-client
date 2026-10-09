"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { WORK_UPDATE_TYPE_LABEL, WORK_UPDATE_TYPES } from "@/constant/technician.constant";
import { useSubmitWorkUpdate } from "@/hooks/work-order.hook";
import { cn } from "@/lib/utils";
import { workUpdateFormSchema } from "@/validation";

/**
 * Field-fast site log. Bottom sheet on mobile, centered on desktop —
 * one question, one action. Usable without opening the job page.
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

  const form = useForm({
    defaultValues: { updateType: "", notes: "" },
    validators: { onSubmit: workUpdateFormSchema as never },
    onSubmit: ({ value }) => {
      mutation.mutate(
        {
          id: workOrderId,
          payload: { updateType: value.updateType, notes: value.notes || undefined },
        },
        {
          onSuccess: () => {
            toast.success("Site log posted");
            form.reset();
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to post update"),
        },
      );
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="border-t border-line/40 bg-paper px-5 pt-6 pb-6 text-ink sm:mx-auto sm:mb-8 sm:max-w-md sm:rounded-xs sm:border"
      >
        <SheetHeader className="text-left">
          <p className="font-mono text-[0.6875rem] uppercase tracking-widest text-ink/45">
            Site log
          </p>
          <SheetTitle className="font-display text-lg font-medium text-ink">
            {jobTitle || "What happened?"}
          </SheetTitle>
        </SheetHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
          className="flex flex-col gap-4 pt-4"
        >
          <form.Field
            name="updateType"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-medium text-ink/55 uppercase tracking-wider font-display"
                  >
                    Status
                  </FieldLabel>
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {WORK_UPDATE_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => field.handleChange(t)}
                        className={cn(
                          "cursor-pointer rounded-xs px-2.5 py-1 text-xs font-medium transition-colors border",
                          field.state.value === t
                            ? "bg-ledger border-ledger text-paper shadow-xs"
                            : "bg-field/40 border-line/40 text-ink/70 hover:bg-field/70 hover:text-ink",
                        )}
                      >
                        {WORK_UPDATE_TYPE_LABEL[t]}
                      </button>
                    ))}
                  </div>
                  <Select
                    value={field.state.value || undefined}
                    onValueChange={(value) => field.handleChange(value)}
                    onOpenChange={(open) => {
                      if (!open) field.handleBlur();
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={isInvalid}
                      className="cursor-pointer"
                    >
                      <SelectValue placeholder="Or select from dropdown..." />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_UPDATE_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="cursor-pointer">
                          {WORK_UPDATE_TYPE_LABEL[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
          <form.Field
            name="notes"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-medium text-ink/55 uppercase tracking-wider font-display"
                  >
                    Notes{" "}
                    <span className="font-body font-normal normal-case tracking-normal text-ink/35">
                      — optional
                    </span>
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    placeholder="Anything dispatch should know…"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    className="min-h-20 resize-none border-line/20 bg-transparent text-[0.9375rem] placeholder:text-ink/35 focus-visible:border-ink/30"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
          <Button
            type="submit"
            loading={mutation.isPending}
            loadingText="Posting…"
            className="min-h-12 w-full cursor-pointer"
          >
            Post update
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
