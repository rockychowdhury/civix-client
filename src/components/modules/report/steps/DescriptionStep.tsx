"use client";

import type { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import type { ICreateServiceRequestPayload } from "@/validation";
import type { ReportCategory } from "./CategoryStep";

interface DescriptionStepProps {
  form: UseFormReturn<ICreateServiceRequestPayload>;
  selectedCategory?: ReportCategory;
}

export function DescriptionStep({ form, selectedCategory }: DescriptionStepProps) {
  const description = form.watch("description") || "";

  // Dynamic placeholder based on category selection — recognition over recall
  const categoryPlaceholders: Record<string, string> = {
    "water-leakage":
      "e.g. Water has been flowing continuously from a broken pipe since this morning, forming a large puddle on the road...",
    drainage:
      "e.g. The drain in front of my house has been blocked for days, and water is pooling after every shower...",
    supply:
      "e.g. We've had no water supply since yesterday afternoon; the whole street is affected...",
    pothole:
      "e.g. There is a deep pothole on the right lane just before the traffic light; cars keep hitting it...",
  };

  const placeholder = selectedCategory
    ? (categoryPlaceholders[selectedCategory.slug] ??
      `e.g. Please describe the ${selectedCategory.name.toLowerCase()} issue in detail. Where is it exactly and how long has it been happening?`)
    : "e.g. Please describe the issue in detail. Where is it exactly? What is happening?";

  const charCount = description.length;
  const isTooShort = charCount < 20 && charCount > 0;

  return (
    <div className="space-y-4 animate-slide-up motion-reduce:animate-none">
      <div className="space-y-2">
        <Textarea
          placeholder={placeholder}
          className="min-h-[160px] resize-y bg-paper text-base"
          {...form.register("description")}
        />
        <div className="flex justify-between text-xs">
          <span className={isTooShort ? "text-signal-open" : "text-ink/50"}>
            {isTooShort
              ? "A few more details will help this get resolved faster."
              : charCount === 0
                ? "Include enough detail for city workers to find and fix the issue."
                : "Looks good."}
          </span>
          <span className="text-ink/40 font-mono">{charCount} / 1000</span>
        </div>
        {form.formState.errors.description && (
          <p className="text-sm font-medium text-signal-open">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>
    </div>
  );
}
