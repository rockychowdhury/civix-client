import apiClient from "@/lib/apiClient";
import type { LoginPayload, RegistrationPayload, VerifyAccountPayload } from "@/types";

export function userLogin(payload: LoginPayload) {
  return apiClient("/auth/login", { method: "POST", body: payload });
}

export function verifyAccount(payload: VerifyAccountPayload) {
  return apiClient("/auth/verify-email", { method: "POST", body: payload });
}

export function userRegistration(payload: RegistrationPayload) {
  return apiClient("/auth/register", { method: "POST", body: payload });
}

export function userLogout() {
  return apiClient("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiClient("/auth/me");
}

export function googleOAuth(payload: { idToken: string }) {
  return apiClient("/auth/google", { method: "POST", body: payload });
}

export function userForgotPassword(payload: { email: string }) {
  return apiClient("/auth/forgot-password", { method: "POST", body: payload });
}

export function userResetPassword(payload: { email: string; otp: string; password: string }) {
  return apiClient("/auth/reset-password", { method: "POST", body: payload });
}

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function getNewAccessToken(refreshToken: string): Promise<AuthTokens | null> {
  try {
    return await apiClient<AuthTokens>("/auth/refresh-token", {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
      },
    });
  } catch {
    return null;
  }
}
