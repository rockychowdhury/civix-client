import { useQuery } from "@tanstack/react-query";
import { ADMIN_QUERY_KEYS } from "@/constant/admin.constant";
import {
  getAnalyticsOverview,
  getIssuesByDepartment,
  getIssuesByWard,
  getPlatformDashboard,
} from "../api";

export function useGetPlatformDashboard(params?: { municipalityId?: string }) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.analytics, "dashboard", params],
    queryFn: () => (params ? getAnalyticsOverview(params) : getPlatformDashboard()),
  });
}

export function useGetIssuesByDepartment(params?: { municipalityId?: string }) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.analytics, "by-department", params],
    queryFn: () => getIssuesByDepartment(params),
  });
}

export function useGetIssuesByWard(params?: { municipalityId?: string }) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.analytics, "by-ward", params],
    queryFn: () => getIssuesByWard(params),
  });
}
