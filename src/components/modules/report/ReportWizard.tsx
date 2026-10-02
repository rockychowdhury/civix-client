"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createServiceRequest, uploadAttachments } from "@/api/report.api";
import { Button } from "@/components/ui/button";
import { ProgressRail } from "@/components/ui/progress-rail";
import { useGetCategories } from "@/hooks/category.hook";
import { useReportDraft } from "@/hooks/useReportDraft";
import type { ServiceRequestResponse } from "@/types";
import { type ICreateServiceRequestPayload, serviceRequestSchema } from "@/validation";
import { DraftResumeBanner } from "./DraftResumeBanner";
import { AttachmentsStep } from "./steps/AttachmentsStep";
import { CategoryStep, type ReportCategory } from "./steps/CategoryStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { DescriptionStep } from "./steps/DescriptionStep";
import { LocationStep } from "./steps/LocationStep";
import { ReviewStep } from "./steps/ReviewStep";

interface ReportWizardProps {
  categories?: ReportCategory[];
}

const TOTAL_STEPS = 5;

export function ReportWizard({ categories: initialCategories = [] }: ReportWizardProps) {
  const { data: categoryData, isLoading: isCategoriesLoading } = useGetCategories();
  const categories = categoryData?.data || initialCategories;

  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [submissionResponse, setSubmissionResponse] = useState<ServiceRequestResponse | null>(null);
  const [attachmentStatus, setAttachmentStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const { hasDraft, saveDraft, loadDraft, clearDraft } = useReportDraft();
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [isDraftChecked, setIsDraftChecked] = useState(false);
  const [draftContext, setDraftContext] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      request: {
        categoryId: undefined as unknown as string,
        description: "",
      },
      location: {
        address: "",
        municipalityId: undefined as unknown as string,
      },
    } as unknown as ICreateServiceRequestPayload,
    validators: {
      onChange: serviceRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmittingLocal(true);

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
        setIsSubmittingLocal(false);
      }
    },
  });

  // Handle draft check on mount
  useEffect(() => {
    if (hasDraft) {
      const draftState = loadDraft();
      if (draftState?.values) {
        const draft = draftState.values;
        const category = categories.find((c) => c.id === draft.request?.categoryId);
        const subject =
          draft.location?.address?.trim() ||
          draft.request?.description?.trim().split("\n")[0]?.trim().slice(0, 48);

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
    setIsDraftChecked(true);
  }, [hasDraft, categories, loadDraft]);

  // Debounced autosave using store subscription
  useEffect(() => {
    if (!isDraftChecked) return;
    const subscription = form.store.subscribe(() => {
      if (submissionResponse || showDraftBanner) return;
      const values = form.state.values;
      const timeoutId = setTimeout(() => {
        saveDraft(values as Partial<ICreateServiceRequestPayload>, currentStep);
      }, 800);
      return () => clearTimeout(timeoutId);
    });
    return () => {
      if (typeof subscription === "function") {
        (subscription as any)();
      } else if (subscription && typeof (subscription as any).unsubscribe === "function") {
        (subscription as any).unsubscribe();
      }
    };
  }, [form, saveDraft, submissionResponse, currentStep, showDraftBanner, isDraftChecked]);

  const handleResumeDraft = () => {
    const draftState = loadDraft();
    if (draftState?.values) {
      const draft = draftState.values;
      if (draft.request) {
        if (draft.request.categoryId)
          form.setFieldValue("request.categoryId" as any, draft.request.categoryId);
        if (draft.request.description)
          form.setFieldValue("request.description" as any, draft.request.description);
      }
      if (draft.location) {
        if (draft.location.address)
          form.setFieldValue("location.address" as any, draft.location.address);
        if (draft.location.municipalityId)
          form.setFieldValue("location.municipalityId" as any, draft.location.municipalityId);
        if (draft.location.zoneId)
          form.setFieldValue("location.zoneId" as any, draft.location.zoneId);
        if (draft.location.wardId)
          form.setFieldValue("location.wardId" as any, draft.location.wardId);
        if (draft.location.latitude)
          form.setFieldValue("location.latitude" as any, draft.location.latitude);
        if (draft.location.longitude)
          form.setFieldValue("location.longitude" as any, draft.location.longitude);
        if (draft.location.landmark)
          form.setFieldValue("location.landmark" as any, draft.location.landmark);
        if (draft.location.postalCode)
          form.setFieldValue("location.postalCode" as any, draft.location.postalCode);
      }

      // Resume exactly where they left off
      if (typeof draftState.step === "number") {
        setCurrentStep(draftState.step);
      }
    }
    setShowDraftBanner(false);
  };

  const handleClearDraft = () => {
    clearDraft();
    resetFlow();
    setShowDraftBanner(false);
  };

  const nextStep = async () => {
    // Basic validation logic for Tanstack Form steps
    let isValid = false;

    if (currentStep === 0) {
      const field = form.getFieldMeta("request.categoryId");
      isValid = !!form.state.values.request?.categoryId && !field?.errors?.length;
    } else if (currentStep === 1) {
      await form.validateAllFields("change");
      const field = form.getFieldMeta("request.description");
      isValid = !!form.state.values.request?.description && !field?.errors?.length;
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
      request: {
        categoryId: undefined,
        description: "",
      },
      location: {
        address: "",
        municipalityId: undefined as unknown as string,
      },
    } as any);
    setFiles([]);
    setSubmissionResponse(null);
    setAttachmentStatus("idle");
    setCurrentStep(0);
  };

  return (
    <form
      className="mx-auto max-w-2xl w-full"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
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
        selector={(state) => [state.values.request?.categoryId]}
        children={([selectedCategoryId]) => {
          const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

          return (
            <div className="bg-paper min-h-[400px]">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl text-ink">What's wrong?</h2>
                  {isCategoriesLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-11 bg-line/50 rounded-xs" />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-[76px] bg-line/50 rounded-xs" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <CategoryStep
                      categories={categories}
                      selectedCategoryId={selectedCategoryId}
                      onSelect={(id) => {
                        form.setFieldValue("request.categoryId", id);
                        // Auto-advance
                        setTimeout(() => nextStep(), 150);
                      }}
                    />
                  )}
                  <form.Field
                    name="request.categoryId"
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
              children={([isSubmittingForm]) => (
                <Button
                  type="submit"
                  disabled={isSubmittingLocal || isSubmittingForm}
                  size="lg"
                  className="min-w-[140px]"
                >
                  {isSubmittingLocal || isSubmittingForm ? "Submitting..." : "Submit Report"}
                </Button>
              )}
            />
          )}
        </div>
      )}
    </form>
  );
}
