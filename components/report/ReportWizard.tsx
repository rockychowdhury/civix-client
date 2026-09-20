"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ProgressRail } from "@/components/ui/progress-rail";
import { createServiceRequest, uploadAttachments, type ServiceRequestResponse } from "@/services/report.service";
import { type ICreateServiceRequestPayload, serviceRequestSchema } from "@/lib/validations/report";
import { useReportDraft } from "@/hooks/useReportDraft";
import { DraftResumeBanner } from "./DraftResumeBanner";
import { AttachmentsStep } from "./steps/AttachmentsStep";
import { CategoryStep, type ReportCategory } from "./steps/CategoryStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { DescriptionStep } from "./steps/DescriptionStep";
import { LocationStep } from "./steps/LocationStep";
import { ReviewStep } from "./steps/ReviewStep";

interface ReportWizardProps {
  categories: ReportCategory[];
}

const TOTAL_STEPS = 5;

export function ReportWizard({ categories }: ReportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResponse, setSubmissionResponse] = useState<ServiceRequestResponse | null>(null);
  const [attachmentStatus, setAttachmentStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const { hasDraft, saveDraft, loadDraft, clearDraft } = useReportDraft();
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const form = useForm<ICreateServiceRequestPayload>({
    resolver: zodResolver(serviceRequestSchema),
    mode: "onBlur",
    defaultValues: {
      description: "",
      location: {},
    },
  });

  // Handle draft check on mount
  useEffect(() => {
    if (hasDraft) {
      setShowDraftBanner(true);
    }
  }, [hasDraft]);

  // Debounced autosave
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Don't save if we're done
      if (submissionResponse) return;

      const timeoutId = setTimeout(() => {
        saveDraft(value as Partial<ICreateServiceRequestPayload>);
      }, 800);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form, saveDraft, submissionResponse]);

  const handleResumeDraft = () => {
    const draft = loadDraft();
    if (draft) {
      form.reset(draft as any);

      // Attempt to guess current step based on what's filled
      if (draft.location?.address || draft.location?.latitude) setCurrentStep(3);
      else if (draft.description) setCurrentStep(2);
      else if (draft.categoryId) setCurrentStep(1);
    }
    setShowDraftBanner(false);
  };

  const handleClearDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
  };

  // Step advancement with validation
  const nextStep = async () => {
    let isValid = false;

    if (currentStep === 0) {
      isValid = await form.trigger("categoryId");
    } else if (currentStep === 1) {
      isValid = await form.trigger("description");
    } else if (currentStep === 2) {
      isValid = await form.trigger("location");
    } else if (currentStep === 3) {
      isValid = true; // Attachments are optional and validated client-side onChange
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const jumpToStep = (index: number) => {
    setCurrentStep(index);
  };

  const onSubmit = async (data: ICreateServiceRequestPayload) => {
    try {
      setIsSubmitting(true);

      // Step 1: Create request
      const response = await createServiceRequest(data);
      setSubmissionResponse(response);
      setCurrentStep(5); // Move to confirmation
      clearDraft();

      // Step 2: Upload attachments if any
      if (files.length > 0) {
        setAttachmentStatus("uploading");
        try {
          await uploadAttachments(response.id, files);
          setAttachmentStatus("success");
        } catch (error) {
          setAttachmentStatus("error");
        }
      } else {
        setAttachmentStatus("success");
      }
    } catch (error) {
      // In a real app, toast this error
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const retryAttachments = async () => {
    if (!submissionResponse || files.length === 0) return;
    setAttachmentStatus("uploading");
    try {
      await uploadAttachments(submissionResponse.id, files);
      setAttachmentStatus("success");
    } catch (error) {
      setAttachmentStatus("error");
    }
  };

  const resetFlow = () => {
    form.reset({
      categoryId: undefined,
      description: "",
      location: {},
    });
    setFiles([]);
    setSubmissionResponse(null);
    setAttachmentStatus("idle");
    setCurrentStep(0);
  };

  // Selected category for dynamic placeholders and summary
  const selectedCategoryId = form.watch("categoryId");
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="mx-auto max-w-2xl w-full">
      {showDraftBanner && currentStep === 0 && (
        <DraftResumeBanner onResume={handleResumeDraft} onClear={handleClearDraft} />
      )}

      {currentStep < 5 && (
        <ProgressRail currentStep={currentStep + 1} totalSteps={TOTAL_STEPS} className="mb-8" />
      )}

      <div className="bg-paper min-h-[400px]">
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink">What's wrong?</h2>
            <CategoryStep
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelect={(id) => {
                form.setValue("categoryId", id);
                form.clearErrors("categoryId");
                // Auto-advance
                setTimeout(() => nextStep(), 150);
              }}
            />
            {form.formState.errors.categoryId && (
              <p className="text-sm font-medium text-red-500 mt-2">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink">Tell us what happened</h2>
            <DescriptionStep form={form} selectedCategory={selectedCategory} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink">Where is this?</h2>
            <LocationStep form={form} />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink">Add photos (Optional)</h2>
            <AttachmentsStep files={files} onChange={setFiles} onSkip={() => nextStep()} />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink">Review & Submit</h2>
            <ReviewStep
              form={form}
              selectedCategory={selectedCategory}
              files={files}
              onEditStep={jumpToStep}
            />
          </div>
        )}

        {currentStep === 5 && (
          <ConfirmationStep
            response={submissionResponse}
            attachmentStatus={attachmentStatus}
            onRetryAttachments={retryAttachments}
            onReset={resetFlow}
          />
        )}
      </div>

      {/* Navigation footer for steps 1 to 4 */}
      {currentStep > 0 && currentStep < 5 && (
        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <Button variant="secondary" onClick={prevStep} type="button">
            Back
          </Button>

          {currentStep < 4 ? (
            <Button onClick={nextStep} type="button">
              Next step
            </Button>
          ) : (
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              size="lg"
              className="min-w-[140px]"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
