import apiClient from "@/lib/apiClient";
import type { IVerifyResolutionPayload, WorkResolution } from "@/types";

export interface ResolutionFeedbackItem {
  id: string;
  serviceRequestId?: string;
  resolutionId?: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  citizen?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  serviceRequest?: {
    trackingNumber?: string;
    description?: string;
  };
}

/**
 * Fetch resolution details by ID including verifications and feedbacks.
 * GET /api/v1/resolutions/:id
 */
export async function getResolutionById(id: string) {
  const res = await apiClient<{ data: WorkResolution }>(`/resolutions/${id}`, {
    method: "GET",
  });
  return res.data;
}

/**
 * Fetch citizen feedbacks linked to a resolution.
 * GET /api/v1/resolutions/:id/feedback
 */
export async function getResolutionFeedback(id: string) {
  const res = await apiClient<{ data: ResolutionFeedbackItem[] }>(`/resolutions/${id}/feedback`, {
    method: "GET",
  });
  return res.data;
}

/**
 * Dispatcher / Admin verification of technician resolution.
 * POST /api/v1/resolutions/:id/verify
 * Accepts { status: "VERIFIED" | "REJECTED" | "REOPENED", notes?: string }
 */
export async function verifyResolution(id: string, payload: IVerifyResolutionPayload) {
  const res = await apiClient<{ data: WorkResolution }>(`/resolutions/${id}/verify`, {
    method: "POST",
    body: payload,
  });
  return res.data;
}
