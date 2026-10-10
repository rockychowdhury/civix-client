import apiClient from "@/lib/apiClient";
import type {
  IssuesByDepartment,
  IssuesByWard,
  PlatformDashboardStats,
  SuperAdminOverviewData,
  SuperAdminTimeRange,
} from "@/types";
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

/**
 * Super admin system overview — platform-wide KPIs, breakdowns, trends,
 * and actionable queues in a single cached response.
 * GET /api/v1/analytics/super-admin/overview
 */
export function getSuperAdminOverview(params?: { timeRange?: SuperAdminTimeRange }) {
  return apiClient<{
    data: SuperAdminOverviewData;
    success: boolean;
    statusCode: number;
    message: string;
  }>("/analytics/super-admin/overview", {
    method: "GET",
    params: cleanParams(params),
  });
}
