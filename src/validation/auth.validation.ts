import z from "zod";

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginFormSchema>;

export const registerCitizenFormSchema = z.object({
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
    .refine((val) => val === "" || /^(?:\+?880|0)1[3-9]\d{8}$/.test(val), {
      message: "Please provide a valid Bangladeshi number",
    })
    .optional(),
});
export type RegisterValues = z.infer<typeof registerCitizenFormSchema>;

export const otpFormSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "Code must be exactly 6 digits."),
});
export type OtpValues = z.infer<typeof otpFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().length(6, "Code must be 6 digits"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[a-z]/, "Password must contain at least 1 lowercase letter.")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter.")
      .regex(/[0-9]/, "Password must contain at least 1 number."),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordFormSchema>;
