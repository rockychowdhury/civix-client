import apiClient from "@/lib/apiClient";
import type { CivicIssue } from "@/types";
import { cleanParams } from "@/utils";

export async function getMunicipalityIssues(
  municipalityId: string,
  params?: {
    searchTerm?: string;
    status?: string;
    priority?: string;
    departmentId?: string;
    wardId?: string;
    page?: number;
    limit?: number;
  },
): Promise<{
  data: CivicIssue[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
}> {
  const res = await apiClient(`/civic-issues/municipality/${municipalityId}`, {
    params: cleanParams(params),
  });
  return res as { data: CivicIssue[]; meta?: any };
}

export async function getPublicCivicIssue(issueNumber: string): Promise<CivicIssue> {
  const res = await apiClient(`/civic-issues/public/${issueNumber}`);
  return res.data as CivicIssue;
}

export async function getDepartmentIssues(
  departmentId: string,
  filters?: Record<string, string>,
): Promise<{ data: CivicIssue[] }> {
  const searchParams = new URLSearchParams(filters);
  const res = await apiClient(`/civic-issues/department/${departmentId}`);
  return res as { data: CivicIssue[] };
}

export async function overrideIssuePriority(
  id: string,
  payload: { priority: string; reason: string },
): Promise<CivicIssue> {
  const res = await apiClient(`/civic-issues/${id}/priority`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data as CivicIssue;
}

export async function updateIssueStatus(
  id: string,
  payload: { status: string; notes?: string },
): Promise<CivicIssue> {
  const res = await apiClient(`/civic-issues/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data as CivicIssue;
}
