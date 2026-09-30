import { z } from "zod";

export const locationSchema = z.object({
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().min(5, "Address is too short").max(255).optional(),
  landmark: z.string().max(255).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  wardId: z.string().uuid("Invalid ward").optional(),
  zoneId: z.string().uuid("Invalid zone").optional(),
});

export const serviceRequestSchema = z.object({
  categoryId: z.string().uuid("Please select a category"),
  description: z
    .string()
    .min(10, "Please provide more details")
    .max(1000, "Description is too long"),
  location: locationSchema,
});

export type ICreateServiceRequestPayload = z.infer<typeof serviceRequestSchema>;
export type ILocationPayload = z.infer<typeof locationSchema>;
