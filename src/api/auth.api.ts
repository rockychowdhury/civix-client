import apiClient from "@/lib/apiClient";
import type { LoginPayload, RegistrationPayload, VerifyAccountPayload, IForgotPassword, IResetPassword } from "@/types";

export function userLogin(payload: LoginPayload) {
  return apiClient("/auth/login", { method: "POST", body: payload });
}

export function verifyAccount(payload: VerifyAccountPayload) {
  return apiClient("/auth/verify-email", { method: "POST", body: payload });
}

export function userRegistration(payload: RegistrationPayload) {
  return apiClient("/auth/register-citizen", { method: "POST", body: payload });
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

export function userForgotPassword(payload: IForgotPassword) {
  return apiClient("/auth/forgot-password", { method: "POST", body: payload });
}

export function userResetPassword(payload: IResetPassword) {
  return apiClient("/auth/reset-password", { method: "POST", body: payload });
}

