import apiClient from "@/lib/apiClient";
import type { CivicIssue } from "@/types";

export async function getPublicCivicIssue(issueNumber: string): Promise<CivicIssue> {
  const res = await apiClient(`/civic-issues/public/${issueNumber}`);
  return res.data as CivicIssue;
}
