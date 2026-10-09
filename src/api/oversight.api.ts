import apiClient from "@/lib/apiClient";
import type { CivicIssue, OversightFilter, UpdateIssueStatusPayload } from "@/types";
import { cleanParams } from "@/utils";

export function getAllCivicIssues(params?: OversightFilter) {
  return apiClient<{ data: CivicIssue[]; meta?: unknown }>("/civic-issues", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function getCivicIssueById(id: string) {
  return apiClient<{ data: CivicIssue }>(`/civic-issues/${id}`, { method: "GET" });
}

export function overrideCivicIssueStatus(id: string, payload: UpdateIssueStatusPayload) {
  return apiClient<{ data: CivicIssue }>(`/civic-issues/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function reopenCivicIssue(id: string) {
  return apiClient<{ data: CivicIssue }>(`/civic-issues/${id}/reopen`, {
    method: "POST",
  });
}

export function getAllServiceRequests(params?: OversightFilter) {
  return apiClient<{ data: unknown[]; meta?: unknown }>("/service-requests", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function getServiceRequestById(id: string) {
  return apiClient<{ data: unknown }>(`/service-requests/${id}`, { method: "GET" });
}

export function getAllFeedback(params?: OversightFilter) {
  return apiClient<{ data: unknown[]; meta?: unknown }>("/feedback", {
    method: "GET",
    params: cleanParams(params),
  });
}
