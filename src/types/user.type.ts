export type PlatformUserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED";

export interface AdminUser {
  id: string;
  email: string;
  phone?: string | null;
  displayName?: string | null;
  status: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  citizenProfile?: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
  } | null;
  staffProfile?: unknown;
  userRoles?: Array<{ role?: { code?: string; name?: string } }>;
  [key: string]: unknown;
}

export interface AdminUserFilter {
  searchTerm?: string;
  status?: string;
  isEmailVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateUserStatusPayload {
  status: string;
}
