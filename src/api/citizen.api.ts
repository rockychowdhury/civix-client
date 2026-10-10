import apiClient from "@/lib/apiClient";
import type {
  CitizenFeedbackItem,
  CreateFeedbackPayload,
  CurrentCitizenUser,
  ServiceRequest,
  UpdateMyProfilePayload,
} from "@/types";
import { cleanParams } from "@/utils";

export interface MyRequestsFilter {
  searchTerm?: string;
  status?: string;
  categoryId?: string;
  pendingFeedback?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Fetch all service requests submitted by the currently authenticated citizen.
 * GET /api/v1/service-requests/my-requests
 */
export async function getMyServiceRequests(params?: MyRequestsFilter) {
  return apiClient<{
    data: ServiceRequest[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
  }>("/service-requests/my-requests", {
    method: "GET",
    params: cleanParams(params),
  });
}

/**
 * Fetch service requests with active resolutions awaiting citizen feedback.
 * GET /api/v1/service-requests/pending-feedback
 */
export async function getPendingFeedbackServiceRequests() {
  return apiClient<{
    data: ServiceRequest[];
  }>("/service-requests/pending-feedback", {
    method: "GET",
  });
}

/**
 * View detailed information and timeline for a specific service request.
 * GET /api/v1/service-requests/:id
 */
export async function getCitizenServiceRequestById(id: string) {
  return apiClient<{ data: ServiceRequest }>(`/service-requests/${id}`, {
    method: "GET",
  });
}

/**
 * Submit citizen rating and comments for a resolved service request.
 * POST /api/v1/feedback
 */
export async function submitCitizenFeedback(payload: CreateFeedbackPayload) {
  return apiClient<{ data: CitizenFeedbackItem }>("/feedback", {
    method: "POST",
    body: payload,
  });
}

/**
 * Fetch feedback review details by ID.
 * GET /api/v1/feedback/:id
 */
export async function getCitizenFeedbackById(id: string) {
  return apiClient<{ data: CitizenFeedbackItem }>(`/feedback/${id}`, {
    method: "GET",
  });
}

/**
 * Fetch current citizen account profile and trust level.
 * GET /api/v1/users/me
 */
export async function getMyProfile() {
  return apiClient<{ data: CurrentCitizenUser }>("/users/me", {
    method: "GET",
  });
}

/**
 * Update citizen profile details (name, phone, displayName, nidNumber).
 * PATCH /api/v1/users/me
 */
export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  return apiClient<{ data: CurrentCitizenUser }>("/users/me", {
    method: "PATCH",
    body: payload,
  });
}

/**
 * Cancel an active service request submitted by citizen.
 * PATCH /api/v1/service-requests/:id/status or /service-requests/:id
 */
export async function cancelServiceRequest(id: string, reason?: string) {
  try {
    return await apiClient<{ data: ServiceRequest }>(`/service-requests/${id}/status`, {
      method: "PATCH",
      body: { status: "CANCELLED", reason },
    });
  } catch (_err) {
    return await apiClient<{ data: ServiceRequest }>(`/service-requests/${id}`, {
      method: "PATCH",
      body: { status: "CANCELLED", reason },
    });
  }
}
