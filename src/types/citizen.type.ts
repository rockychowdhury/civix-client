export type CitizenTrustLevel = "NEW" | "REGULAR" | "TRUSTED";

export interface CitizenProfile {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  displayName?: string | null;
  nidNumber?: string | null;
  address?: string | null;
  trustLevel?: CitizenTrustLevel | string;
  reputationScore?: number;
  totalReports?: number;
  resolvedReports?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrentCitizenUser {
  id: string;
  email: string;
  phone?: string | null;
  displayName?: string | null;
  nidNumber?: string | null;
  status: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  trustLevel?: CitizenTrustLevel | string;
  citizenProfile?: CitizenProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateMyProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  displayName?: string;
  nidNumber?: string;
}

export interface CreateFeedbackPayload {
  serviceRequestId: string;
  resolutionId?: string;
  rating: number; // 1 - 5
  comment?: string;
}

export interface CitizenFeedbackItem {
  id: string;
  serviceRequestId: string;
  citizenId?: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  serviceRequest?: {
    id: string;
    trackingNumber: string;
    description: string;
    status: string;
    category?: { name: string };
  };
}

export interface CitizenStats {
  totalRequests: number;
  activeRequests: number;
  resolvedRequests: number;
  feedbackPendingCount: number;
}
