import apiClient from "@/lib/apiClient";
import type { ServiceRequest } from "@/types";
import { cleanParams } from "@/utils";

export interface MunicipalityRequestFilter {
  searchTerm?: string;
  status?: string;
  requestType?: string;
  categoryId?: string;
  unTriaged?: boolean;
  page?: number;
  limit?: number;
}

export async function getMunicipalityServiceRequests(
  municipalityId: string,
  params?: MunicipalityRequestFilter,
) {
  return apiClient<{ data: ServiceRequest[]; meta?: unknown }>(
    `/service-requests/municipality/${municipalityId}`,
    { params: cleanParams(params) },
  );
}

export async function getServiceRequestsByCivicIssue(
  civicIssueId: string,
  params?: MunicipalityRequestFilter,
) {
  return apiClient<{ data: ServiceRequest[]; meta?: unknown }>(
    `/service-requests/civic-issue/${civicIssueId}`,
    { params: cleanParams(params) },
  );
}

export async function getMyServiceRequests(params?: {
  searchTerm?: string;
  status?: string;
  categoryId?: string;
  pendingFeedback?: boolean;
  page?: number;
  limit?: number;
}) {
  return apiClient<{
    data: ServiceRequest[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
  }>("/service-requests/my-requests", {
    params: cleanParams(params),
  });
}

export async function getPendingFeedbackServiceRequests() {
  return apiClient<{
    data: ServiceRequest[];
  }>("/service-requests/pending-feedback", {
    method: "GET",
  });
}

export async function getServiceRequests(filters?: Record<string, string>) {
  const res = await apiClient<{ data: ServiceRequest[] }>("/service-requests", {
    query: filters,
  });
  return res.data;
}

export async function getServiceRequestById(id: string) {
  const res = await apiClient<{ data: ServiceRequest }>(`/service-requests/${id}`);
  return res.data;
}

export async function reclassifyServiceRequest({
  id,
  categoryId,
}: {
  id: string;
  categoryId: string;
}) {
  const res = await apiClient<{ data: ServiceRequest }>(`/service-requests/${id}/reclassify`, {
    method: "POST",
    body: { categoryId },
  });
  return res.data;
}

export async function linkServiceRequestToIssue({
  id,
  civicIssueId,
}: {
  id: string;
  civicIssueId: string;
}) {
  const res = await apiClient<{ data: ServiceRequest }>(`/service-requests/${id}/link`, {
    method: "POST",
    body: { civicIssueId },
  });
  return res.data;
}

export async function flagServiceRequestInvalid({ id, reason }: { id: string; reason: string }) {
  const res = await apiClient<{ data: ServiceRequest }>(`/service-requests/${id}/flag`, {
    method: "POST",
    body: { reason },
  });
  return res.data;
}

export async function getNearbyCivicIssues(categoryId: string, ward: string) {
  const res = await apiClient<{ data: { id: string; issueNumber: string; title: string }[] }>(
    "/civic-issues/nearby",
    {
      query: { categoryId, ward },
    },
  );
  return res.data;
}
