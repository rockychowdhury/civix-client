import z from "zod";

export const municipalityFormSchema = z.object({
  name: z.string().min(1, "Municipality name is required").max(100),
  code: z.string().min(1, "Code is required").max(20),
  countryCode: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  coverageStatus: z.enum(["ACTIVE", "INACTIVE", "PLANNED"]).optional(),
});

export type MunicipalityFormValues = z.infer<typeof municipalityFormSchema>;

export const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100),
  code: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export const zoneFormSchema = z.object({
  name: z.string().min(1, "Zone name is required").max(100),
  municipalityId: z.string().min(1, "Municipality is required"),
  coverageStatus: z.enum(["ACTIVE", "INACTIVE", "PLANNED"]).optional(),
});

export type ZoneFormValues = z.infer<typeof zoneFormSchema>;

export const wardFormSchema = z.object({
  name: z.string().min(1, "Ward name is required").max(100),
  number: z.number({ error: "Ward number is required" }).int().min(1),
  zoneId: z.string().min(1, "Zone is required"),
  coverageStatus: z.enum(["ACTIVE", "INACTIVE", "PLANNED"]).optional(),
});

export type WardFormValues = z.infer<typeof wardFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
  departmentId: z.string().optional(),
  baseSeverity: z.number().int().min(1).max(5).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const departmentFormSchema = z.object({
  name: z.string().min(1, "Department name is required").max(100),
  code: z.string().min(1, "Code is required").max(20),
  description: z.string().max(500).optional(),
  email: z.string().email("Provide a valid email address").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export const adminTeamFormSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
  code: z.string().min(1, "Team code is required").max(20),
  departmentId: z.string().min(1, "Department is required"),
  leaderId: z.string().optional(),
});

export type AdminTeamFormValues = z.infer<typeof adminTeamFormSchema>;

export const slaPolicyFormSchema = z.object({
  municipalityId: z.string().optional(),
  categoryId: z.string().optional(),
  priorityId: z.string().optional(),
  responseMinutes: z.number({ error: "Response target is required" }).int().min(1),
  resolutionMinutes: z.number({ error: "Resolution target is required" }).int().min(1),
  assignmentType: z.enum(["INDIVIDUAL", "TEAM"]).optional(),
});

export type SlaPolicyFormValues = z.infer<typeof slaPolicyFormSchema>;

export const provisionStaffFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter.")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least 1 number."),
  phone: z.string().optional(),
  designation: z.string().optional(),
  kind: z.enum(["platform-admin", "city-admin", "department-manager", "dispatcher", "technician"]),
  municipalityId: z.string().optional(),
  departmentId: z.string().optional(),
});

export type ProvisionStaffFormValues = z.infer<typeof provisionStaffFormSchema>;
