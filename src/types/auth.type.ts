export interface RegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  email: string;
  otp: string;
  newPassword: string;
}

import type { USER_ROLES } from "@/constant/role.constant";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
