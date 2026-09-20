"use client";

import type { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import type { ICreateServiceRequestPayload } from "@/lib/validations/report";
import type { ReportCategory } from "./CategoryStep";

interface DescriptionStepProps {
  form: UseFormReturn<ICreateServiceRequestPayload>;
  selectedCategory?: ReportCategory;
}

export function DescriptionStep({ form, selectedCategory }: DescriptionStepProps) {
  const description = form.watch("description") || "";

  // Dynamic placeholder based on category name
  const placeholder = selectedCategory
    ? `e.g. Please describe the ${selectedCategory.name.toLowerCase()} in detail. Where is it exactly? What is happening?`
    : "e.g. Please describe the issue in detail...";

  const charCount = description.length;
  const isTooShort = charCount < 20 && charCount > 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <Textarea
          placeholder={placeholder}
          className="min-h-[160px] resize-y bg-paper text-base"
          {...form.register("description")}
        />
        <div className="flex justify-between text-xs">
          <span className={isTooShort ? "text-amber-600" : "text-ink/50"}>
            {isTooShort
              ? "A few more details will help this get resolved faster."
              : charCount === 0
                ? "Include enough detail for city workers to find and fix the issue."
                : "Looks good."}
          </span>
          <span className="text-ink/40 font-mono">{charCount} / 1000</span>
        </div>
        {form.formState.errors.description && (
          <p className="text-sm font-medium text-red-500">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>
    </div>
  );
}
