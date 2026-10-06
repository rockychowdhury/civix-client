import z from "zod";

export const addStaffFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please provide a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter.")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least 1 number."),
  phone: z
    .string()
    .refine((val) => val === "" || val === undefined || /^(?:\+?880|0)1[3-9]\d{8}$/.test(val), {
      message: "Please provide a valid Bangladeshi number",
    })
    .optional(),
  designation: z.string().optional(),
  role: z.enum(["dispatcher", "technician"]),
});

export type AddStaffValues = z.infer<typeof addStaffFormSchema>;

export const updateStaffFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).optional(),
  lastName: z.string().min(1, "Last name is required").max(50).optional(),
  phone: z
    .string()
    .refine((val) => val === "" || val === undefined || /^(?:\+?880|0)1[3-9]\d{8}$/.test(val), {
      message: "Please provide a valid Bangladeshi number",
    })
    .optional(),
  designation: z.string().optional(),
});

export type UpdateStaffValues = z.infer<typeof updateStaffFormSchema>;
