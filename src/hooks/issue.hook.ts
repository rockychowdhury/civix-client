import { useQuery } from "@tanstack/react-query";
import { getPublicCivicIssue } from "@/api/issue.api";
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
