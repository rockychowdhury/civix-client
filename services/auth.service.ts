import { validateRequestData } from "@/lib/utils/validate";
import {
  type ForgotPasswordPayload,
  type ForgotPasswordValues,
  forgotPasswordValidationSchema,
  type LoginPayload,
  type LoginValues,
  loginValidationSchema,
  type OtpValues,
  type RegisterPayload,
  type RegisterValues,
  type ResetPasswordBody,
  type ResetPasswordPayload,
  registerCitizenValidationSchema,
  resetPasswordValidationSchema,
  type VerifyEmailPayload,
  verifyEmailValidationSchema,
} from "@/lib/validations/auth";
import { ApiError, apiClient } from "@/services/api.service";

const AUTH_PATH = "/auth";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

async function establishSession(tokens: AuthTokens): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokens),
  });
  if (!response.ok) {
    throw new ApiError("Couldn't start your session", response.status);
  }
}

export async function login(payload: LoginValues): Promise<void> {
  const validated = validateRequestData<LoginPayload>(loginValidationSchema, {
    body: payload,
  });
  const tokens = await apiClient.post<AuthTokens>(`${AUTH_PATH}/login`, validated.body);
  await establishSession(tokens);
}

export async function register(payload: RegisterValues): Promise<void> {
  const validated = validateRequestData<RegisterPayload>(registerCitizenValidationSchema, {
    body: payload,
  });
  const { phone, ...body } = validated.body;
  await apiClient.post<void>(`${AUTH_PATH}/register-citizen`, {
    ...body,
    phone: phone ?? undefined,
  });
}

export async function verifyAccount(payload: OtpValues): Promise<void> {
  const validated = validateRequestData<VerifyEmailPayload>(verifyEmailValidationSchema, {
    body: payload,
  });
  const tokens = await apiClient.post<AuthTokens>(`${AUTH_PATH}/verify-email`, validated.body);
  await establishSession(tokens);
}

export async function forgotPassword(payload: ForgotPasswordValues): Promise<void> {
  const validated = validateRequestData<ForgotPasswordPayload>(forgotPasswordValidationSchema, {
    body: payload,
  });
  await apiClient.post<void>(`${AUTH_PATH}/forgot-password`, validated.body);
}

export async function resetPassword(payload: ResetPasswordBody): Promise<void> {
  const validated = validateRequestData<ResetPasswordPayload>(resetPasswordValidationSchema, {
    body: payload,
  });
  await apiClient.post<void>(`${AUTH_PATH}/reset-password`, validated.body);
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new ApiError("Couldn't sign you out", response.status);
  }
}

export const authService = {
  login,
  register,
  verifyAccount,
  forgotPassword,
  resetPassword,
  logout,
};
