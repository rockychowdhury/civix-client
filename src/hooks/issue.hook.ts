import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublicCivicIssue, getDepartmentIssues, overrideIssuePriority, updateIssueStatus } from "@/api/issue.api";
import type { CivicIssue } from "@/types";

export function useCivicIssueTracking(issueNumber: string) {
  return useQuery<CivicIssue>({
    queryKey: ["civic-issue", "public", issueNumber],
    queryFn: () => getPublicCivicIssue(issueNumber),
    enabled: !!issueNumber,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useDepartmentIssues(departmentId?: string, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["civic-issues", "department", departmentId, filters],
    queryFn: () => getDepartmentIssues(departmentId!, filters),
    enabled: !!departmentId,
  });
}

export function useOverrideIssuePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { priority: string; reason: string } }) =>
      overrideIssuePriority(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueriesData({ queryKey: ["civic-issues", "department"] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((issue: CivicIssue) => (issue.id === updated.id ? updated : issue)),
        };
      });
      queryClient.setQueryData(["civic-issue", "detail", updated.id], updated);
    },
  });
}

export function useUpdateIssueStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: string; notes?: string } }) =>
      updateIssueStatus(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueriesData({ queryKey: ["civic-issues", "department"] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((issue: CivicIssue) => (issue.id === updated.id ? updated : issue)),
        };
      });
      queryClient.setQueryData(["civic-issue", "detail", updated.id], updated);
    },
  });
}
