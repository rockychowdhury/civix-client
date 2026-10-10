"use client";

import { useForm } from "@tanstack/react-form";
import { Camera, CircleCheck, Clock, DollarSign, Loader2, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { uploadFieldAttachment } from "@/api/work-order.api";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitResolution } from "@/hooks/work-order.hook";
import type { WorkResolution } from "@/types";
import { resolutionFormSchema } from "@/validation";

interface UploadedPhoto {
  id: string;
  url: string;
}

/**
 * Resolution closer implementing POST /api/v1/resolutions:
 * Submits work completion, rootCause, notes, costIncurred, and photo proof for verification.
 */
export function ResolutionPanel({
  workOrderId,
  resolution,
}: {
  workOrderId: string;
  resolution?: WorkResolution | null;
}) {
  const mutation = useSubmitResolution();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [costIncurred, setCostIncurred] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const res = await uploadFieldAttachment(file, "VERIFICATION");
        if (res?.id && res?.url) {
          setPhotos((prev) => [...prev, { id: res.id, url: res.url }]);
        }
      }
      toast.success("Evidence photo uploaded");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const form = useForm({
    defaultValues: {
      rootCause: (resolution as any)?.rootCause || "",
      notes: (resolution as any)?.notes || resolution?.summary || "",
    },
    validators: { onSubmit: resolutionFormSchema as never },
    onSubmit: ({ value }) => {
      mutation.mutate(
        {
          workOrderId,
          rootCause: value.rootCause?.trim() || undefined,
          notes: value.notes.trim(),
          costIncurred: costIncurred ? Number.parseFloat(costIncurred) : undefined,
          attachmentIds: photos.map((p) => p.id),
        },
        {
          onSuccess: () => {
            toast.success("Resolution submitted — pending manager verification");
            form.reset();
            setPhotos([]);
            setCostIncurred("");
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
      <div className="flex items-start gap-3.5 border-l-4 border-signal-resolved p-4 rounded-xl bg-signal-resolved/5">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-signal-resolved" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="font-display text-sm font-semibold text-ink">
            Verified Complete & Signed Off
          </p>
          {(resolution as any)?.rootCause && (
            <p className="font-mono text-xs text-ink/60">
              Root Cause: {(resolution as any).rootCause}
            </p>
          )}
          <p className="font-body text-xs sm:text-sm leading-relaxed text-ink/75">
            {(resolution as any)?.notes || resolution.summary}
          </p>
        </div>
      </div>
    );
  }

  if (resolution && !resolution.rejectedAt) {
    return (
      <div className="flex items-start gap-3.5 border-l-4 border-signal-in-progress p-4 rounded-xl bg-signal-in-progress/5">
        <Clock className="mt-0.5 size-5 shrink-0 text-signal-in-progress" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="font-display text-sm font-semibold text-ink">
            Awaiting Manager Verification
          </p>
          {(resolution as any)?.rootCause && (
            <p className="font-mono text-xs text-ink/60">
              Root Cause: {(resolution as any).rootCause}
            </p>
          )}
          <p className="font-body text-xs sm:text-sm leading-relaxed text-ink/75">
            {(resolution as any)?.notes || resolution.summary}
          </p>
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
      className="flex flex-col gap-5"
    >
      {resolution?.rejectedAt ? (
        <div className="flex items-start gap-3.5 border-l-4 border-signal-open p-4 rounded-xl bg-signal-open/5">
          <RotateCcw className="mt-0.5 size-5 shrink-0 text-signal-open" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-display text-sm font-semibold text-ink">
              Verification Returned — Fix & Resubmit
            </p>
            <p className="font-body text-xs leading-relaxed text-ink/70">
              Department dispatch requested further fixes or evidence. Address the notes below to
              resubmit.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-base font-semibold text-ink">
            Log Job Resolution & Proof
          </h3>
          <p className="font-body text-xs text-ink/60">
            Submit field completion details, root cause, and evidence photos for department
            verification sign-off.
          </p>
        </div>
      )}

      {/* Root Cause Field */}
      <form.Field
        name="rootCause"
        children={(field) => {
          return (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-ink/70 uppercase tracking-wider font-display"
              >
                Root Cause (Optional)
              </FieldLabel>
              <Input
                id={field.name}
                placeholder="e.g. Pipe corrosion, storm debris, electrical surge..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-9 border-line/50 bg-field/30 rounded-lg text-xs font-body text-ink placeholder:text-ink/40"
              />
            </Field>
          );
        }}
      />

      {/* Resolution Notes Field */}
      <form.Field
        name="notes"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-ink/70 uppercase tracking-wider font-display"
              >
                Resolution Notes & Scope of Work <span className="text-signal-open">*</span>
              </FieldLabel>
              <Textarea
                id={field.name}
                placeholder="Detailed summary of repairs performed, materials installed, pressure/safety tests passed..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                className="min-h-24 resize-none border-line/50 bg-field/30 rounded-lg text-xs font-body text-ink placeholder:text-ink/40"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      {/* Cost Incurred Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="cost-incurred-input"
          className="text-xs font-medium text-ink/70 uppercase tracking-wider font-display block"
        >
          Actual Cost Incurred / Material Expenses (Optional)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40 pointer-events-none" />
          <Input
            id="cost-incurred-input"
            type="number"
            step="0.01"
            min="0"
            value={costIncurred}
            onChange={(e) => setCostIncurred(e.target.value)}
            placeholder="0.00"
            className="h-9 pl-8 text-xs bg-field/30 border-line/50 rounded-lg font-mono text-ink placeholder:text-ink/40"
          />
        </div>
      </div>

      {/* Evidence Photos Upload */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-ink/70 uppercase tracking-wider font-display block">
          Work Completion Evidence Photos (Optional)
        </span>

        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((p) => (
              <div
                key={p.id}
                className="relative size-16 rounded-lg overflow-hidden border border-line/60 group shadow-2xs"
              >
                <Image src={p.url} alt="Evidence photo" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  aria-label="Remove photo"
                  className="absolute top-1 right-1 size-6 rounded-full bg-ink/70 text-paper flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity cursor-pointer"
                  title="Remove photo"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center justify-center gap-2 h-14 border border-dashed border-line/70 rounded-xl bg-field/20 hover:bg-field/40 transition-colors cursor-pointer text-xs font-body text-ink/60">
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin text-ledger" />
              <span>Uploading evidence photo...</span>
            </>
          ) : (
            <>
              <Camera className="size-4 text-ink/40" />
              <span>Click to attach site completion photos</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <Button
        type="submit"
        loading={mutation.isPending}
        loadingText="Submitting resolution…"
        className="min-h-11 w-full cursor-pointer bg-ledger text-paper hover:bg-ledger/90 text-xs font-medium shadow-2xs"
      >
        {resolution?.rejectedAt ? "Resubmit Resolution" : "Submit Resolution for Verification"}
      </Button>
    </form>
  );
}
