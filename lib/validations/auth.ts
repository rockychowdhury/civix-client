import { z } from "zod";

const emailSchema = z.string().email("Invalid email format").trim().toLowerCase();

export const registerCitizenValidationSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: emailSchema,
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phone: z.string().trim().optional(),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),
});

export const verifyEmailValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z.string().trim().min(4, "OTP must be at least 4 characters long"),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, "Refresh token is required in cookies"),
  }),
});

export const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z.string().trim().min(1, "OTP is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const registerCitizenFormSchema = registerCitizenValidationSchema.shape.body;
export const loginFormSchema = loginValidationSchema.shape.body;
export const otpFormSchema = verifyEmailValidationSchema.shape.body.extend({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code we sent you"),
});
export const forgotPasswordFormSchema = forgotPasswordValidationSchema.shape.body;
export const resetPasswordFormSchema = resetPasswordValidationSchema.shape.body
  .extend({
    confirmPassword: z.string().min(1, "Re-enter your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Those passwords don't match yet",
  });

export type RegisterValues = z.infer<typeof registerCitizenFormSchema>;
export type RegisterPayload = z.infer<typeof registerCitizenValidationSchema>;
export type LoginValues = z.infer<typeof loginFormSchema>;
export type LoginPayload = z.infer<typeof loginValidationSchema>;
export type OtpValues = z.infer<typeof otpFormSchema>;
export type VerifyEmailPayload = z.infer<typeof verifyEmailValidationSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordFormSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordValidationSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordValidationSchema.shape.body>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordValidationSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordFormSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenValidationSchema>;
export const authSessionSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().min(1, "Refresh token is required"),
});
export type AuthSessionPayload = z.infer<typeof authSessionSchema>;
