import apiClient from "@/lib/apiClient";
import type { IssuesByDepartment, IssuesByWard, PlatformDashboardStats } from "@/types";
import { cleanParams } from "@/utils";

export function getPlatformDashboard() {
  return apiClient<{ data: PlatformDashboardStats }>("/analytics/dashboard", {
    method: "GET",
  });
}

export function getIssuesByDepartment(params?: { municipalityId?: string }) {
  return apiClient<{ data: IssuesByDepartment[] }>("/analytics/issues-by-department", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function getIssuesByWard(params?: { municipalityId?: string }) {
  return apiClient<{ data: IssuesByWard[] }>("/analytics/issues-by-ward", {
    method: "GET",
    params: cleanParams(params),
  });
}

export function getAnalyticsOverview(params?: { municipalityId?: string }) {
  return apiClient<{ data: PlatformDashboardStats }>("/analytics/dashboard", {
    method: "GET",
    params: cleanParams(params),
  });
}
