"use client";

import { useForm } from "@tanstack/react-form";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock,
  FileCheck2,
  ImageIcon,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createServiceRequest, uploadAttachments } from "@/api/report.api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetCategories } from "@/hooks/category.hook";
import { useCategoryIndex } from "@/hooks/useCategoryIndex";
import { useReportDraft } from "@/hooks/useReportDraft";
import { type IndexableCategory, type MatchResult, matchCategories } from "@/lib/category-matcher";
import { sanitizeMultilineText, sanitizeNullableString, sanitizeText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { ServiceRequestResponse } from "@/types";
import { type ICreateServiceRequestPayload, serviceRequestSchema } from "@/validation";
import { AttachmentsStep } from "./steps/AttachmentsStep";
import { CategoryStep, type ReportCategory } from "./steps/CategoryStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { DescriptionStep } from "./steps/DescriptionStep";
import { LocationStep } from "./steps/LocationStep";
import { ReviewStep } from "./steps/ReviewStep";

const STEPS = [
  { id: 0, title: "Details", label: "Description" },
  { id: 1, title: "Problem", label: "Identify Issue" },
  { id: 2, title: "Location", label: "Address & Ward" },
  { id: 3, title: "Photos", label: "Visual Evidence" },
  { id: 4, title: "Review", label: "Dispatch Manifest" },
];

export function ReportWizard() {
  const { data: categoryData, isLoading: isCategoriesLoading } = useGetCategories();
  const categories = (categoryData?.data || []) as (ReportCategory & IndexableCategory)[];

  // Build the category search index
  const categoryIndex = useCategoryIndex(categories as IndexableCategory[]);

  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  // Smoothly scroll to the top of the wizard when transitioning between steps
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [submissionResponse, setSubmissionResponse] = useState<ServiceRequestResponse | null>(null);
  const [attachmentStatus, setAttachmentStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const { hasDraft, saveDraft, loadDraft, clearDraft } = useReportDraft();
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [isDraftChecked, setIsDraftChecked] = useState(false);
  const [draftContext, setDraftContext] = useState<string | null>(null);

  // Track the latest match result from Step 1 for validation
  const [_lastMatchResult, setLastMatchResult] = useState<MatchResult | null>(null);
  // Modal when citizen text has insufficient info to match any civic category
  const [showInsufficientInfoModal, setShowInsufficientInfoModal] = useState(false);

  // Step-level errors displayed only after user attempts to proceed to next step
  const [stepErrors, setStepErrors] = useState<{
    description?: string;
    categoryId?: string;
    address?: string;
    municipalityId?: string;
  }>({});

  const clearFieldError = useCallback(
    (field: "description" | "categoryId" | "address" | "municipalityId") => {
      setStepErrors((prev) => {
        if (!prev[field]) return prev;
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    },
    [],
  );

  const form = useForm({
    defaultValues: {
      request: {
        categoryId: "",
        description: "",
      },
      location: {
        address: "",
        municipalityId: "",
        landmark: "",
        postalCode: "",
        wardId: undefined,
        zoneId: undefined,
        latitude: undefined,
        longitude: undefined,
      },
    } as unknown as ICreateServiceRequestPayload,
    onSubmit: async ({ value }) => {
      try {
        setIsSubmittingLocal(true);

        const cleanLocation: Record<string, any> = {
          address: sanitizeText(value.location.address),
          municipalityId: value.location.municipalityId,
        };

        const landmark = sanitizeNullableString(value.location.landmark);
        if (landmark) cleanLocation.landmark = landmark;

        const postalCode = sanitizeNullableString(value.location.postalCode);
        if (postalCode) cleanLocation.postalCode = postalCode;

        const wardId = sanitizeNullableString(value.location.wardId);
        if (wardId) cleanLocation.wardId = wardId;

        const zoneId = sanitizeNullableString(value.location.zoneId);
        if (zoneId) cleanLocation.zoneId = zoneId;

        if (typeof value.location.latitude === "number") {
          cleanLocation.latitude = value.location.latitude;
        }
        if (typeof value.location.longitude === "number") {
          cleanLocation.longitude = value.location.longitude;
        }

        const sanitizedPayload: ICreateServiceRequestPayload = {
          request: {
            categoryId: value.request.categoryId,
            description: sanitizeMultilineText(value.request.description),
          },
          location: cleanLocation as ICreateServiceRequestPayload["location"],
        };

        const validation = serviceRequestSchema.safeParse(sanitizedPayload);
        if (!validation.success) {
          const firstErr = validation.error.issues[0]?.message || "Please fix validation errors.";
          toast.error("Submission error", { description: firstErr });
          return;
        }

        const response = await createServiceRequest(sanitizedPayload);
        setSubmissionResponse(response);
        setCurrentStep(5);
        clearDraft();

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
      } catch (err: any) {
        toast.error("Failed to submit civic report", {
          description: err?.data?.message || "Please check your network and try again.",
        });
      } finally {
        setIsSubmittingLocal(false);
      }
    },
  });

  useEffect(() => {
    if (hasDraft) {
      const draftState = loadDraft();
      if (draftState?.values) {
        const draft = draftState.values;
        const category = categories.find((c) => c.id === draft.request?.categoryId);
        const subject =
          draft.request?.description?.trim().split("\n")[0]?.trim().slice(0, 48) ||
          draft.location?.address?.trim();

        if (subject && category?.name) {
          setDraftContext(`${category.name} — "${subject}…"`);
        } else if (subject) {
          setDraftContext(`"${subject}…"`);
        } else if (category?.name) {
          setDraftContext(`${category.name} report`);
        } else {
          setDraftContext("Unsaved draft");
        }
      }
      setShowDraftBanner(true);
    }
    setIsDraftChecked(true);
  }, [hasDraft, categories, loadDraft]);

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

      if (typeof draftState.step === "number" && draftState.step < 5) {
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

  const handleMatchResult = useCallback((result: MatchResult) => {
    setLastMatchResult(result);
  }, []);

  const nextStep = async () => {
    if (currentStep === 0) {
      const description = form.state.values.request?.description?.trim() || "";
      const wordCount = description ? description.split(/\s+/).filter(Boolean).length : 0;

      if (!description || wordCount === 0) {
        setStepErrors((prev) => ({
          ...prev,
          description: "Insufficient information — please provide more details.",
        }));
        return;
      }

      if (wordCount > 50) {
        setStepErrors((prev) => ({
          ...prev,
          description: "Please keep your description within 50 words.",
        }));
        return;
      }

      if (description.length > 1000) {
        setStepErrors((prev) => ({
          ...prev,
          description: "Description is too long (maximum 1000 characters).",
        }));
        return;
      }

      // Allow proceeding if any problem matches with the current details
      if (categoryIndex) {
        const matchResult = matchCategories(description, categoryIndex, true);
        if (matchResult.matches.length === 0) {
          setShowInsufficientInfoModal(true);
          setStepErrors((prev) => ({
            ...prev,
            description: "Insufficient information — please provide more details.",
          }));
          return;
        }
      }

      clearFieldError("description");
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      const categoryId = form.state.values.request?.categoryId;
      if (!categoryId) {
        setStepErrors((prev) => ({
          ...prev,
          categoryId: "Please select a problem type before continuing.",
        }));
        return;
      }
      clearFieldError("categoryId");
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const address = form.state.values.location?.address?.trim() || "";
      const municipalityId = form.state.values.location?.municipalityId;
      const errors: { address?: string; municipalityId?: string } = {};

      if (!address || address.length < 5) {
        errors.address = !address
          ? "Please enter a valid street address or location description."
          : `Address must be at least 5 characters (currently ${address.length}).`;
      }
      if (!municipalityId) {
        errors.municipalityId = "Please select a municipality to route your report.";
      }

      if (Object.keys(errors).length > 0) {
        setStepErrors((prev) => ({ ...prev, ...errors }));
        return;
      }

      clearFieldError("address");
      clearFieldError("municipalityId");
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      setCurrentStep(4);
      return;
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
        categoryId: "",
        description: "",
      },
      location: {
        address: "",
        municipalityId: "",
        landmark: "",
        postalCode: "",
        wardId: undefined,
        zoneId: undefined,
        latitude: undefined,
        longitude: undefined,
      },
    } as any);
    setFiles([]);
    setSubmissionResponse(null);
    setAttachmentStatus("idle");
    setCurrentStep(0);
    setStepErrors({});
    setLastMatchResult(null);
  };

  return (
    <div className="w-full">
      {currentStep === 5 ? (
        <ConfirmationStep
          response={submissionResponse}
          attachmentStatus={attachmentStatus}
          onRetryAttachments={retryAttachments}
          onReset={resetFlow}
        />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="w-full"
        >
          {/* Heading + Subheading + Draft Action in the same row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                Report an Issue
              </h1>
              <p className="font-body text-sm text-ink/60">
                Tell us what needs repair and where. We'll route it directly to municipal dispatch.
              </p>
            </div>

            {showDraftBanner && currentStep === 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-ledger/30 bg-ledger/[0.05] text-xs shrink-0 self-start sm:self-end">
                <span className="text-ink/80 font-medium">Unsaved draft</span>
                {draftContext && (
                  <span className="text-ink/40 hidden md:inline max-w-[220px] truncate">
                    • {draftContext}
                  </span>
                )}
                <div className="flex items-center gap-1 ml-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClearDraft}
                    className="h-6 text-xs px-2 text-ink/50 hover:text-signal-open hover:bg-signal-open/10 cursor-pointer"
                  >
                    Discard
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleResumeDraft}
                    className="h-6 text-xs px-2.5 cursor-pointer"
                  >
                    Resume
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="mb-8 border-b border-line/40 pb-5">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
              {STEPS.map((step, idx) => {
                const isCurrent = currentStep === step.id;
                const isPassed = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (isPassed) jumpToStep(step.id);
                    }}
                    disabled={!isPassed && !isCurrent}
                    className={cn(
                      "flex min-h-[2.75rem] items-center gap-2.5 py-1 px-2.5 rounded-lg text-left transition-all shrink-0",
                      isPassed && "cursor-pointer hover:bg-field/40",
                      isCurrent && "bg-ledger/10 text-ledger font-medium",
                      !isPassed && !isCurrent && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    <span
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs font-semibold",
                        isPassed
                          ? "bg-ledger text-paper"
                          : isCurrent
                            ? "bg-ledger text-paper ring-2 ring-ledger/20"
                            : "bg-line/60 text-ink/60",
                      )}
                    >
                      {isPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                    </span>
                    <div className="hidden min-[420px]:block">
                      <p className="font-display text-xs font-medium leading-none">{step.title}</p>
                      <p className="font-body text-[10px] text-ink/50 mt-0.5">{step.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form.Subscribe
            selector={(state) => [state.values]}
            children={([formValues]) => {
              const selectedCategoryId = formValues.request?.categoryId;
              const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
              const address = formValues.location?.address;
              const description = formValues.request?.description;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    <div className="space-y-0.5">
                      {currentStep === 0 && (
                        <>
                          <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                            Describe the issue
                          </h2>
                          <p className="font-body text-xs text-ink/55">
                            Add key details so we can categorize and triage appropriately.
                          </p>
                        </>
                      )}
                      {currentStep === 1 && (
                        <>
                          <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                            Confirm the problem
                          </h2>
                          <p className="font-body text-xs text-ink/55">
                            We've matched likely problems from your description. Confirm or explore
                            all types.
                          </p>
                        </>
                      )}
                      {currentStep === 2 && (
                        <>
                          <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                            Where is this located?
                          </h2>
                          <p className="font-body text-xs text-ink/55">
                            Pinpoint via GPS or enter street address.
                          </p>
                        </>
                      )}
                      {currentStep === 3 && (
                        <>
                          <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                            Add photos (Optional)
                          </h2>
                          <p className="font-body text-xs text-ink/55">
                            Photos help crews prepare equipment.
                          </p>
                        </>
                      )}
                      {currentStep === 4 && (
                        <>
                          <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                            Review and submit
                          </h2>
                          <p className="font-body text-xs text-ink/55">
                            Confirm report details before dispatching.
                          </p>
                        </>
                      )}
                    </div>

                    <div
                      className={cn(
                        "bg-paper rounded-xl border border-line/60 p-6 sm:p-7 shadow-xs transition-colors",
                        currentStep === 0 &&
                          stepErrors.description &&
                          "border-signal-open ring-1 ring-signal-open/30",
                      )}
                    >
                      {/* Step 0: Description / Details */}
                      {currentStep === 0 && (
                        <DescriptionStep
                          form={form}
                          categoryIndex={categoryIndex}
                          error={stepErrors.description}
                          onClearError={() => clearFieldError("description")}
                          onMatchResult={handleMatchResult}
                        />
                      )}

                      {/* Step 1: Category Selection */}
                      {currentStep === 1 &&
                        (isCategoriesLoading ? (
                          <div className="animate-pulse space-y-4">
                            <div className="h-12 bg-line/40 rounded-lg" />
                            <div className="space-y-3">
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-20 bg-line/30 rounded-xl" />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <CategoryStep
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            error={stepErrors.categoryId}
                            onClearError={() => clearFieldError("categoryId")}
                            onSelect={(id: string) => {
                              clearFieldError("categoryId");
                              form.setFieldValue("request.categoryId", id);
                            }}
                            categoryIndex={categoryIndex}
                            descriptionText={description || ""}
                          />
                        ))}

                      {/* Step 2: Location */}
                      {currentStep === 2 && (
                        <LocationStep
                          form={form}
                          errors={{
                            address: stepErrors.address,
                            municipalityId: stepErrors.municipalityId,
                          }}
                          onClearError={clearFieldError}
                          problemName={selectedCategory?.name}
                        />
                      )}

                      {/* Step 3: Photos */}
                      {currentStep === 3 && (
                        <AttachmentsStep
                          files={files}
                          onChange={setFiles}
                          onSkip={() => nextStep()}
                        />
                      )}

                      {/* Step 4: Review */}
                      {currentStep === 4 && (
                        <ReviewStep
                          form={form}
                          selectedCategory={selectedCategory}
                          files={files}
                          onEditStep={jumpToStep}
                        />
                      )}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2.5 sm:justify-between pt-2">
                      {currentStep > 0 ? (
                        <Button
                          variant="ghost"
                          onClick={prevStep}
                          type="button"
                          className="h-10 sm:h-9 px-3 text-xs sm:text-sm font-normal gap-1.5 text-ink/70 hover:text-ink cursor-pointer w-full sm:w-auto"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </Button>
                      ) : (
                        <div className="hidden sm:block" />
                      )}

                      {currentStep < 4 ? (
                        <Button
                          onClick={nextStep}
                          type="button"
                          className="h-10 sm:h-9 px-4 text-xs sm:text-sm font-medium gap-1.5 cursor-pointer min-w-[130px] w-full sm:w-auto rounded-lg shadow-xs"
                        >
                          {currentStep === 0 && "Continue to Problem"}
                          {currentStep === 1 && "Continue to Location"}
                          {currentStep === 2 && "Continue to Photos"}
                          {currentStep === 3 && "Review Report"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <form.Subscribe
                          selector={(state) => [state.isSubmitting]}
                          children={([isSubmittingForm]) => (
                            <Button
                              type="submit"
                              disabled={isSubmittingLocal || isSubmittingForm}
                              className="h-10 sm:h-9 px-4.5 text-xs sm:text-sm font-medium gap-2 cursor-pointer min-w-[145px] w-full sm:w-auto rounded-lg shadow-xs bg-ledger text-paper hover:bg-ledger/90"
                            >
                              {isSubmittingLocal || isSubmittingForm ? (
                                "Transmitting Report..."
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" /> Dispatch Report
                                </>
                              )}
                            </Button>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-24">
                    <div className="rounded-xl border border-line/60 bg-field/30 p-5 space-y-5 shadow-xs">
                      <div className="space-y-2 border-b border-line/40 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-ledger" /> Target Routing
                          </span>
                          <span
                            className={cn(
                              "font-mono text-[10px] px-2 py-0.5 rounded-full font-medium",
                              selectedCategory
                                ? "bg-signal-resolved/10 text-signal-resolved"
                                : "bg-ledger/10 text-ledger",
                            )}
                          >
                            {selectedCategory
                              ? "Problem Confirmed"
                              : "Pending Problem Confirmation"}
                          </span>
                        </div>
                        <p className="font-display text-base font-semibold text-ink leading-tight">
                          {selectedCategory
                            ? selectedCategory.name
                            : "Pending Problem Confirmation"}
                        </p>
                        <p className="font-body text-xs text-ink/60">
                          {selectedCategory
                            ? `Routed to ${selectedCategory.department?.name || "Municipal Dispatch"}`
                            : "Describe your issue, then confirm the detected problem."}
                        </p>
                      </div>

                      <div className="space-y-3 font-body text-xs">
                        <div className="flex items-center justify-between text-ink/50 font-mono text-[10px] uppercase tracking-wider">
                          <span>Live Dossier Summary</span>
                          <span>Step {currentStep + 1} of 5</span>
                        </div>

                        <div className="space-y-2 divide-y divide-line/30">
                          <div className="flex items-start gap-2 pt-1.5">
                            <FileCheck2 className="w-4 h-4 text-ledger shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-medium text-ink truncate">
                                {description
                                  ? description.slice(0, 45) + (description.length > 45 ? "…" : "")
                                  : "Awaiting description"}
                              </p>
                              <p className="text-ink/50 text-[11px]">
                                {description?.trim()
                                  ? `${description.trim().split(/\s+/).filter(Boolean).length} words entered`
                                  : "Enter details in Step 1"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 pt-2">
                            <Tag className="w-4 h-4 text-ledger shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-medium text-ink truncate">
                                {selectedCategory?.name || "Pending problem confirmation"}
                              </p>
                              <p className="text-ink/50 text-[11px] truncate">
                                {selectedCategory?.department?.name || "Confirmed in Step 2"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 pt-2">
                            <MapPin className="w-4 h-4 text-ledger shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="font-medium text-ink truncate">
                                {address || "Location not set"}
                              </p>
                              <p className="text-ink/50 text-[11px]">
                                {formValues.location?.latitude
                                  ? "GPS Pinpoint Verified"
                                  : "Awaiting location verification"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 pt-2">
                            <ImageIcon className="w-4 h-4 text-ledger shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-ink">
                                {files.length > 0
                                  ? `${files.length} Photo${files.length > 1 ? "s" : ""} Attached`
                                  : "No Photos Attached"}
                              </p>
                              <p className="text-ink/50 text-[11px]">
                                {files.length > 0
                                  ? "Visual evidence ready"
                                  : "Optional photographic evidence"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-line/40">
                        <div className="p-3 rounded-lg border border-line/40 bg-paper space-y-1.5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-ledger font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Dispatch Protocol</span>
                          </div>
                          <p className="font-body text-[11px] text-ink/65 leading-relaxed">
                            Reports submitted on Civix are synchronized directly into city dispatch
                            queues with guaranteed audit logging.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-ink/45 pt-1">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-ledger" /> Encrypted Transmission
                        </span>
                        <span>Autosaved</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </form>
      )}

      {/* Insufficient Information Dialog */}
      <Dialog open={showInsufficientInfoModal} onOpenChange={setShowInsufficientInfoModal}>
        <DialogContent className="sm:max-w-md bg-paper border border-line p-6">
          <DialogHeader className="space-y-3">
            <div className="h-10 w-10 rounded-full bg-signal-open/10 border border-signal-open/20 flex items-center justify-center text-signal-open">
              <CircleAlert className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-ink">
                Insufficient Information
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-ink/65 mt-1.5 leading-relaxed">
                We couldn't identify the specific problem from your description. To dispatch the
                right municipal team, please clarify the exact issue you are facing.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-3.5 rounded-lg bg-field/30 border border-line/40 text-xs text-ink/75 space-y-2 my-2">
            <p className="font-medium text-ink">Please specify what is happening:</p>
            <ul className="list-disc list-inside space-y-1 text-ink/65 pl-1">
              <li>
                Name the physical condition (e.g. "pothole on road", "water pipe leak", "broken
                streetlight").
              </li>
              <li>Mention what equipment or public infrastructure is damaged.</li>
            </ul>
          </div>

          <DialogFooter className="mt-3">
            <Button
              type="button"
              onClick={() => setShowInsufficientInfoModal(false)}
              className="w-full cursor-pointer"
            >
              Clarify Issue Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
