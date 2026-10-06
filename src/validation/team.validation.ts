import z from "zod";

export const createTeamFormSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
  code: z.string().min(1, "Team code is required").max(20),
  leaderId: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export type CreateTeamValues = z.infer<typeof createTeamFormSchema>;

export const updateTeamFormSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DISBANDED"]).optional(),
  leaderId: z.string().optional(),
});

export type UpdateTeamValues = z.infer<typeof updateTeamFormSchema>;
