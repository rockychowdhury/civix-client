import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkOrder } from "@/api/work-order.api";
import type { ICreateWorkOrderPayload, CivicIssue } from "@/types";

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICreateWorkOrderPayload) => createWorkOrder(payload),
    onSuccess: (workOrder, variables) => {
      // Assuming we want to update the issue list to reflect that it now has a work order
      queryClient.setQueriesData({ queryKey: ["civic-issues", "department"] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((issue: CivicIssue) => 
            issue.id === variables.civicIssueId 
              ? { ...issue, hasWorkOrder: true } 
              : issue
          ),
        };
      });
      // Optionally invalidate or update other related queries
    },
  });
}
