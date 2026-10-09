import apiClient from "@/lib/apiClient";
import { cleanParams } from "@/utils";

export interface CityFeedback {
  id: string;
  serviceRequestId?: string;
  citizenId?: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  citizen?: { firstName?: string; lastName?: string };
  serviceRequest?: { trackingNumber?: string; description?: string };
}

export interface FeedbackFilter {
  searchTerm?: string;
  rating?: number;
  citizenId?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

export function getMunicipalityFeedback(municipalityId: string, params?: FeedbackFilter) {
  return apiClient<{ data: CityFeedback[]; meta?: unknown }>(
    `/feedback/municipality/${municipalityId}`,
    { params: cleanParams(params) },
  );
}

export function getDepartmentFeedback(departmentId: string, params?: FeedbackFilter) {
  return apiClient<{ data: CityFeedback[]; meta?: unknown }>(
    `/feedback/department/${departmentId}`,
    { params: cleanParams(params) },
  );
}

export function getFeedbackById(id: string) {
  return apiClient<{ data: CityFeedback }>(`/feedback/${id}`, { method: "GET" });
}

export function submitFeedback(payload: {
  serviceRequestId: string;
  rating: number;
  comment?: string;
}) {
  return apiClient<{ data: CityFeedback }>("/feedback", {
    method: "POST",
    body: payload,
  });
}
