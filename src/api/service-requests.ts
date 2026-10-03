import apiClient from "@/lib/apiClient";

import type { ServiceRequest } from "@/types";

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

export async function reclassifyServiceRequest({ id, categoryId }: { id: string; categoryId: string }) {
  const res = await apiClient<{ data: ServiceRequest }>(`/service-requests/${id}/reclassify`, {
    method: "POST",
    body: { categoryId },
  });
  return res.data;
}

export async function linkServiceRequestToIssue({ id, civicIssueId }: { id: string; civicIssueId: string }) {
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
  const res = await apiClient<{ data: { id: string; issueNumber: string; title: string }[] }>("/civic-issues/nearby", {
    query: { categoryId, ward },
  });
  return res.data;
}
