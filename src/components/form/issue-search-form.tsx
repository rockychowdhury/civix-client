"use client";

import { useForm } from "@tanstack/react-form";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type TrackerSearchValues, trackerSearchSchema } from "@/validation";

export function IssueSearchForm({ defaultIssueNumber = "" }: { defaultIssueNumber?: string }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      issueNumber: defaultIssueNumber,
    } as TrackerSearchValues,
    validators: {
      onChange: trackerSearchSchema,
    },
    onSubmit: ({ value }) => {
      // Navigate to the issue tracking route
      const params = new URLSearchParams({ issueNumber: value.issueNumber });
      router.push(`/track?${params.toString()}`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
      className="w-full"
    >
      <FieldGroup>
        <form.Field
          name="issueNumber"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched &&
              !field.state.meta.isValid &&
              field.state.value.length > 0;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name} className="sr-only">
                  Issue Number
                </FieldLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink/40">
                    <Search size={18} />
                  </div>
                  <Input
                    id={field.name}
                    placeholder="e.g. ISS-260923-0001"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    className="pl-10"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <form.Subscribe
                      selector={(state) => [state.canSubmit, state.isSubmitting]}
                      children={([_canSubmit, isSubmitting]) => (
                        <Button
                          type="submit"
                          disabled={!field.state.value || !field.state.meta.isValid || isSubmitting}
                          loading={isSubmitting}
                          size="sm"
                          className="h-7 text-xs"
                        >
                          Track
                        </Button>
                      )}
                    />
                  </div>
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
}
