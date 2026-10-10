import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type DepartmentIssuesParams,
  getDepartmentIssues,
  getPublicCivicIssue,
  overrideIssuePriority,
  updateIssueStatus,
} from "@/api/issue.api";
import { getCivicIssueById } from "@/api/oversight.api";
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

export function useDepartmentIssues(departmentId?: string, params?: DepartmentIssuesParams) {
  return useQuery({
    queryKey: ["civic-issues", "department", departmentId, params],
    queryFn: () => {
      if (!departmentId) throw new Error("Department ID required");
      return getDepartmentIssues(departmentId, params);
    },
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

export function useCivicIssueById(id?: string) {
  return useQuery({
    queryKey: ["civic-issue", "detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Issue ID is required");
      const res = await getCivicIssueById(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}
