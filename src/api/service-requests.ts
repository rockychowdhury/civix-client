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

export interface DepartmentServiceRequestsParams {
  stage?: "queue" | "in_progress" | "resolved" | "all" | string;
  status?: string;
  categoryId?: string;
  wardId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "submittedAt" | "status" | "trackingNumber" | string;
  sortOrder?: "asc" | "desc";
}

export async function getDepartmentServiceRequests(
  departmentId: string,
  params?: DepartmentServiceRequestsParams,
): Promise<{
  data: ServiceRequest[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
}> {
  const { stage, ...queryParams } = params || {};
  let path = `/service-requests/department/${departmentId}`;

  if (stage === "queue") {
    path = `/service-requests/department/${departmentId}/queue`;
  } else if (stage === "in_progress" || stage === "in-progress") {
    path = `/service-requests/department/${departmentId}/in-progress`;
  } else if (stage === "resolved") {
    path = `/service-requests/department/${departmentId}/resolved`;
  } else if (stage && stage !== "all") {
    (queryParams as any).stage = stage;
  }

  const res = await apiClient(path, {
    params: cleanParams(queryParams),
  });
  return res as { data: ServiceRequest[]; meta?: any };
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
