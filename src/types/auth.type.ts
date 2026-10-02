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

export type UserRole =
  | "CITIZEN"
  | "TECHNICIAN"
  | "DISPATCHER"
  | "DEPARTMENT_MANAGER"
  | "CITY_ADMIN"
  | "PLATFORM_ADMIN"
  | "SUPER_ADMIN";
