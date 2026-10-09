import apiClient from "@/lib/apiClient";
import type { CivicIssue } from "@/types";

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
