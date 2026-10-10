import { z } from "zod";

export const locationSchema = z.object({
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().min(5, "Address must be at least 5 characters").max(255),
  landmark: z.string().max(255).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  wardId: z.string().uuid("Invalid ward").optional().nullable(),
  zoneId: z.string().uuid("Invalid zone").optional().nullable(),
  municipalityId: z.string().uuid("Please select a municipality"),
});

export const countWords = (text: string): number => {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
};

export const serviceRequestSchema = z.object({
  request: z.object({
    categoryId: z.string().uuid("Please select a problem type"),
    description: z
      .string()
      .refine((val) => {
        const words = countWords(val);
        return words >= 1 && words <= 50;
      }, "Please keep your description within 50 words")
      .max(1000, "Description is too long"),
  }),
  location: locationSchema,
});

export type ICreateServiceRequestPayload = z.infer<typeof serviceRequestSchema>;
export type ILocationPayload = z.infer<typeof locationSchema>;
