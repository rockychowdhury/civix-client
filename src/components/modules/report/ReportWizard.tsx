"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProgressRail } from "@/components/ui/progress-rail";
import { useReportDraft } from "@/hooks/useReportDraft";
import { type ICreateServiceRequestPayload, serviceRequestSchema } from "@/validation";
import {
  createServiceRequest,
  type ServiceRequestResponse,
  uploadAttachments,
} from "@/api/report.api";
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
  const [draftContext, setDraftContext] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      categoryId: undefined as unknown as string,
      description: "",
      location: {},
    } as unknown as ICreateServiceRequestPayload,
    validators: {
      onChange: serviceRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);

        // Step 1: Create request
        const response = await createServiceRequest(value);
        setSubmissionResponse(response);
        setCurrentStep(5); // Move to confirmation
        clearDraft();

        // Step 2: Upload attachments if any
        if (files.length > 0) {
          setAttachmentStatus("uploading");
          try {
            await uploadAttachments(response.id, files);
            setAttachmentStatus("success");
          } catch (_error) {
            setAttachmentStatus("error");
          }
        } else {
          setAttachmentStatus("success");
        }
      } catch (_error) {
        toast.error("Failed to submit report. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Handle draft check on mount
  useEffect(() => {
    if (hasDraft) {
      const draft = loadDraft();
      if (draft) {
        const category = categories.find((c) => c.id === draft.categoryId);
        const subject =
          draft.location?.address?.trim() ||
          draft.description?.trim().split("\n")[0]?.trim().slice(0, 48);

        if (category?.name && subject) {
          setDraftContext(
            `You were reporting ${category.name.toLowerCase()} — ${subject}${
              subject.length >= 48 ? "…" : ""
            }.`,
          );
        } else if (category?.name) {
          setDraftContext(`You were reporting a ${category.name.toLowerCase()} issue.`);
        } else if (subject) {
          setDraftContext(`You were telling us about "${subject}…".`);
        } else {
          setDraftContext("You have an unsaved report in progress.");
        }
      }
      setShowDraftBanner(true);
    }
  }, [hasDraft, categories, loadDraft]);

  // Debounced autosave using store subscription
  useEffect(() => {
    const subscription = form.store.subscribe(() => {
      if (submissionResponse) return;
      const values = form.state.values;
      const timeoutId = setTimeout(() => {
        saveDraft(values as Partial<ICreateServiceRequestPayload>);
      }, 800);
      return () => clearTimeout(timeoutId);
    });
    return () => {
      if (typeof subscription === 'function') {
        (subscription as any)();
      } else if (subscription && typeof (subscription as any).unsubscribe === 'function') {
        (subscription as any).unsubscribe();
      }
    };
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

  const nextStep = async () => {
    // Basic validation logic for Tanstack Form steps
    let isValid = false;

    if (currentStep === 0) {
      const field = form.getFieldMeta("categoryId");
      isValid = !!form.state.values.categoryId && !field?.errors?.length;
    } else if (currentStep === 1) {
      await form.validateAllFields("change");
      const field = form.getFieldMeta("description");
      isValid = !!form.state.values.description && !field?.errors?.length;
    } else if (currentStep === 2) {
      await form.validateAllFields("change");
      const field = form.getFieldMeta("location");
      isValid = !field?.errors?.length;
    } else if (currentStep === 3) {
      isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
    } else {
      // Show errors if next is clicked but invalid
      await form.validateAllFields("change");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const jumpToStep = (index: number) => {
    setCurrentStep(index);
  };

  const retryAttachments = async () => {
    if (!submissionResponse || files.length === 0) return;
    setAttachmentStatus("uploading");
    try {
      await uploadAttachments(submissionResponse.id, files);
      setAttachmentStatus("success");
    } catch (_error) {
      setAttachmentStatus("error");
    }
  };

  const resetFlow = () => {
    form.reset({
      categoryId: undefined,
      description: "",
      location: {},
    } as any);
    setFiles([]);
    setSubmissionResponse(null);
    setAttachmentStatus("idle");
    setCurrentStep(0);
  };

  return (
    <div className="mx-auto max-w-2xl w-full">
      {showDraftBanner && currentStep === 0 && (
        <DraftResumeBanner
          context={draftContext}
          onResume={handleResumeDraft}
          onClear={handleClearDraft}
        />
      )}

      {currentStep < 5 && (
        <ProgressRail currentStep={currentStep + 1} totalSteps={TOTAL_STEPS} className="mb-8" />
      )}

      <form.Subscribe
        selector={(state) => [state.values.categoryId]}
        children={([selectedCategoryId]) => {
          const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

          return (
            <div className="bg-paper min-h-[400px]">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl text-ink">What's wrong?</h2>
                  <CategoryStep
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelect={(id) => {
                      form.setFieldValue("categoryId", id);
                      // Auto-advance
                      setTimeout(() => nextStep(), 150);
                    }}
                  />
                  <form.Field
                    name="categoryId"
                    children={(field) =>
                      field.state.meta.errors.length > 0 ? (
                        <p className="text-sm font-medium text-red-500 mt-2">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      ) : null
                    }
                  />
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
          );
        }}
      />

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
            <form.Subscribe
              selector={(state) => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  disabled={isSubmitting || isSubmitting}
                  size="lg"
                  className="min-w-[140px]"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
