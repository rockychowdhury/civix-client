import z from "zod";

export const workUpdateFormSchema = z.object({
  updateType: z.enum(["ON_SITE", "PROGRESS", "BLOCKED", "DELAYED", "PAUSED", "RESUMED"], {
    error: "Choose what happened on site",
  }),
  notes: z.string().max(1000, "Notes must be under 1000 characters").optional(),
});

export type WorkUpdateFormValues = z.infer<typeof workUpdateFormSchema>;

export const resolutionFormSchema = z.object({
  summary: z
    .string()
    .min(10, "Describe the fix in at least 10 characters")
    .max(1000, "Summary must be under 1000 characters"),
});

export type ResolutionFormValues = z.infer<typeof resolutionFormSchema>;

export const rejectAssignmentFormSchema = z.object({
  reason: z.string().max(500, "Reason must be under 500 characters").optional(),
});

export type RejectAssignmentFormValues = z.infer<typeof rejectAssignmentFormSchema>;
