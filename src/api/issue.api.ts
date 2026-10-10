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

export interface DepartmentIssuesParams {
  stage?: "queue" | "in_progress" | "resolved" | "escalated" | string;
  status?: string;
  priority?: string;
  wardId?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getDepartmentIssues(
  departmentId: string,
  params?: DepartmentIssuesParams,
): Promise<{
  data: CivicIssue[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
}> {
  const { stage, ...queryParams } = params || {};
  let path = `/civic-issues/department/${departmentId}`;

  if (stage === "queue") {
    path = `/civic-issues/department/${departmentId}/queue`;
  } else if (stage === "in_progress" || stage === "in-progress") {
    path = `/civic-issues/department/${departmentId}/in-progress`;
  } else if (stage === "resolved") {
    path = `/civic-issues/department/${departmentId}/resolved`;
  } else if (stage === "escalated") {
    path = `/civic-issues/department/${departmentId}/escalated`;
  } else if (stage) {
    (queryParams as any).stage = stage;
  }

  const res = await apiClient(path, {
    params: cleanParams(queryParams),
  });
  return res as { data: CivicIssue[]; meta?: any };
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
