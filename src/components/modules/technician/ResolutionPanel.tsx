"use client";

import { useForm } from "@tanstack/react-form";
import { CircleCheck, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitResolution } from "@/hooks/work-order.hook";
import type { WorkResolution } from "@/types";
import { resolutionFormSchema } from "@/validation";

/**
 * Resolution closer. Posts {summary} (min 10 chars) — the only shape the
 * backend accepts — and narrates pending / bounced / verified states.
 */
export function ResolutionPanel({
  workOrderId,
  resolution,
}: {
  workOrderId: string;
  resolution?: WorkResolution | null;
}) {
  const mutation = useSubmitResolution();

  const form = useForm({
    defaultValues: { summary: "" },
    validators: { onSubmit: resolutionFormSchema },
    onSubmit: ({ value }) => {
      mutation.mutate(
        { id: workOrderId, payload: { summary: value.summary } },
        {
          onSuccess: () => {
            toast.success("Resolution submitted — pending verification");
            form.reset();
          },
          onError: (error: unknown) => {
            const message =
              (error as { data?: { message?: string } })?.data?.message ||
              "Failed to submit resolution";
            toast.error(message);
          },
        },
      );
    },
  });

  if (resolution?.approvedAt) {
    return (
      <div className="flex items-start gap-3 border-l-2 border-signal-resolved py-1 pl-5">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-signal-resolved" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="font-display text-sm font-medium text-ink">Verified complete</p>
          <p className="font-body text-sm leading-relaxed text-ink/70">{resolution.summary}</p>
        </div>
      </div>
    );
  }

  if (resolution && !resolution.rejectedAt) {
    return (
      <div className="flex items-start gap-3 border-l-2 border-signal-progress py-1 pl-5">
        <Clock className="mt-0.5 size-5 shrink-0 text-signal-progress" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="font-display text-sm font-medium text-ink">Awaiting verification</p>
          <p className="font-body text-sm leading-relaxed text-ink/70">{resolution.summary}</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      className="flex flex-col gap-4"
    >
      {resolution?.rejectedAt ? (
        <div className="flex items-start gap-3 border-l-2 border-signal-open py-1 pl-5">
          <RotateCcw className="mt-0.5 size-5 shrink-0 text-signal-open" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-display text-sm font-medium text-ink">
              Sent back — fix and resubmit
            </p>
            <p className="font-body text-sm leading-relaxed text-ink/70">
              The reviewer bounced this. Address it below to reopen verification.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-base font-medium text-ink">Close the job</h3>
          <p className="font-body text-sm text-ink/60">
            Final summary of the fix. Dispatch verifies it from here.
          </p>
        </div>
      )}
      <form.Field
        name="summary"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-ink/70 uppercase tracking-wider font-display"
              >
                What was fixed
              </FieldLabel>
              <Textarea
                id={field.name}
                placeholder="Replaced the burst joint and pressure-tested the line…"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                className="min-h-24 resize-none border-line/20 bg-field/50"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />
      <Button
        type="submit"
        loading={mutation.isPending}
        loadingText="Submitting…"
        className="min-h-12 w-full cursor-pointer"
      >
        {resolution?.rejectedAt ? "Resubmit resolution" : "Submit resolution"}
      </Button>
    </form>
  );
}
