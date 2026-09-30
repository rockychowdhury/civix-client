import { z } from "zod";

export const trackerSearchSchema = z.object({
  issueNumber: z
    .string()
    .trim()
    .min(1, "Issue number is required")
    .regex(/^ISS-\d{6}-\d{4}$/i, "Must be in the format ISS-DDMMYY-XXXX (e.g. ISS-260923-0001)"),
});

export type TrackerSearchValues = z.infer<typeof trackerSearchSchema>;
